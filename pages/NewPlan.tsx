
import React, { useState } from 'react';
import { Wand2, Calendar, Target, AlignLeft, AlertCircle, Plus, Trash2, ArrowRight, Check, Sparkles, Save } from 'lucide-react';
import { generateAIPlan, AIPlanResponse } from '../services/geminiService';
import { createPlan } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useNavigate } from 'react-router-dom';

const categories = ['건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서', '운동'];

export function NewPlan() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // AI Generator State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [durationInput, setDurationInput] = useState('30일');
  const [levelInput, setLevelInput] = useState('초급');
  const [styleInput, setStyleInput] = useState('꾸준하게');
  const [generatedPlan, setGeneratedPlan] = useState<AIPlanResponse | null>(null);

  // Manual Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('건강관리');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [subGoals, setSubGoals] = useState<{title: string, description: string}[]>([]);
  const [saving, setSaving] = useState(false);

  // Handlers
  const handleGenerate = async () => {
    if (!goalInput) return;
    
    setAiLoading(true);
    setAiError('');
    setGeneratedPlan(null);
    
    try {
      const plan = await generateAIPlan({
        goal: goalInput,
        duration: durationInput,
        level: levelInput,
        style: styleInput
      });
      setGeneratedPlan(plan);
    } catch (err) {
      setAiError('플랜 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAI = () => {
    if (!generatedPlan) return;
    
    setTitle(generatedPlan.title);
    setCategory(generatedPlan.category);
    setDescription(generatedPlan.description);
    
    // Convert AI subgoals to form format
    const newSubGoals = generatedPlan.subGoals.map(sg => ({
        title: sg.title,
        description: sg.description
    }));
    setSubGoals(newSubGoals);
    
    // Scroll to form top on mobile if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubGoal = () => {
      setSubGoals([...subGoals, { title: '', description: '' }]);
  };

  const handleRemoveSubGoal = (index: number) => {
      setSubGoals(subGoals.filter((_, i) => i !== index));
  };

  const handleSubGoalChange = (index: number, field: 'title' | 'description', value: string) => {
      const newSubGoals = [...subGoals];
      newSubGoals[index][field] = value;
      setSubGoals(newSubGoals);
  };

  const handleSavePlan = async () => {
      if (!currentUser) {
          alert('로그인이 필요합니다.');
          return;
      }
      if (!title || !category || !startDate) {
          alert('필수 정보를 모두 입력해주세요.');
          return;
      }

      setSaving(true);
      try {
          const planData = {
              title,
              category,
              description,
              startDate,
              endDate: endDate || startDate, // Fallback
              subGoals,
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

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-fade-in">
       {/* Header */}
       <div>
         <h1 className="text-2xl font-bold text-gray-900">새 계획 만들기</h1>
         <p className="text-gray-500 mt-1">AI의 도움을 받아 스마트하게 계획을 세우거나, 직접 나만의 로드맵을 설계해보세요.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: AI Assistant */}
          <section className="space-y-6">
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                   <Wand2 className="w-40 h-40" />
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-6">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        AI 계획 생성기
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-indigo-900 mb-2">어떤 목표를 이루고 싶으신가요?</label>
                            <textarea 
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                placeholder="예: 3개월 안에 토익 900점 달성하기, 매일 30분 달리기 습관 만들기..."
                                className="w-full p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 resize-none h-28 text-sm bg-white/80 backdrop-blur-sm"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-indigo-800 mb-1.5">기간</label>
                                <select 
                                    value={durationInput}
                                    onChange={(e) => setDurationInput(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 bg-white/80"
                                >
                                    <option value="1주">1주</option>
                                    <option value="2주">2주</option>
                                    <option value="30일">30일</option>
                                    <option value="3개월">3개월</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-indigo-800 mb-1.5">난이도</label>
                                <select 
                                     value={levelInput}
                                     onChange={(e) => setLevelInput(e.target.value)}
                                     className="w-full p-2.5 rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 bg-white/80"
                                >
                                    <option value="초급">초급</option>
                                    <option value="중급">중급</option>
                                    <option value="고급">고급</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-indigo-800 mb-1.5">스타일</label>
                                <select 
                                     value={styleInput}
                                     onChange={(e) => setStyleInput(e.target.value)}
                                     className="w-full p-2.5 rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 bg-white/80"
                                >
                                    <option value="꾸준하게">꾸준하게</option>
                                    <option value="집중적으로">집중적으로</option>
                                    <option value="유동적으로">유동적으로</option>
                                </select>
                            </div>
                        </div>

                        {aiError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 font-medium">
                                <AlertCircle className="w-4 h-4" />
                                {aiError}
                            </div>
                        )}

                        <Button 
                            onClick={handleGenerate}
                            disabled={aiLoading || !goalInput}
                            fullWidth
                            className={`py-3 shadow-lg shadow-indigo-500/20 ${aiLoading ? 'opacity-80' : ''}`}
                        >
                            {aiLoading ? (
                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 생각하는 중...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Gemini로 생성하기</span>
                            )}
                        </Button>
                    </div>
                </div>
             </div>

             {/* Generated Result Card */}
             {generatedPlan && (
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/50 overflow-hidden animate-fade-up ring-4 ring-indigo-50/50">
                   <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-200" />
                          <span className="font-bold">AI 제안 플랜</span>
                      </div>
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded border border-white/10">{generatedPlan.category}</span>
                   </div>
                   <div className="p-6 space-y-5">
                      <div>
                         <h3 className="font-bold text-lg text-gray-900 leading-tight">{generatedPlan.title}</h3>
                         <p className="text-sm text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{generatedPlan.description}</p>
                      </div>
                      
                      <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">세부 목표 미리보기</h4>
                          <div className="space-y-2">
                             {generatedPlan.subGoals.map((sg, i) => (
                                 <div key={i} className="flex gap-3 items-start text-sm">
                                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                                     <div>
                                         <p className="font-bold text-gray-800">{sg.title}</p>
                                         <p className="text-xs text-gray-500">{sg.description}</p>
                                     </div>
                                 </div>
                             ))}
                          </div>
                      </div>

                      <Button fullWidth onClick={handleApplyAI} className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200">
                         이 내용으로 작성 폼 채우기 <ArrowRight className="w-4 h-4 ml-2"/>
                      </Button>
                   </div>
                </div>
             )}
          </section>

          {/* Right Column: Manual Form */}
          <section className="bg-white rounded-3xl shadow-[0_2px_12px_0_rgba(0,0,0,0.08)] border border-gray-100 p-6 lg:p-8 sticky top-20">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Target className="w-5 h-5 text-gray-700" /> 
                    </div>
                    계획 상세 작성
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">수동 입력</span>
             </div>
             
             <div className="space-y-6">
                <Input 
                    label="계획 제목" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="예: 30일 만에 파이썬 기초 끝내기" 
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Input 
                        type="date" 
                        label="시작일" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
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

                {/* Subgoals */}
                <div>
                   <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <AlignLeft className="w-3.5 h-3.5" /> 세부 목표 (Milestones)
                      </label>
                      <button 
                        onClick={handleAddSubGoal} 
                        className="text-xs bg-primary-50 text-primary-700 font-bold px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1"
                      >
                          <Plus className="w-3 h-3" /> 추가
                      </button>
                   </div>
                   
                   <div className="space-y-3">
                      {subGoals.map((sg, idx) => (
                         <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:shadow-sm hover:border-primary-200">
                            <span className="text-xs font-bold text-gray-300 mt-2.5 w-5 text-center flex-shrink-0">{idx+1}</span>
                            <div className="flex-1 space-y-2">
                               <input 
                                  className="w-full bg-transparent border-none p-0 text-sm font-bold placeholder-gray-400 focus:ring-0" 
                                  placeholder="목표 제목 입력" 
                                  value={sg.title} 
                                  onChange={(e) => handleSubGoalChange(idx, 'title', e.target.value)}
                               />
                               <input 
                                  className="w-full bg-transparent border-none p-0 text-xs text-gray-600 placeholder-gray-400 focus:ring-0" 
                                  placeholder="상세 설명 (선택)" 
                                  value={sg.description} 
                                  onChange={(e) => handleSubGoalChange(idx, 'description', e.target.value)}
                               />
                            </div>
                            <button 
                                onClick={() => handleRemoveSubGoal(idx)} 
                                className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      ))}
                      
                      {subGoals.length === 0 && (
                         <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm bg-gray-50/50">
                            <Target className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>세부 목표를 추가하여<br/>계획을 구체화해보세요.</p>
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
          </section>
       </div>
    </div>
  );
}
