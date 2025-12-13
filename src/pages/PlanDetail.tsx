import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Calendar, ChevronLeft, Target, Clock, CheckCircle2, AlertCircle, 
    Upload, Camera, Type as TypeIcon, Mail, Link as LinkIcon, MoreHorizontal,
    Share2, Bookmark, Trash2, X, AlertTriangle, PlayCircle
} from 'lucide-react';
import { Plan, Evidence, SubGoal } from '../types';
import { fetchPlanById, submitEvidence, updateSubGoalStatus, deletePlan, toggleScrap } from '../services/dbService';
import { sendVerificationEmail } from '../services/emailService';
import { uploadImage, calculateFileHash } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/Avatar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Input } from '../components/common/Input';

// 허용할 도메인 리스트 정의 (학교/회사 전용)
const ALLOWED_DOMAINS = [
    "university.edu",
    "company.co.kr",
    "mycorp.com",
    "ajou.ac.kr",
];

export function PlanDetail() {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isScrapped, setIsScrapped] = useState(false);
    
    // Evidence Modal State
    const [showCertModal, setShowCertModal] = useState(false);
    const [selectedSubGoalIndex, setSelectedSubGoalIndex] = useState<number | null>(null);
    const [certType, setCertType] = useState<'PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE' | 'BIOMETRIC' | 'EMAIL' | 'API'>('PHOTO');
    const [certText, setCertText] = useState('');
    const [certFile, setCertFile] = useState<File | null>(null);
    const [certPreviewUrl, setCertPreviewUrl] = useState<string | null>(null);
    
    // Email Verification State
    const [certEmail, setCertEmail] = useState('');
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [verificationCodeInput, setVerificationCodeInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [emailSending, setEmailSending] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete Confirm
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        loadPlan();
    }, [id]);

    const loadPlan = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await fetchPlanById(id);
            setPlan(data);
            // In a real app, check if scrapped by current user
        } catch (e) {
            setError('계획을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleScrapToggle = async () => {
        if (!currentUser || !plan) return;
        try {
            const added = await toggleScrap(currentUser.id, {
                type: 'PLAN',
                title: plan.title,
                content: plan.description,
                originalId: plan.id
            });
            setIsScrapped(added);
            alert(added ? '스크랩되었습니다.' : '스크랩이 취소되었습니다.');
        } catch (e) {
            console.error(e);
        }
    };

    const handleOpenCertModal = (index: number, subGoal: SubGoal) => {
        setSelectedSubGoalIndex(index);
        // Default to first evidence type of the subgoal or PHOTO
        setCertType(subGoal.evidenceTypes?.[0] || 'PHOTO');
        setCertText('');
        setCertFile(null);
        setCertPreviewUrl(null);
        setCertEmail('');
        setEmailVerificationSent(false);
        setVerificationCodeInput('');
        setGeneratedCode(null);
        setShowCertModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCertFile(file);
            setCertPreviewUrl(URL.createObjectURL(file));
        }
    };

    const isDomainAllowed = (email: string) => {
        if (!email.includes('@')) return false;
        const domain = email.split('@')[1];
        if (!domain) return false;
        return ALLOWED_DOMAINS.includes(domain.toLowerCase());
    };

    const handleSendVerificationEmail = async () => {
        if (!certEmail) return alert('이메일을 입력해주세요.');
        
        // 도메인 검증
        if (!isDomainAllowed(certEmail)) {
            return alert(`허용되지 않는 도메인입니다.\n학교 또는 회사 이메일만 사용 가능합니다.\n(허용 도메인: ${ALLOWED_DOMAINS.join(', ')})`);
        }

        setEmailSending(true);
        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            await sendVerificationEmail(certEmail, code);
            setGeneratedCode(code);
            setEmailVerificationSent(true);
            alert('인증 코드가 전송되었습니다. 이메일을 확인해주세요.');
        } catch (e) {
            console.error(e);
            alert('이메일 전송 실패');
        } finally {
            setEmailSending(false);
        }
    };

    const handleEvidenceSubmit = async () => {
        if (!plan || selectedSubGoalIndex === null || !currentUser) return;
        
        setSubmitting(true);
        try {
            let evidenceData: Evidence = {
                id: `ev-${Date.now()}`,
                type: certType,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };

            // Type specific validation & data
            if (certType === 'PHOTO' || certType === 'VIDEO') {
                if (!certFile) throw new Error('파일을 업로드해주세요.');
                const url = await uploadImage(certFile, 'evidence');
                const hash = await calculateFileHash(certFile);
                evidenceData.url = url;
                evidenceData.fileHash = hash;
                evidenceData.imageUrls = [url];
            } else if (certType === 'TEXT') {
                if (!certText) throw new Error('내용을 입력해주세요.');
                evidenceData.content = certText;
            } else if (certType === 'EMAIL') {
                if (!emailVerificationSent || !generatedCode) throw new Error('이메일 인증이 필요합니다.');
                if (verificationCodeInput !== generatedCode) throw new Error('인증 코드가 일치하지 않습니다.');
                evidenceData.verifiedEmail = certEmail;
                evidenceData.status = 'APPROVED'; // Auto-approve for email verification
            }

            await submitEvidence(plan.id, selectedSubGoalIndex, evidenceData);
            
            alert('인증이 완료되었습니다!');
            setShowCertModal(false);
            loadPlan(); // Refresh
        } catch (e: any) {
            alert(e.message || '인증 제출 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePlan = async () => {
        if (!plan) return;
        try {
            await deletePlan(plan.id);
            alert('계획이 삭제되었습니다.');
            navigate('/my-page');
        } catch (e) {
            alert('삭제 실패');
        }
    };

    if (loading) return <div className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></div>;
    if (error || !plan) return <div className="p-20 text-center">{error || 'Plan not found'}</div>;

    const isAuthor = currentUser?.id === plan.authorId;

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" /> 목록으로
                </button>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Share2 className="w-5 h-5" /></button>
                    <button onClick={handleScrapToggle} className={`p-2 hover:bg-gray-100 rounded-full ${isScrapped ? 'text-yellow-500' : 'text-gray-500'}`}><Bookmark className={`w-5 h-5 ${isScrapped ? 'fill-current' : ''}`} /></button>
                    {isAuthor && (
                        <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-gray-100 rounded-full text-red-500"><Trash2 className="w-5 h-5" /></button>
                    )}
                </div>
            </div>

            {/* Plan Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg">{plan.category}</span>
                        <span className="text-xs font-bold text-gray-400">D-{plan.daysLeft}</span>
                    </div>
                    {plan.progress === 100 && (
                        <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                            <Target className="w-4 h-4" /> 목표 달성!
                        </div>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{plan.title}</h1>
                <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">{plan.description}</p>

                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <Avatar src={plan.author.avatarUrl} size="sm" />
                        <span className="text-sm font-bold text-gray-700">{plan.author.nickname}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {plan.startDate} ~ {plan.endDate}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-700">
                        <span>전체 진행률</span>
                        <span className="text-primary-600">{plan.progress}%</span>
                    </div>
                    <ProgressBar progress={plan.progress} className="h-3" />
                </div>
            </div>

            {/* SubGoals List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">세부 목표 ({plan.subGoals.length})</h2>
                {plan.subGoals.map((sg, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl p-5 border transition-all ${sg.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        sg.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {sg.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <h3 className={`font-bold text-gray-900 ${sg.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{sg.title}</h3>
                                </div>
                                <p className="text-sm text-gray-500 pl-9 mb-3">{sg.description}</p>
                                
                                {sg.status === 'completed' && sg.evidences && sg.evidences.length > 0 && (
                                    <div className="pl-9 mb-2">
                                        <div className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> 인증 완료 ({sg.evidences.length})
                                        </div>
                                        {/* Evidence Preview if photo */}
                                        <div className="flex gap-2">
                                            {sg.evidences.filter(e => e.type === 'PHOTO').map((e, i) => (
                                                <div key={i} className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                    <img src={e.url} alt="evidence" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {isAuthor && sg.status !== 'completed' && (
                                <Button 
                                    size="sm" 
                                    onClick={() => handleOpenCertModal(idx, sg)}
                                    className="shrink-0"
                                >
                                    인증하기
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Certification Modal */}
            {showCertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => !submitting && setShowCertModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">목표 인증하기</h3>
                            <button onClick={() => setShowCertModal(false)} disabled={submitting}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        
                        <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-900 text-sm mb-1">
                                {selectedSubGoalIndex !== null ? plan.subGoals[selectedSubGoalIndex].title : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                                {selectedSubGoalIndex !== null ? plan.subGoals[selectedSubGoalIndex].description : ''}
                            </p>
                        </div>

                        {/* Certification Type Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                            {[
                                { id: 'PHOTO', label: '사진', icon: Camera },
                                { id: 'VIDEO', label: '영상', icon: PlayCircle },
                                { id: 'TEXT', label: '글', icon: TypeIcon },
                                { id: 'EMAIL', label: '이메일', icon: Mail },
                                { id: 'API', label: '연동', icon: LinkIcon }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setCertType(t.id as any)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 min-w-[60px] border transition-all ${
                                        certType === t.id ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-500 border-gray-200'
                                    }`}
                                >
                                    <t.icon className="w-4 h-4" />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Type Specific Content */}
                        <div className="mb-6">
                            {(certType === 'PHOTO' || certType === 'VIDEO') && (
                                <div className="space-y-3">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary-400 transition-colors overflow-hidden"
                                    >
                                        {certPreviewUrl ? (
                                            <img src={certPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-500 font-medium">터치하여 업로드</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept={certType === 'PHOTO' ? "image/*" : "video/*"} 
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <textarea 
                                        className="w-full border-gray-300 rounded-xl text-sm p-3 focus:ring-primary-500 focus:border-primary-500 resize-none border"
                                        placeholder="간단한 설명을 추가해주세요 (선택)"
                                        rows={2}
                                        value={certText}
                                        onChange={e => setCertText(e.target.value)}
                                    />
                                </div>
                            )}

                            {certType === 'TEXT' && (
                                <textarea 
                                    className="w-full border-gray-300 rounded-xl text-sm p-3 focus:ring-primary-500 focus:border-primary-500 resize-none h-40 border"
                                    placeholder="인증할 내용을 상세히 적어주세요."
                                    value={certText}
                                    onChange={e => setCertText(e.target.value)}
                                />
                            )}

                            {certType === 'EMAIL' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-3 rounded-lg flex flex-col gap-1 items-start text-xs text-blue-700">
                                        <div className="flex gap-2 items-center">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span className="font-bold">학교/회사 이메일 인증</span>
                                        </div>
                                        <p>인증 코드를 발송하여 소속을 검증합니다.</p>
                                        <p className="mt-1 opacity-80 text-[10px]">
                                            * 허용 도메인: {ALLOWED_DOMAINS.join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input 
                                            className="flex-1"
                                            placeholder="name@organization.com"
                                            type="email"
                                            value={certEmail}
                                            onChange={e => setCertEmail(e.target.value)}
                                            disabled={emailVerificationSent}
                                        />
                                        <Button 
                                            size="sm" 
                                            onClick={handleSendVerificationEmail}
                                            disabled={emailSending || emailVerificationSent}
                                            className="whitespace-nowrap"
                                        >
                                            {emailSending ? '전송중' : emailVerificationSent ? '전송완료' : '코드전송'}
                                        </Button>
                                    </div>
                                    {emailVerificationSent && (
                                        <div className="space-y-2">
                                            <Input 
                                                placeholder="인증코드 6자리"
                                                value={verificationCodeInput}
                                                onChange={e => setVerificationCodeInput(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500">이메일로 전송된 코드를 입력하세요.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {(certType === 'API' || certType === 'BIOMETRIC') && (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">현재 데모 버전에서는 지원하지 않는 기능입니다.</p>
                                    <p className="text-xs mt-1">대신 '사진'이나 '글'로 인증해주세요.</p>
                                </div>
                            )}
                        </div>

                        <Button fullWidth onClick={handleEvidenceSubmit} disabled={submitting}>
                            {submitting ? '제출 중...' : '인증 제출하기'}
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                isOpen={showDeleteConfirm}
                title="계획 삭제"
                message="정말로 이 계획을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다."
                onConfirm={handleDeletePlan}
                onCancel={() => setShowDeleteConfirm(false)}
                isDangerous
            />
        </div>
    );
}