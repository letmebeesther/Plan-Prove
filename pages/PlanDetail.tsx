
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Calendar, Target, Share2, MoreHorizontal, Edit2, Trash2, Bookmark, 
    ChevronDown, ChevronUp, CheckCircle2, Circle, AlertTriangle, 
    Camera, Video, FileText, Smartphone, Send, Star, ShieldCheck, X,
    Plus, Trophy, UploadCloud, PenTool, Megaphone, Clock, Sparkles, RefreshCw,
    Info, Activity, FileCheck, Hash, Mail, Link as LinkIcon
} from 'lucide-react';
import { Plan, Evidence, SubGoal } from '../types';
import { 
    fetchPlanById, submitEvidence, deletePlan, updateSubGoalStatus, 
    updateRetrospective, addSubGoal, deleteSubGoal, updateSubGoalDetails,
    deleteEvidence, updateEvidence 
} from '../services/dbService';
import { uploadImage, calculateFileHash } from '../services/storageService';
import { generateAIEvidenceSuggestions } from '../services/geminiService'; // Import AI service
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/Avatar';
import { Input } from '../components/common/Input';

export function PlanDetail() {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSubGoal, setExpandedSubGoal] = useState<number | null>(0);
    
    // Modal States
    const [showCertModal, setShowCertModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [showRetroModal, setShowRetroModal] = useState(false);
    
    // FR-081 Evidence Detail Modal
    const [showEvidenceDetail, setShowEvidenceDetail] = useState<Evidence | null>(null);
    const [viewingEvidenceSubGoalIndex, setViewingEvidenceSubGoalIndex] = useState<number | null>(null);

    // FR-099 AI Example Modal
    const [showAIExamples, setShowAIExamples] = useState(false);
    const [aiExamples, setAiExamples] = useState<any[]>([]);
    const [loadingExamples, setLoadingExamples] = useState(false);

    // FR-068 Add SubGoal Modal
    const [showAddSubGoal, setShowAddSubGoal] = useState(false);
    const [newSubGoalTitle, setNewSubGoalTitle] = useState('');
    const [newSubGoalDesc, setNewSubGoalDesc] = useState('');
    const [newSubGoalDate, setNewSubGoalDate] = useState('');

    // FR-055 Edit SubGoal Modal
    const [showEditSubGoal, setShowEditSubGoal] = useState<number | null>(null);
    const [editSubGoalData, setEditSubGoalData] = useState<{title: string, desc: string, date: string}>({title:'', desc:'', date:''});

    // Cert & Action States
    const [selectedSubGoalIndex, setSelectedSubGoalIndex] = useState<number | null>(null);
    const [certType, setCertType] = useState<'PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE' | 'BIOMETRIC' | 'EMAIL' | 'API'>('PHOTO');
    const [certContent, setCertContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Specific Cert States
    const [certEmail, setCertEmail] = useState('');
    const [certApiProvider, setCertApiProvider] = useState('');
    const [certApiRef, setCertApiRef] = useState('');
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    // Failure Reason State
    const [failureReason, setFailureReason] = useState('시간 부족');
    const [failureDetail, setFailureDetail] = useState('');

    // Retrospective State
    const [retroContent, setRetroContent] = useState('');

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadPlan();
    }, [id]);

    const loadPlan = async () => {
        if (!id) return;
        setLoading(true);
        const fetchedPlan = await fetchPlanById(id);
        setPlan(fetchedPlan);
        if (fetchedPlan?.retrospectiveContent) {
            setRetroContent(fetchedPlan.retrospectiveContent);
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- Action Handlers ---

    const handleDeletePlan = async () => {
        if (!id) return;
        if (window.confirm('정말로 이 계획을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
            try {
                await deletePlan(id);
                alert('계획이 삭제되었습니다.');
                navigate('/');
            } catch (e) {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleAddSubGoalSubmit = async () => {
        if (!plan || !id || !newSubGoalTitle) return;
        
        setSubmitting(true);
        try {
            const newSubGoal: SubGoal = {
                id: Date.now().toString(),
                title: newSubGoalTitle,
                description: newSubGoalDesc,
                status: 'pending',
                dueDate: newSubGoalDate || plan.endDate,
                evidenceTypes: ['PHOTO'], // Default
                evidences: []
            };
            
            await addSubGoal(id, newSubGoal);
            await loadPlan();
            setShowAddSubGoal(false);
            setNewSubGoalTitle('');
            setNewSubGoalDesc('');
            setNewSubGoalDate('');
            alert('중간 목표가 추가되었습니다.');
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubGoal = async (index: number) => {
        if (!id) return;
        if (window.confirm('이 중간 목표를 삭제하시겠습니까? (FR-065)')) {
            try {
                await deleteSubGoal(id, index);
                await loadPlan();
            } catch (e) {
                alert('오류가 발생했습니다.');
            }
        }
    };

    const handleEditSubGoalOpen = (index: number, subGoal: SubGoal) => {
        setShowEditSubGoal(index);
        setEditSubGoalData({
            title: subGoal.title,
            desc: subGoal.description,
            date: subGoal.dueDate
        });
    };

    const handleEditSubGoalSubmit = async () => {
        if (!id || showEditSubGoal === null) return;
        setSubmitting(true);
        try {
            await updateSubGoalDetails(id, showEditSubGoal, {
                title: editSubGoalData.title,
                description: editSubGoalData.desc,
                dueDate: editSubGoalData.date
            });
            await loadPlan();
            setShowEditSubGoal(null);
        } catch (e) {
            alert('수정 실패');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateAIExamples = async (subGoalTitle: string, subGoalDesc: string) => {
        setLoadingExamples(true);
        setShowAIExamples(true);
        try {
            const examples = await generateAIEvidenceSuggestions(subGoalTitle, subGoalDesc, currentUser?.hasWearable || false);
            setAiExamples(examples);
        } catch (e) {
            console.error(e);
            setAiExamples([]);
        } finally {
            setLoadingExamples(false);
        }
    };

    const handleFailureSubmit = async () => {
        if (!plan || selectedSubGoalIndex === null || !id) return;
        setSubmitting(true);
        try {
            const reason = `${failureReason}: ${failureDetail}`;
            await updateSubGoalStatus(id, selectedSubGoalIndex, 'failed', reason);
            await loadPlan();
            setShowFailureModal(false);
            setFailureDetail('');
            alert('실패 사유가 기록되었습니다.');
        } catch (e) {
            alert('오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetroSubmit = async () => {
        if (!plan || !id) return;
        setSubmitting(true);
        try {
            await updateRetrospective(id, retroContent);
            await loadPlan();
            setShowRetroModal(false);
            alert('회고가 저장되었습니다.');
        } catch (e) {
            alert('오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendVerificationEmail = () => {
        if(!certEmail) return alert('이메일을 입력해주세요.');
        setEmailVerificationSent(true);
        alert(`인증 코드가 ${certEmail}로 전송되었습니다. (인증코드는 123456 입니다)`);
    };

    const handleCertification = async () => {
        if (!plan || selectedSubGoalIndex === null || !id) return;
        
        if ((certType === 'PHOTO' || certType === 'BIOMETRIC' || certType === 'APP_CAPTURE') && !selectedFile) {
            alert('인증 사진(또는 캡처)을 업로드해주세요.');
            return;
        }
        if (certType === 'EMAIL' && verificationCode !== '123456') {
            alert('인증 코드가 올바르지 않습니다. (테스트 코드: 123456)');
            return;
        }
        if (certType === 'API' && (!certApiProvider || !certApiRef)) {
            alert('API 인증 정보를 모두 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            let imageUrl: string | null = null;
            let fileHash: string | null = null;

            if (selectedFile && (certType === 'PHOTO' || certType === 'APP_CAPTURE' || certType === 'BIOMETRIC')) {
                fileHash = await calculateFileHash(selectedFile);
                imageUrl = await uploadImage(selectedFile, `evidence/${plan.id}`);
            }

            const aiStatus = Math.random() > 0.8 ? 'WARNING' : 'APPROVED'; 

            // Dynamically construct the object to prevent 'undefined' values which Firestore rejects
            const evidenceData: any = {
                id: Date.now().toString(),
                type: certType,
                content: certContent,
                status: aiStatus,
                createdAt: new Date().toISOString().split('T')[0],
                feedback: aiStatus === 'WARNING' ? '검토가 필요합니다.' : '인증되었습니다!',
            };

            if (imageUrl) evidenceData.url = imageUrl;
            if (fileHash) evidenceData.fileHash = fileHash;
            if (certType === 'EMAIL' && certEmail) evidenceData.verifiedEmail = certEmail;
            if (certType === 'API') {
                if (certApiProvider) evidenceData.apiProvider = certApiProvider;
                if (certApiRef) evidenceData.apiReferenceId = certApiRef;
            }

            const newEvidence = evidenceData as Evidence;

            await submitEvidence(id, selectedSubGoalIndex, newEvidence);
            await loadPlan();
            
            setShowCertModal(false);
            setCertContent('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setCertEmail('');
            setVerificationCode('');
            setEmailVerificationSent(false);
            setCertApiProvider('');
            setCertApiRef('');
            alert('인증이 제출되었습니다!');
        } catch (e) {
            console.error(e);
            alert('인증 제출 실패');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvidence = async (evidenceId: string) => {
        if (!id || viewingEvidenceSubGoalIndex === null) return;
        if (window.confirm('이 증거물을 삭제하시겠습니까? (FR-090)')) {
            try {
                await deleteEvidence(id, viewingEvidenceSubGoalIndex, evidenceId);
                setShowEvidenceDetail(null);
                await loadPlan();
            } catch (e) {
                alert('삭제 실패');
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!plan) return <div className="p-10 text-center">Plan not found</div>;

    const isAuthor = currentUser?.id === plan.author.id;

    // Helper for D-Day (FR-048)
    const getDDay = (dueDate: string) => {
        const diff = new Date(dueDate).getTime() - new Date().setHours(0,0,0,0);
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return `D+${Math.abs(days)}`;
        if (days === 0) return 'D-Day';
        return `D-${days}`;
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in space-y-8">
            {/* Hero Section */}
            <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg group">
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
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block text-gray-800 text-sm z-50">
                                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"><Edit2 className="w-3.5 h-3.5" /> 수정</button>
                                <button onClick={handleDeletePlan} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> 삭제</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full text-white">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10">
                            {plan.category}
                        </span>
                        {plan.tags?.map(tag => (
                            <span key={tag} className="text-xs text-white/80 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">#{tag}</span>
                        ))}
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">{plan.title}</h1>
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
                        {plan.executionTime && (
                            <>
                                <span className="hidden sm:inline text-white/40">|</span>
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <Clock className="w-4 h-4" />
                                    <span>{plan.executionTime}</span>
                                </div>
                            </>
                        )}
                         <span className="hidden sm:inline text-white/40">|</span>
                        <div className="opacity-70 text-xs">
                             {plan.updatedAt && `수정됨 ${plan.updatedAt.split('T')[0]}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">계획 소개</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{plan.description}</p>
            </div>

            {/* Support Message Banner */}
            <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-3xl p-4 border border-indigo-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-indigo-500">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900">"천리길도 한 걸음부터!"</p>
                        <p className="text-xs text-indigo-600">오늘의 인증을 놓치지 마세요.</p>
                    </div>
                </div>
            </div>

            {/* Retrospective Widget */}
            {plan.hasRetrospective ? (
                <div className="bg-yellow-50 rounded-3xl p-6 border border-yellow-100 shadow-sm relative">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-bold text-yellow-900">나의 회고</h3>
                    </div>
                    <p className="text-sm text-yellow-800 whitespace-pre-line mb-4">{plan.retrospectiveContent}</p>
                </div>
            ) : plan.progress === 100 && isAuthor ? (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-100 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="font-bold text-yellow-900 text-lg mb-1">계획 완주 성공!</h3>
                    <p className="text-yellow-700 text-sm mb-4">멋진 여정이었습니다. 이번 도전을 회고해보세요.</p>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 border-none text-white w-full shadow-yellow-200" onClick={() => setShowRetroModal(true)}>
                        회고 작성하기
                    </Button>
                    </div>
            ) : null}

            {/* Progress Dashboard */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
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

            {/* Sub-Goals List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" /> 중간 목표 (Milestones)
                    </h3>
                    {isAuthor && plan.subGoals.length < 100 && (
                        <button onClick={() => setShowAddSubGoal(true)} className="text-xs flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg font-bold hover:bg-primary-100 transition-colors">
                            <Plus className="w-3 h-3" /> 목표 추가 (FR-068)
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {plan.subGoals.map((subGoal, idx) => {
                        const isExpanded = expandedSubGoal === idx;
                        const isCompleted = subGoal.status === 'completed';
                        
                        return (
                            <div key={idx} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-gray-100 hover:border-gray-300'}`}>
                                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedSubGoal(isExpanded ? null : idx)}>
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{subGoal.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {getDDay(subGoal.dueDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
                                        <div className="flex justify-between items-start pt-3 mb-2">
                                            <p className="text-sm text-gray-600">{subGoal.description || '상세 설명이 없습니다.'}</p>
                                            {isAuthor && subGoal.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleEditSubGoalOpen(idx, subGoal)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteSubGoal(idx)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Allowed Evidence Types Display */}
                                        <div className="mb-3 flex gap-1.5 flex-wrap">
                                            {subGoal.evidenceTypes?.map(t => (
                                                <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-bold">{t}</span>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        {isAuthor && subGoal.status === 'pending' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button 
                                                    size="sm" 
                                                    className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                                    onClick={() => { 
                                                        setSelectedSubGoalIndex(idx); 
                                                        setCertType((subGoal.evidenceTypes && subGoal.evidenceTypes.length > 0) ? subGoal.evidenceTypes[0] : 'PHOTO');
                                                        setShowCertModal(true); 
                                                    }}
                                                >
                                                    <Camera className="w-3.5 h-3.5 mr-1.5" /> 인증하기
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => handleGenerateAIExamples(subGoal.title, subGoal.description)}
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-500" /> AI 예시
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Certification Modal (Updated filtering) */}
            {showCertModal && selectedSubGoalIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowCertModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">목표 인증하기</h3>
                            <button onClick={() => setShowCertModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="font-bold text-gray-800">{plan?.subGoals[selectedSubGoalIndex].title}</span>
                            <br/>허용된 방식으로 인증을 진행해주세요.
                        </p>

                        <div className="grid grid-cols-4 gap-2 mb-4">
                             {[
                                 { id: 'PHOTO', label: '사진', icon: Camera },
                                 { id: 'VIDEO', label: '영상', icon: Video },
                                 { id: 'TEXT', label: '글', icon: FileText },
                                 { id: 'APP_CAPTURE', label: '앱캡처', icon: Smartphone },
                                 { id: 'BIOMETRIC', label: '생체', icon: Activity },
                                 { id: 'EMAIL', label: '이메일', icon: Mail },
                                 { id: 'API', label: 'API', icon: LinkIcon }
                             ]
                             .filter(type => {
                                 const allowed = plan?.subGoals[selectedSubGoalIndex].evidenceTypes;
                                 return !allowed || allowed.length === 0 || allowed.includes(type.id as any);
                             })
                             .map(type => (
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

                        {/* Dynamic Input Fields */}
                        {(certType === 'PHOTO' || certType === 'BIOMETRIC' || certType === 'APP_CAPTURE') && (
                             <div 
                                className={`h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center mb-4 transition-colors cursor-pointer relative overflow-hidden ${
                                    previewUrl ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-100'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                             >
                                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                 {previewUrl ? (
                                     <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                                 ) : (
                                     <>
                                        <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-500">
                                            {certType === 'BIOMETRIC' ? '워치/건강앱 캡처 업로드' : '이미지 업로드'} (클릭)
                                        </span>
                                     </>
                                 )}
                             </div>
                        )}
                        
                        {certType === 'EMAIL' && (
                            <div className="space-y-3 mb-4">
                                <Input label="기관 이메일" value={certEmail} onChange={e => setCertEmail(e.target.value)} disabled={emailVerificationSent} />
                                {emailVerificationSent ? (
                                    <Input label="인증 코드" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                                ) : (
                                    <Button size="sm" fullWidth onClick={handleSendVerificationEmail}>인증 메일 발송</Button>
                                )}
                            </div>
                        )}

                        {certType === 'API' && (
                            <div className="space-y-3 mb-4">
                                <Input label="발급 기관" value={certApiProvider} onChange={e => setCertApiProvider(e.target.value)} />
                                <Input label="자격증 번호" value={certApiRef} onChange={e => setCertApiRef(e.target.value)} />
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">설명 추가</label>
                            <input type="text" className="w-full rounded-xl border-gray-300 text-sm" value={certContent} onChange={e => setCertContent(e.target.value)} />
                        </div>

                        <Button fullWidth onClick={handleCertification} disabled={submitting}>
                            {submitting ? '제출 중...' : '인증 제출하기'}
                        </Button>
                    </div>
                </div>
            )}
            
            {showEvidenceDetail && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={() => setShowEvidenceDetail(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70" onClick={() => setShowEvidenceDetail(null)}><X className="w-5 h-5" /></button>
                        <div className="bg-gray-100 max-h-[60vh] overflow-hidden flex items-center justify-center relative min-h-[200px]">
                            {showEvidenceDetail.type === 'PHOTO' ? (
                                <img src={showEvidenceDetail.url} alt="evidence" className="w-full h-full object-contain" />
                            ) : (
                                <div className="p-10 text-center text-gray-500">
                                    <div className="text-lg font-bold mb-2">{showEvidenceDetail.type} 인증</div>
                                    <p>{showEvidenceDetail.content}</p>
                                </div>
                            )}
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1 ${
                                showEvidenceDetail.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                                <ShieldCheck className="w-3 h-3" /> {showEvidenceDetail.status === 'APPROVED' ? 'AI 판정: 정상' : 'AI 판정: 경고'}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">{showEvidenceDetail.createdAt} 제출</div>
                                    <p className="text-gray-800 font-medium">{showEvidenceDetail.content || '설명이 없습니다.'}</p>
                                </div>
                            </div>
                            {showEvidenceDetail.fileHash && (
                                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 flex items-start gap-2">
                                    <FileCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div className="break-all">
                                        <span className="font-bold text-gray-700 block mb-0.5">원본 파일 검증 (Hash)</span>
                                        {showEvidenceDetail.fileHash.substring(0, 20)}...
                                    </div>
                                </div>
                            )}
                            {showEvidenceDetail.feedback && (
                                <div className={`p-3 rounded-xl text-sm mb-6 ${showEvidenceDetail.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                    <div className="font-bold mb-1 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI 피드백</div>
                                    {showEvidenceDetail.feedback}
                                </div>
                            )}
                            {isAuthor && (
                                <div className="flex gap-2">
                                    <Button variant="outline" fullWidth size="sm" className="text-red-500 border-red-200" onClick={() => handleDeleteEvidence(showEvidenceDetail.id)}>
                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> 삭제
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAIExamples && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowAIExamples(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" /> AI 증거물 예시</h3>
                            <button onClick={() => setShowAIExamples(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        {loadingExamples ? <div className="py-10 text-center text-gray-500">로딩 중...</div> : (
                            <div className="space-y-3">
                                {aiExamples.map((ex, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-2xl">{ex.emoji}</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{ex.title}</h4>
                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{ex.type}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 pl-9 mb-2">{ex.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add SubGoal Modal */}
            {showAddSubGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">중간 목표 추가</h3>
                        <div className="space-y-3 mb-6">
                            <Input label="목표 제목" value={newSubGoalTitle} onChange={e => setNewSubGoalTitle(e.target.value)} />
                            <Input label="상세 설명" value={newSubGoalDesc} onChange={e => setNewSubGoalDesc(e.target.value)} />
                            <Input type="date" label="마감일" value={newSubGoalDate} onChange={e => setNewSubGoalDate(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" fullWidth onClick={() => setShowAddSubGoal(false)}>취소</Button>
                            <Button fullWidth onClick={handleAddSubGoalSubmit} disabled={submitting}>추가하기</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit SubGoal Modal */}
            {showEditSubGoal !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">중간 목표 수정</h3>
                        <div className="space-y-3 mb-6">
                            <Input label="목표 제목" value={editSubGoalData.title} onChange={e => setEditSubGoalData({...editSubGoalData, title: e.target.value})} />
                            <Input label="상세 설명" value={editSubGoalData.desc} onChange={e => setEditSubGoalData({...editSubGoalData, desc: e.target.value})} />
                            <Input type="date" label="마감일" value={editSubGoalData.date} onChange={e => setEditSubGoalData({...editSubGoalData, date: e.target.value})} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" fullWidth onClick={() => setShowEditSubGoal(null)}>취소</Button>
                            <Button fullWidth onClick={handleEditSubGoalSubmit} disabled={submitting}>수정 완료</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
