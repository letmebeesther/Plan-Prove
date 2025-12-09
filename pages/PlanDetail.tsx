
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Calendar, Target, Share2, MoreHorizontal, Edit2, Trash2, Bookmark, 
    ChevronDown, ChevronUp, CheckCircle2, Circle, AlertTriangle, 
    Camera, Video, FileText, Smartphone, Send, Star, ShieldCheck, X,
    Plus, Trophy, UploadCloud
} from 'lucide-react';
import { Plan, Evidence, SubGoal } from '../types';
import { fetchPlanById, submitEvidence } from '../services/dbService';
import { uploadImage } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/Avatar';

export function PlanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSubGoal, setExpandedSubGoal] = useState<number | null>(0);
    
    // Modal State
    const [showCertModal, setShowCertModal] = useState(false);
    const [selectedSubGoalIndex, setSelectedSubGoalIndex] = useState<number | null>(null);
    const [certType, setCertType] = useState<'PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE'>('PHOTO');
    const [certContent, setCertContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadPlan = async () => {
            if (!id) return;
            setLoading(true);
            const fetchedPlan = await fetchPlanById(id);
            setPlan(fetchedPlan);
            setLoading(false);
        };
        loadPlan();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCertification = async () => {
        if (!plan || selectedSubGoalIndex === null || !id) return;
        if (certType === 'PHOTO' && !selectedFile) {
            alert('인증 사진을 업로드해주세요.');
            return;
        }

        setSubmitting(true);
        
        try {
            let imageUrl = undefined;
            
            // 1. Upload Image if selected
            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile, `evidence/${plan.id}`);
            }

            // 2. Simulate AI Analysis (FR-053)
            await new Promise(resolve => setTimeout(resolve, 1500));
            const aiStatus = Math.random() > 0.9 ? 'WARNING' : 'APPROVED'; // Mock AI Logic

            // 3. Submit Evidence Data
            const newEvidence: Evidence = {
                id: Date.now().toString(),
                type: certType,
                content: certContent,
                status: aiStatus,
                createdAt: new Date().toISOString().split('T')[0],
                url: imageUrl
            };

            await submitEvidence(id, selectedSubGoalIndex, newEvidence);
            
            // Refresh plan data locally
            const updatedPlan = { ...plan };
            const subGoal = updatedPlan.subGoals[selectedSubGoalIndex];
            
            if (!subGoal.evidences) subGoal.evidences = [];
            subGoal.evidences.push(newEvidence);
            subGoal.status = 'completed'; // Auto-complete for demo logic
            
            // Recalc progress
            const completed = updatedPlan.subGoals.filter(s => s.status === 'completed').length;
            updatedPlan.progress = Math.round((completed / updatedPlan.subGoals.length) * 100);
            
            setPlan(updatedPlan);
            setShowCertModal(false);
            setCertContent('');
            setSelectedFile(null);
            setPreviewUrl(null);
            alert('인증이 제출되었습니다! AI가 분석을 완료했습니다.');
        } catch (e) {
            console.error(e);
            alert('인증 제출 실패');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!plan) return <div className="p-10 text-center">Plan not found</div>;

    const isAuthor = currentUser?.id === plan.author.id;

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            {/* --- Hero Section (FR-036 ~ FR-039) --- */}
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg group mb-8">
                <img 
                    src={plan.imageUrl || `https://picsum.photos/1200/600?random=${plan.id}`} 
                    alt={plan.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Top Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                        <Bookmark className="w-5 h-5" />
                    </button>
                    {isAuthor && (
                        <div className="relative group">
                            <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {/* Dropdown for FR-058, FR-059 */}
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block text-gray-800 text-sm">
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><Edit2 className="w-3 h-3" /> 수정</button>
                                <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> 삭제</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10">
                            {plan.category}
                        </span>
                        {plan.tags?.map(tag => (
                            <span key={tag} className="text-xs text-white/80 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">#{tag}</span>
                        ))}
                    </div>
                    
                    <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">{plan.title}</h1>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Avatar src={plan.author.avatarUrl} size="sm" border />
                            <span>{plan.author.nickname}</span>
                        </div>
                        <span className="hidden sm:inline text-white/40">|</span>
                        <div className="flex items-center gap-1.5 opacity-90">
                            <Calendar className="w-4 h-4" />
                            <span>{plan.startDate} ~ {plan.endDate}</span>
                        </div>
                         <span className="hidden sm:inline text-white/40">|</span>
                        <div className="opacity-70 text-xs">
                             {plan.updatedAt && `수정됨 ${plan.updatedAt.split('T')[0]}`}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Subgoals */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Description */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">계획 소개</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{plan.description}</p>
                    </div>

                    {/* Progress Dashboard (FR-040 ~ FR-044) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-600" /> 진행 현황
                        </h3>
                        
                        <div className="flex items-end justify-between mb-2">
                            <div>
                                <span className="text-4xl font-bold text-gray-900">{plan.progress}%</span>
                                <span className="text-sm text-gray-500 ml-2">달성</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-400">마지막 인증</div>
                                <div className="text-sm font-bold text-gray-800">{plan.lastCertifiedAt || '-'}</div>
                            </div>
                        </div>
                        <ProgressBar progress={plan.progress} className="h-3 mb-6" />

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">개인 성장률</div>
                                <div className="text-lg font-bold text-green-600">+{plan.growthRate || 0}%</div>
                            </div>
                             <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">남은 기간</div>
                                <div className="text-lg font-bold text-primary-600">{plan.daysLeft || 0}일</div>
                            </div>
                             <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">달성 목표</div>
                                <div className="text-lg font-bold text-gray-800">
                                    {plan.subGoals.filter(s => s.status === 'completed').length}/{plan.subGoals.length}
                                </div>
                            </div>
                        </div>

                        {/* Timeline Graph Mock (FR-044) */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 mb-3">달성률 변화 추이</h4>
                            <div className="h-32 flex items-end justify-between gap-1 px-2">
                                {[10, 20, 20, 35, 45, 45, 60, 65, 80, plan.progress].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary-100 rounded-t-sm hover:bg-primary-300 transition-colors relative group" style={{ height: `${h}%` }}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sub-Goals List (FR-045 ~ FR-047) */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" /> 중간 목표 (Milestones)
                        </h3>
                        <div className="space-y-3">
                            {plan.subGoals.map((subGoal, idx) => {
                                const isExpanded = expandedSubGoal === idx;
                                const isCompleted = subGoal.status === 'completed';
                                
                                return (
                                    <div key={idx} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-primary-200 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
                                        <div 
                                            className="p-4 flex items-center justify-between cursor-pointer"
                                            onClick={() => setExpandedSubGoal(isExpanded ? null : idx)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isCompleted ? (
                                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-transparent">
                                                        <Circle className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className={`font-bold text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{subGoal.title}</h4>
                                                    <p className="text-xs text-gray-400">{subGoal.dueDate} 까지</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                                    subGoal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    subGoal.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {subGoal.status === 'completed' ? '성공' : subGoal.status === 'failed' ? '실패' : '진행중'}
                                                </span>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
                                                <p className="text-sm text-gray-600 py-3">{subGoal.description || '상세 설명이 없습니다.'}</p>
                                                
                                                {/* Evidence List (FR-047) */}
                                                {subGoal.evidences && subGoal.evidences.length > 0 && (
                                                    <div className="mb-4 space-y-2">
                                                        <div className="text-xs font-bold text-gray-500">제출된 증거물</div>
                                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                                            {subGoal.evidences.map(ev => (
                                                                <div key={ev.id} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white group cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(ev.url, '_blank')}>
                                                                    {ev.type === 'PHOTO' && ev.url && <img src={ev.url} alt="evidence" className="w-full h-full object-cover" />}
                                                                    {ev.type === 'TEXT' && <div className="w-full h-full p-2 text-[8px] bg-gray-50 overflow-hidden">{ev.content}</div>}
                                                                    
                                                                    {/* AI Status Badge (FR-053) */}
                                                                    <div className={`absolute top-0 right-0 p-1 rounded-bl-lg text-[8px] font-bold text-white ${
                                                                        ev.status === 'APPROVED' ? 'bg-green-500' : 
                                                                        ev.status === 'WARNING' ? 'bg-yellow-500' : 'bg-gray-400'
                                                                    }`}>
                                                                        {ev.status === 'APPROVED' ? '정상' : ev.status === 'WARNING' ? '경고' : '대기'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    {isAuthor && subGoal.status !== 'completed' && (
                                                        <Button 
                                                            size="sm" 
                                                            fullWidth 
                                                            className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                                            onClick={() => { setSelectedSubGoalIndex(idx); setShowCertModal(true); }}
                                                        >
                                                            <Camera className="w-3.5 h-3.5 mr-1.5" /> 인증하기
                                                        </Button>
                                                    )}
                                                    {isAuthor && subGoal.status === 'failed' && (
                                                        <Button size="sm" variant="outline" fullWidth className="text-red-500 border-red-200 hover:bg-red-50">
                                                            실패 사유 작성
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Retrospective & Info */}
                <div className="space-y-6">
                    {/* Retrospective (FR-056, 057) */}
                    {plan.progress === 100 ? (
                         <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 text-center">
                            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                            <h3 className="font-bold text-yellow-900 text-lg mb-1">계획 완주 성공!</h3>
                            <p className="text-yellow-700 text-sm mb-4">멋진 여정이었습니다. 이번 도전을 회고해보세요.</p>
                            <Button className="bg-yellow-500 hover:bg-yellow-600 border-none text-white w-full shadow-yellow-200">
                                회고 작성하기
                            </Button>
                         </div>
                    ) : (
                         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">응원 메시지</h3>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600 font-medium">"천리길도 한 걸음부터!"</p>
                                <p className="text-xs text-gray-400 mt-1">오늘의 인증을 놓치지 마세요.</p>
                            </div>
                         </div>
                    )}
                </div>
            </div>

            {/* --- Certification Modal (FR-048 ~ FR-053) --- */}
            {showCertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowCertModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">목표 인증하기</h3>
                            <button onClick={() => setShowCertModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="font-bold text-gray-800">{selectedSubGoalIndex !== null && plan?.subGoals[selectedSubGoalIndex].title}</span>
                            <br/>목표 달성을 증명할 자료를 제출해주세요.
                        </p>

                        <div className="grid grid-cols-4 gap-2 mb-4">
                             {[
                                 { id: 'PHOTO', label: '사진', icon: Camera },
                                 { id: 'VIDEO', label: '영상', icon: Video },
                                 { id: 'TEXT', label: '글', icon: FileText },
                                 { id: 'APP_CAPTURE', label: '앱캡처', icon: Smartphone }
                             ].map(type => (
                                 <button
                                    key={type.id}
                                    onClick={() => setCertType(type.id as any)}
                                    className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-bold transition-all border ${
                                        certType === type.id 
                                        ? 'bg-primary-50 text-primary-600 border-primary-200 ring-1 ring-primary-500' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                 >
                                     <type.icon className="w-5 h-5 mb-1" /> {type.label}
                                 </button>
                             ))}
                        </div>

                        {certType === 'PHOTO' && (
                             <div 
                                className={`h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center mb-4 transition-colors cursor-pointer relative overflow-hidden ${
                                    previewUrl ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-100'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                             >
                                 <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                 />
                                 
                                 {previewUrl ? (
                                     <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                                            클릭하여 변경
                                        </div>
                                     </>
                                 ) : (
                                     <>
                                        <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-500">사진 업로드 (클릭)</span>
                                        <span className="text-xs text-gray-400 mt-1">또는 여기로 드래그</span>
                                     </>
                                 )}
                             </div>
                        )}
                         {certType === 'TEXT' && (
                             <textarea 
                                className="w-full h-32 rounded-xl border-gray-300 p-3 text-sm mb-4 focus:ring-primary-500"
                                placeholder="성취 내용을 자세히 적어주세요."
                                value={certContent}
                                onChange={e => setCertContent(e.target.value)}
                             />
                        )}

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">설명 추가 (선택)</label>
                            <input 
                                type="text" 
                                className="w-full rounded-xl border-gray-300 text-sm focus:ring-primary-500" 
                                placeholder="인증에 대한 간단한 코멘트"
                                value={certContent} 
                                onChange={e => setCertContent(e.target.value)}
                            />
                        </div>

                        <Button 
                            fullWidth 
                            onClick={handleCertification} 
                            disabled={submitting}
                            className="flex items-center justify-center gap-2"
                        >
                            {submitting ? '업로드 및 AI 분석 중...' : <><Send className="w-4 h-4" /> 인증 제출하기</>}
                        </Button>
                        
                        {submitting && (
                            <div className="mt-3 text-center text-xs text-primary-600 font-medium animate-pulse flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> AI가 증거물의 적합성을 판단하고 있습니다...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
