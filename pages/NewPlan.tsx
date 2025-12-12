
import React, { useState } from 'react';
import { 
    Wand2, Calendar, Target, AlignLeft, AlertCircle, Plus, Trash2, ArrowRight, 
    Check, Sparkles, Save, X, ArrowUp, ArrowDown, HelpCircle, Clock, Activity, MousePointerClick, MapPin, Mail, Link as LinkIcon, Layers
} from 'lucide-react';
import { generateAIPlan, AIPlanResponse, generateAIEvidenceSuggestions } from '../services/geminiService';
import { createPlan } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useNavigate } from 'react-router-dom';
import { SubGoal, EvidenceOption } from '../types';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const categories = ['건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서', '운동'];

export function NewPlan() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // AI Generator Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      isDangerous?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // AI Inputs
  const [levelInput, setLevelInput] = useState('초급');
  const [styleInput, setStyleInput] = useState('꾸준하게');

  // Main Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('건강관리');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [executionTime, setExecutionTime] = useState(''); 
  
  // SubGoals State
  const [subGoals, setSubGoals] = useState<Partial<SubGoal>[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState<number | null>(null); // Index of sub-goal loading suggestions

  // Helper to calculate max end date (3 months from start)
  const getMaxEndDate = () => {
      const start = new Date(startDate);
      const maxDate = new Date(start);
      maxDate.setDate(maxDate.getDate() + 90); // 3 months limit
      return maxDate.toISOString().split('T')[0];
  };

  // --- Handlers ---

  const handleOpenAIModal = () => {
      if (!title) return alert('계획 제목을 먼저 입력해주세요.');
      if (!startDate || !endDate) return alert('시작일과 마감일을 입력해주세요.');
      // Enforce Time Input for AI
      if (!executionTime) return alert('AI 생성을 위해 [주로 실천할 시간]을 먼저 입력해주세요. (필수)');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
          return alert('최대 기간은 3개월(90일)입니다. 더 긴 목표는 "파트 2"로 나누어 계획을 세워주세요.');
      }
      
      if (endDate < startDate) return alert('마감일은 시작일보다 이후여야 합니다.');
      
      setShowAIModal(true);
  };

  const distributeDates = (items: any[]) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalTime = end.getTime() - start.getTime();
      const interval = totalTime / items.length;

      return items.map((item, index) => {
          const itemStart = new Date(start.getTime() + (interval * index));
          const itemEnd = new Date(start.getTime() + (interval * (index + 1)));
          return {
              ...item,
              startDate: itemStart.toISOString().split('T')[0],
              dueDate: itemEnd.toISOString().split('T')[0],
              dueTime: executionTime || '' 
          };
      });
  };

  const handleAiGenerateSubGoals = async () => {
    setAiLoading(true);
    setAiError('');
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const durationStr = `${diffDays}일`;
      const promptGoal = `${title}. ${description}`;

      const plan = await generateAIPlan({
        goal: promptGoal,
        duration: durationStr,
        level: levelInput,
        style: styleInput,
        hasWearable: currentUser?.hasWearable || false,
        executionTime: executionTime // Pass execution time to AI
      });

      if (plan) {
        const generatedGoals = plan.subGoals.map(sg => {
            const firstOption = sg.evidenceOptions && sg.evidenceOptions.length > 0 ? sg.evidenceOptions[0] : null;
            return {
                title: sg.title,
                description: sg.description,
                status: 'pending' as const,
                difficulty: sg.difficulty,
                evidenceOptions: [], 
                evidenceTypes: firstOption ? [firstOption.type] : ['PHOTO'],
                evidenceDescription: firstOption?.description || '',
                exampleTimeMetadata: firstOption?.timeMetadata || '',
                exampleBiometricData: firstOption?.biometricData || '',
                exampleLocationMetadata: firstOption?.locationMetadata || ''
            };
        });

        const datedGoals = distributeDates(generatedGoals);
        setSubGoals(datedGoals);
        setShowAIModal(false);
        alert(`AI가 ${datedGoals.length}개의 세부 목표를 생성했습니다! 각 목표에 맞는 인증 방식을 설정해주세요.`);
      } else {
        setAiError('목표 생성에 실패했습니다.');
      }
    } catch (err) {
      setAiError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSubGoal = () => {
      if (subGoals.length >= 100) {
          alert('중간 목표는 최대 100개까지만 생성 가능합니다.');
          return;
      }
      const newGoal: Partial<SubGoal> = { 
          title: '', 
          description: '', 
          status: 'pending',
          startDate: startDate,
          dueDate: endDate,
          dueTime: executionTime || '',
          difficulty: 'MEDIUM',
          evidenceTypes: ['PHOTO'],
          evidenceDescription: '',
          exampleBiometricData: '',
          exampleLocationMetadata: ''
      };
      setSubGoals([...subGoals, newGoal]);
  };

  const handleRemoveSubGoal = (index: number) => {
      setConfirmConfig({
          isOpen: true,
          title: '목표 삭제',
          message: '이 중간 목표를 삭제하시겠습니까?',
          isDangerous: true,
          onConfirm: () => {
              setSubGoals(prev => prev.filter((_, i) => i !== index));
              setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleSubGoalChange = (index: number, field: keyof SubGoal, value: any) => {
      const newSubGoals = [...subGoals];
      newSubGoals[index] = { ...newSubGoals[index], [field]: value };
      setSubGoals(newSubGoals);
  };

  const handleToggleEvidenceType = (index: number, type: string) => {
      const newSubGoals = [...subGoals];
      const currentTypes = newSubGoals[index].evidenceTypes || [];
      
      if (currentTypes.includes(type as any)) {
          newSubGoals[index].evidenceTypes = currentTypes.filter(t => t !== type) as any;
      } else {
          newSubGoals[index].evidenceTypes = [...currentTypes, type as any];
      }
      setSubGoals(newSubGoals);
  };

  const handleGenerateEvidenceSuggestions = async (index: number) => {
      const goal = subGoals[index];
      if (!goal.title) return alert('목표 제목을 먼저 입력해주세요.');

      setLoadingEvidence(index);
      try {
          const timeContext = goal.dueTime || executionTime;
          const suggestions = await generateAIEvidenceSuggestions(
              goal.title!, 
              goal.description || '', 
              currentUser?.hasWearable || false,
              timeContext
          );
          
          const newSubGoals = [...subGoals];
          newSubGoals[index].evidenceOptions = suggestions;
          setSubGoals(newSubGoals);
      } catch (e) {
          alert('증거물 예시 생성 실패');
      } finally {
          setLoadingEvidence(null);
      }
  };

  const handleSelectEvidenceOption = (index: number, option: EvidenceOption) => {
      const newSubGoals = [...subGoals];
      newSubGoals[index] = {
          ...newSubGoals[index],
          evidenceTypes: [option.type], 
          evidenceDescription: option.description,
          exampleTimeMetadata: option.timeMetadata,
          exampleBiometricData: option.biometricData,
          exampleLocationMetadata: option.locationMetadata
      };
      setSubGoals(newSubGoals);
  };

  const handleBulkApplyEvidence = (index: number) => {
      setConfirmConfig({
          isOpen: true,
          title: '일괄 적용',
          message: '현재 목표의 [인증 방식, 설명, 메타데이터] 설정을\n아래에 있는 모든 목표에 적용하시겠습니까?',
          onConfirm: () => {
              setSubGoals(prev => {
                  const newSubGoals = [...prev];
                  const sourceGoal = newSubGoals[index];
                  
                  if (!sourceGoal) return prev;

                  const sourceEvidenceTypes = sourceGoal.evidenceTypes ? [...sourceGoal.evidenceTypes] : [];

                  for (let i = index + 1; i < newSubGoals.length; i++) {
                      newSubGoals[i] = {
                          ...newSubGoals[i],
                          evidenceTypes: [...sourceEvidenceTypes],
                          evidenceDescription: sourceGoal.evidenceDescription || '',
                          exampleTimeMetadata: sourceGoal.exampleTimeMetadata || '',
                          exampleBiometricData: sourceGoal.exampleBiometricData || '',
                          exampleLocationMetadata: sourceGoal.exampleLocationMetadata || ''
                      };
                  }
                  return newSubGoals;
              });
              setConfirmConfig(prev => ({ ...prev, isOpen: false }));
              // Small delay to allow render update before alert
              setTimeout(() => alert('일괄 적용되었습니다.'), 100);
          }
      });
  };

  const moveSubGoal = (index: number, direction: 'up' | 'down') => {
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === subGoals.length - 1)) return;
      const newSubGoals = [...subGoals];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSubGoals[index], newSubGoals[targetIndex]] = [newSubGoals[targetIndex], newSubGoals[index]];
      setSubGoals(newSubGoals);
  };

  const handleSavePlan = async () => {
      if (!currentUser) return alert('로그인이 필요합니다.');
      if (!title || !category || !startDate || !endDate) return alert('필수 정보를 모두 입력해주세요.');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (endDate < startDate) return alert('마감일은 시작일보다 이후여야 합니다.');
      
      if (diffDays > 90) {
          return alert('최대 기간은 3개월(90일)입니다. 더 긴 목표는 "파트 2"로 나누어 이어서 계획을 세워주세요.');
      }

      if (subGoals.length < 3) return alert('중간 목표는 최소 3개 이상이어야 합니다. (FR-077)');
      if (subGoals.some(sg => !sg.title)) return alert('모든 중간 목표의 제목을 입력해주세요. (FR-076)');
      if (subGoals.some(sg => !sg.evidenceTypes || sg.evidenceTypes.length === 0)) return alert('모든 중간 목표에 최소 1개 이상의 인증 방식을 선택해주세요.');

      setSaving(true);
      try {
          const planData = {
              title,
              category,
              description,
              startDate,
              endDate,
              executionTime, 
              subGoals: subGoals.map((sg, idx) => ({ ...sg, id: `sg-${Date.now()}-${idx}` })), 
          };
          
          await createPlan(currentUser.id, planData);
          alert(`"${title}" 계획이 생성되었습니다! 🎉`);
          navigate('/');
      } catch (error) {
          console.error(error);
          alert('계획 저장 중 오류가 발생했습니다.');
      } finally {
          setSaving(false);
      }
  };

  const evidenceTypesList = [
      { id: 'PHOTO', label: '📸 사진' },
      { id: 'VIDEO', label: '🎥 영상' },
      { id: 'TEXT', label: '✍️ 텍스트' },
      { id: 'APP_CAPTURE', label: '📱 캡처' },
      { id: 'BIOMETRIC', label: '⌚️ 생체' },
      { id: 'EMAIL', label: '📧 이메일' },
      { id: 'API', label: '🔗 API' },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
       <div className="mb-8 text-center sm:text-left">
         <h1 className="text-2xl font-bold text-gray-900">새 계획 만들기</h1>
         <p className="text-gray-500 mt-1">목표를 설정하고 세부 실천 계획을 세워보세요.</p>
       </div>

       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 relative">
         <div className="space-y-6">
            <Input 
                label="계획 제목" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="예: 30일 만에 파이썬 기초 끝내기" 
            />
            
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">카테고리</label>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    type="date" 
                    label="시작일" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                />
                <div className="relative">
                    <Input 
                        type="date" 
                        label="마감일" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        min={startDate}
                        max={getMaxEndDate()} 
                    />
                    <div className="text-[10px] text-gray-400 mt-1 text-right">최대 3개월까지 설정 가능</div>
                </div>
            </div>

            <div>
                <Input 
                    type="time" 
                    label="주로 실천할 시간 (선택)" 
                    value={executionTime} 
                    onChange={(e) => setExecutionTime(e.target.value)}
                    icon={<Clock className="w-5 h-5" />}
                    placeholder="매일 언제 실천할까요?"
                />
                <p className="text-[10px] text-gray-400 mt-1 pl-1">설정한 시간에 알림을 보내드립니다.</p>
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-700 mb-1.5">설명</label>
               <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={3} 
                    className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" 
                    placeholder="이 계획을 통해 이루고 싶은 목표나 다짐을 적어주세요." 
               />
            </div>

            <div className="border-t border-gray-100 pt-6 mt-6">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      <AlignLeft className="w-4 h-4" /> 세부 목표 설정 ({subGoals.length})
                  </label>
                  <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={handleOpenAIModal}
                        className="flex-1 sm:flex-none text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                          <Sparkles className="w-3.5 h-3.5" /> AI 자동 생성
                      </button>
                      <button 
                        onClick={handleAddSubGoal} 
                        disabled={subGoals.length >= 100}
                        className="flex-1 sm:flex-none text-xs bg-gray-100 text-gray-700 border border-gray-200 font-bold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                          <Plus className="w-3.5 h-3.5" /> 직접 추가
                      </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {subGoals.map((sg, idx) => (
                     <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:border-primary-200 group">
                        {/* Header Row */}
                        <div className="bg-gray-100/50 p-3 flex items-center gap-3 border-b border-gray-200">
                            <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500">
                                {idx + 1}
                            </span>
                            <input 
                                className="flex-1 bg-transparent border-none p-0 text-sm font-bold placeholder-gray-400 focus:ring-0" 
                                placeholder="목표 제목 입력 (필수)" 
                                value={sg.title || ''} 
                                onChange={(e) => handleSubGoalChange(idx, 'title', e.target.value)}
                            />
                            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveSubGoal(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                                <button onClick={() => moveSubGoal(idx, 'down')} disabled={idx === subGoals.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleRemoveSubGoal(idx)} disabled={subGoals.length <= 3} className="p-1 hover:bg-red-100 hover:text-red-500 rounded ml-1 disabled:opacity-30"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        
                        {/* Body */}
                        <div className="p-4 space-y-4">
                            <input 
                                className="w-full bg-transparent border-b border-gray-200 p-0 pb-2 text-xs text-gray-600 placeholder-gray-400 focus:ring-0 focus:border-primary-500" 
                                placeholder="상세 설명 (선택)" 
                                value={sg.description || ''} 
                                onChange={(e) => handleSubGoalChange(idx, 'description', e.target.value)}
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">기간</label>
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-gray-400 w-6">시작</span>
                                            <input type="date" value={sg.startDate || ''} onChange={(e) => handleSubGoalChange(idx, 'startDate', e.target.value)} className="flex-1 bg-white border border-gray-300 rounded p-1" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-gray-400 w-6">마감</span>
                                            <input type="date" value={sg.dueDate || ''} onChange={(e) => handleSubGoalChange(idx, 'dueDate', e.target.value)} className="flex-1 bg-white border border-gray-300 rounded p-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">마감 시간</label>
                                        <input 
                                            type="time" 
                                            value={sg.dueTime || ''} 
                                            onChange={(e) => handleSubGoalChange(idx, 'dueTime', e.target.value)} 
                                            className="w-full bg-white border border-gray-300 rounded p-1 text-xs" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                                        <MousePointerClick className="w-3 h-3" /> 인증 방식 설정
                                    </div>
                                    <button 
                                        onClick={() => handleGenerateEvidenceSuggestions(idx)}
                                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                        disabled={loadingEvidence === idx}
                                    >
                                        <Sparkles className="w-3 h-3" /> {loadingEvidence === idx ? '분석 중...' : 'AI 예시 받기'}
                                    </button>
                                </div>
                                
                                {sg.evidenceOptions && sg.evidenceOptions.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                        {sg.evidenceOptions.map((opt, optIdx) => (
                                            <div 
                                                key={optIdx} 
                                                onClick={() => handleSelectEvidenceOption(idx, opt)}
                                                className="p-2 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-sm bg-indigo-50 border-indigo-200"
                                            >
                                                <div className="font-bold mb-1 flex items-center gap-1">
                                                    {opt.type === 'PHOTO' && '📸 사진'}
                                                    {opt.type === 'VIDEO' && '🎥 영상'}
                                                    {opt.type === 'TEXT' && '✍️ 텍스트'}
                                                    {opt.type === 'APP_CAPTURE' && '📱 캡처'}
                                                    {opt.type === 'BIOMETRIC' && '⌚️ 생체'}
                                                    {opt.type === 'EMAIL' && '📧 이메일'}
                                                    {opt.type === 'API' && '🔗 API'}
                                                </div>
                                                <p className="text-gray-600 line-clamp-2 leading-tight">{opt.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {/* Multiple Selection Toggle Buttons */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-[10px] font-bold text-gray-500">허용할 인증 수단 (다중 선택)</label>
                                            {/* Bulk Apply Button */}
                                            {idx < subGoals.length - 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleBulkApplyEvidence(idx);
                                                    }}
                                                    className="text-[10px] text-gray-500 hover:text-indigo-600 hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-1 transition-colors border border-transparent hover:border-gray-200"
                                                    title="이 설정(방식,설명,메타데이터)을 남은 모든 목표에 복사합니다"
                                                >
                                                    <Layers className="w-3 h-3" /> 나머지 일괄 적용
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {evidenceTypesList.map(type => {
                                                const isSelected = sg.evidenceTypes?.includes(type.id as any);
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => handleToggleEvidenceType(idx, type.id)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                                                            isSelected 
                                                            ? 'bg-gray-800 text-white border-gray-800' 
                                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {type.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <input 
                                        className="w-full bg-white border border-gray-300 rounded p-2 text-xs placeholder-gray-400"
                                        placeholder="구체적인 인증 방법을 입력하세요 (예: 운동 완료 화면 캡처)"
                                        value={sg.evidenceDescription || ''}
                                        onChange={(e) => handleSubGoalChange(idx, 'evidenceDescription', e.target.value)}
                                    />
                                    
                                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="font-bold whitespace-nowrap">장소(GPS):</span>
                                        <input
                                            className="flex-1 bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none px-1 text-blue-800 placeholder-blue-300"
                                            placeholder="예: 헬스장, 도서관 (선택)"
                                            value={sg.exampleLocationMetadata || ''}
                                            onChange={(e) => handleSubGoalChange(idx, 'exampleLocationMetadata', e.target.value)}
                                        />
                                    </div>

                                    {/* Show Biometric Input if user has wearable OR if BIOMETRIC is selected */}
                                    {(currentUser?.hasWearable || sg.evidenceTypes?.includes('BIOMETRIC')) && (
                                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                                            <Activity className="w-3.5 h-3.5" />
                                            <span className="font-bold whitespace-nowrap">생체 데이터 목표:</span>
                                            <input
                                                className="flex-1 bg-transparent border-b border-green-200 focus:border-green-500 outline-none px-1 text-green-800 placeholder-green-300"
                                                placeholder="예: 심박수 120bpm 이상, 5000보 달성"
                                                value={sg.exampleBiometricData || ''}
                                                onChange={(e) => handleSubGoalChange(idx, 'exampleBiometricData', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                     </div>
                  ))}
                  
                  {subGoals.length === 0 && (
                     <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm bg-gray-50/50">
                        <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>세부 목표가 없습니다.<br/>'AI 자동 생성' 또는 '직접 추가'를 이용해보세요.</p>
                     </div>
                  )}
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
               <Button variant="secondary" fullWidth onClick={() => navigate(-1)} disabled={saving}>취소</Button>
               <Button fullWidth onClick={handleSavePlan} disabled={saving} className="flex items-center gap-2 justify-center">
                   {saving ? '저장 중...' : <><Save className="w-4 h-4" /> 계획 생성 완료</>}
               </Button>
            </div>
         </div>
       </div>

       {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => !aiLoading && setShowAIModal(false)}>
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                {/* AI Modal Content */}
                <button 
                    onClick={() => setShowAIModal(false)}
                    disabled={aiLoading} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-900">
                        <Sparkles className="w-5 h-5 text-indigo-500" /> AI 세부 목표 생성
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">입력하신 제목과 기간을 바탕으로<br/>최적의 로드맵을 설계해드립니다.</p>
                </div>

                <div className="space-y-5">
                    {/* Analysis Target Summary */}
                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <div className="text-xs text-indigo-500 font-bold mb-1">분석 대상</div>
                        <div className="text-sm font-bold text-indigo-900 truncate">{title}</div>
                        <div className="text-xs text-indigo-700 mt-0.5">{startDate} ~ {endDate}</div>
                        {executionTime && <div className="text-xs text-indigo-700 mt-0.5">매일 {executionTime} 실천</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">난이도</label>
                            <select value={levelInput} onChange={(e) => setLevelInput(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 text-sm">
                                <option value="초급">초급</option>
                                <option value="중급">중급</option>
                                <option value="고급">고급</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">스타일</label>
                            <select value={styleInput} onChange={(e) => setStyleInput(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 text-sm">
                                <option value="꾸준하게">꾸준하게</option>
                                <option value="집중적으로">집중적으로</option>
                                <option value="유동적으로">유동적으로</option>
                            </select>
                        </div>
                    </div>

                    {aiError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {aiError}</div>}

                    <Button fullWidth onClick={handleAiGenerateSubGoals} disabled={aiLoading} className="bg-indigo-600 hover:bg-indigo-700 border-none text-white py-3 shadow-lg shadow-indigo-200">
                        {aiLoading ? 'AI가 로드맵을 설계 중...' : '세부 목표 생성하기'}
                    </Button>
                </div>
            </div>
        </div>
       )}

       <ConfirmDialog 
           isOpen={confirmConfig.isOpen}
           title={confirmConfig.title}
           message={confirmConfig.message}
           onConfirm={confirmConfig.onConfirm}
           onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
           isDangerous={confirmConfig.isDangerous}
       />
    </div>
  );
}
