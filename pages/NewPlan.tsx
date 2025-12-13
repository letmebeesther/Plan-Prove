
import React, { useState, useRef } from 'react';
import { 
    Calendar, Target, AlignLeft, AlertCircle, Plus, Trash2, X, Sparkles, Clock, Wand2, GripVertical, Activity
} from 'lucide-react';
import { generateAIPlan, generateAIEvidenceSuggestions } from '../services/geminiService';
import { createPlan } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { SubGoal } from '../types';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const categories = ['건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서', '운동'];

export function NewPlan() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Confirmation State
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

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('건강관리');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  
  const [executionStartTime, setExecutionStartTime] = useState('');
  const [executionEndTime, setExecutionEndTime] = useState('');
  
  const [subGoals, setSubGoals] = useState<Partial<SubGoal>[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState<number | null>(null);

  // Drag and Drop Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const getMaxEndDate = () => {
      const start = new Date(startDate);
      const maxDate = new Date(start);
      maxDate.setDate(maxDate.getDate() + 180); // Max 6 months
      return maxDate.toISOString().split('T')[0];
  };

  const handleOpenAIModal = () => {
      if (!title) return alert('계획 제목을 먼저 입력해주세요.');
      if (!startDate || !endDate) return alert('시작일과 마감일을 입력해주세요.');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 180) {
          return alert('최대 기간은 6개월(180일)입니다. 더 긴 목표는 "파트 2"로 나누어 계획을 세워주세요.');
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
              dueTime: executionEndTime || executionStartTime || '' 
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
        executionStartTime: executionStartTime,
        executionEndTime: executionEndTime
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
        alert(`AI가 ${datedGoals.length}개의 세부 목표를 생성했습니다!`);
      } else {
        setAiError('목표 생성에 실패했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(`오류가 발생했습니다: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSubGoal = () => {
      setSubGoals([...subGoals, { 
          title: '', 
          description: '', 
          dueDate: endDate || startDate,
          dueTime: executionEndTime || executionStartTime || '',
          evidenceTypes: ['PHOTO']
      }]);
  };

  const handleRemoveSubGoal = (index: number) => {
      setSubGoals(subGoals.filter((_, i) => i !== index));
  };

  const handleSubGoalChange = (index: number, field: string, value: any) => {
      const newGoals = [...subGoals];
      newGoals[index] = { ...newGoals[index], [field]: value };
      setSubGoals(newGoals);
  };

  const handleGenerateOneEvidence = async (index: number) => {
      const sg = subGoals[index];
      if (!sg.title) return alert('목표 제목을 입력해주세요.');
      setLoadingEvidence(index);
      try {
          const timeContext = executionStartTime + (executionEndTime ? ` ~ ${executionEndTime}` : '');
          const suggestions = await generateAIEvidenceSuggestions(sg.title!, sg.description || '', currentUser?.hasWearable || false, timeContext);
          if (suggestions && suggestions.length > 0) {
              const best = suggestions[0];
              const newGoals = [...subGoals];
              newGoals[index] = {
                  ...newGoals[index],
                  evidenceTypes: [best.type],
                  evidenceDescription: best.description,
                  // Save metadata from AI suggestion to state
                  exampleTimeMetadata: best.timeMetadata,
                  exampleBiometricData: best.biometricData,
                  exampleLocationMetadata: best.locationMetadata
              };
              setSubGoals(newGoals);
          }
      } catch (e: any) {
          alert(`오류가 발생했습니다: ${e.message}`);
      } finally {
          setLoadingEvidence(null);
      }
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      dragItem.current = index;
      e.dataTransfer.effectAllowed = "move";
      // Optional: Add a class to hide the original or style it
      e.currentTarget.style.opacity = '0.5';
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      if (dragItem.current === null) return;
      if (dragItem.current === index) return;

      const newList = [...subGoals];
      const draggedItemContent = newList[dragItem.current];
      
      newList.splice(dragItem.current, 1);
      newList.splice(index, 0, draggedItemContent);

      dragItem.current = index;
      setSubGoals(newList);
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.style.opacity = '1';
      dragItem.current = null;
      dragOverItem.current = null;
  };

  const handleSave = async () => {
      if (!currentUser) return alert('로그인이 필요합니다.');
      if (!title) return alert('제목을 입력해주세요.');
      if (!startDate || !endDate) return alert('기간을 설정해주세요.');
      if (subGoals.length === 0) return alert('최소 1개 이상의 세부 목표가 필요합니다.');
      
      setSaving(true);
      try {
          const planData = {
              title,
              description,
              category,
              startDate,
              endDate,
              executionTime: executionStartTime,
              executionEndTime: executionEndTime,
              subGoals: subGoals.map((sg, idx) => ({
                  id: `sg-${Date.now()}-${idx}`,
                  title: sg.title || `목표 ${idx+1}`,
                  description: sg.description || '',
                  status: 'pending',
                  dueDate: sg.dueDate || endDate,
                  dueTime: sg.dueTime || executionEndTime || executionStartTime,
                  evidenceTypes: sg.evidenceTypes || ['PHOTO'],
                  evidenceDescription: sg.evidenceDescription,
                  startDate: sg.startDate || startDate,
                  difficulty: sg.difficulty || 'MEDIUM',
                  // Save Metadata
                  exampleTimeMetadata: sg.exampleTimeMetadata,
                  exampleBiometricData: sg.exampleBiometricData,
                  exampleLocationMetadata: sg.exampleLocationMetadata,
                  evidences: []
              })),
              progress: 0,
              createdAt: new Date().toISOString()
          };

          const planId = await createPlan(currentUser.id, planData);
          navigate(`/plan/${planId}`);
      } catch (e) {
          console.error(e);
          alert('계획 생성 중 오류가 발생했습니다.');
      } finally {
          setSaving(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
        {/* Simple Header */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">새 계획 만들기</h1>
            <p className="text-gray-500 mt-1">목표를 설정하고 세부 실천 계획을 세워보세요.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
            {/* Title */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">계획 제목</label>
                <input 
                    type="text" 
                    className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 border placeholder-gray-300"
                    placeholder="예: 30일 만에 파이썬 기초 끝내기"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Category */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">카테고리</label>
                <select 
                    className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white border"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">시작일</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 border"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">마감일</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 border"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            max={getMaxEndDate()}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-right">최대 3개월(6개월)까지 설정 가능</p>
                </div>
            </div>

            {/* Time */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">주로 실천할 시간 (선택)</label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="time" 
                            className="w-full rounded-xl border-gray-300 pl-10 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 border"
                            value={executionStartTime}
                            onChange={(e) => setExecutionStartTime(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">부터</span>
                    </div>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="time" 
                            className="w-full rounded-xl border-gray-300 pl-10 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 border"
                            value={executionEndTime}
                            onChange={(e) => setExecutionEndTime(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">까지</span>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">설정한 시간에 알림을 보내드립니다.</p>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">설명</label>
                <textarea 
                    className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 min-h-[100px] resize-none border placeholder-gray-300"
                    placeholder="이 계획을 통해 이루고 싶은 목표나 다짐을 적어주세요."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {/* Sub-Goals Section */}
            <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <AlignLeft className="w-4 h-4" /> 세부 목표 설정 ({subGoals.length})
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleOpenAIModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> AI 자동 생성
                        </button>
                        <button 
                            onClick={handleAddSubGoal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> 직접 추가
                        </button>
                    </div>
                </div>

                {subGoals.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
                        <Target className="w-10 h-10 text-gray-300 mb-3 opacity-50" />
                        <p className="text-gray-400 text-sm font-medium">세부 목표가 없습니다.</p>
                        <p className="text-gray-400 text-xs mt-1 opacity-70">'AI 자동 생성' 또는 '직접 추가'를 이용해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subGoals.map((sg, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group hover:border-primary-300 transition-colors"
                                draggable
                                onDragStart={(e) => onDragStart(e, idx)}
                                onDragEnter={(e) => onDragEnter(e, idx)}
                                onDragEnd={onDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <button 
                                    onClick={() => handleRemoveSubGoal(idx)}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1 z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-3 mb-3 pr-8">
                                    <div className="cursor-move text-gray-300 hover:text-gray-500 p-1 -ml-2 rounded transition-colors" title="드래그하여 순서 변경">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                        {idx + 1}
                                    </span>
                                    <input 
                                        type="text" 
                                        placeholder="세부 목표 제목" 
                                        className="flex-1 font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-300 text-sm bg-transparent"
                                        value={sg.title}
                                        onChange={(e) => handleSubGoalChange(idx, 'title', e.target.value)}
                                    />
                                </div>

                                <div className="pl-9 space-y-3">
                                    <textarea 
                                        placeholder="구체적인 실천 내용" 
                                        className="w-full text-xs border-gray-200 rounded-lg p-2 focus:border-primary-500 focus:ring-primary-500 resize-none h-16 bg-gray-50 border"
                                        value={sg.description}
                                        onChange={(e) => handleSubGoalChange(idx, 'description', e.target.value)}
                                    />
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="block text-[10px] text-gray-400 mb-1">마감 날짜</label>
                                            <input 
                                                type="date" 
                                                className="w-full text-xs border-gray-200 rounded-lg p-2 border"
                                                value={sg.dueDate}
                                                onChange={(e) => handleSubGoalChange(idx, 'dueDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[100px]">
                                            <label className="block text-[10px] text-gray-400 mb-1">마감 시간</label>
                                            <input 
                                                type="time" 
                                                className="w-full text-xs border-gray-200 rounded-lg p-2 border bg-white"
                                                value={sg.dueTime || ''}
                                                onChange={(e) => handleSubGoalChange(idx, 'dueTime', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Display AI Metadata if available */}
                                    {sg.exampleBiometricData && (
                                        <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-2">
                                            <Activity className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-indigo-700 block">AI 권장 생체 데이터</span>
                                                <span className="text-xs text-indigo-600">{sg.exampleBiometricData}</span>
                                            </div>
                                        </div>
                                    )}

                                    {sg.title && (
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => handleGenerateOneEvidence(idx)}
                                                className="text-[10px] text-primary-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                                                disabled={loadingEvidence === idx}
                                            >
                                                {loadingEvidence === idx ? '생성 중...' : <><Sparkles className="w-3 h-3" /> AI 추천 인증법</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex gap-3">
                <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => navigate(-1)} 
                    disabled={saving}
                    className="bg-gray-100 py-3 rounded-xl hover:bg-gray-200"
                >
                    취소
                </Button>
                <Button 
                    fullWidth 
                    onClick={handleSave} 
                    disabled={saving}
                    className="py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200"
                >
                    {saving ? '저장 중...' : <><Target className="w-4 h-4 mr-2" /> 계획 생성 완료</>}
                </Button>
            </div>
        </div>

        {/* AI Modal */}
        {showAIModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => !aiLoading && setShowAIModal(false)}>
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowAIModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" disabled={aiLoading}><X className="w-5 h-5" /></button>
                    
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 text-violet-600">
                            <Wand2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">AI 플랜 생성</h3>
                        <p className="text-sm text-gray-500">입력하신 정보를 바탕으로 루틴을 제안합니다.</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">난이도</label>
                            <div className="flex gap-2">
                                {['초급', '중급', '고급'].map(l => (
                                    <button 
                                        key={l}
                                        onClick={() => setLevelInput(l)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${levelInput === l ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">스타일</label>
                            <div className="flex gap-2">
                                {['꾸준하게', '단기간 집중', '여유롭게'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setStyleInput(s)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${styleInput === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {aiError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {aiError}
                        </div>
                    )}

                    <Button fullWidth onClick={handleAiGenerateSubGoals} disabled={aiLoading} className="bg-violet-600 hover:bg-violet-700 text-white">
                        {aiLoading ? '생성 중...' : '플랜 생성 시작'}
                    </Button>
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
