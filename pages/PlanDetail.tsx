
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Calendar, ChevronLeft, Target, Clock, CheckCircle2, AlertCircle, 
    Upload, Camera, Type as TypeIcon, Mail, Link as LinkIcon, MoreHorizontal,
    Share2, Bookmark, Trash2, X, AlertTriangle, PlayCircle, ShieldCheck,
    Info, Watch, Activity, RefreshCw, Zap
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

// 허용할 도메인 리스트 정의 (와일드카드 지원)
const ALLOWED_PATTERNS = [
    "*.ac.kr",
    "*.edu",
    "company.co.kr",
    "mycorp.com",
    "ajou.ac.kr",
    "g.baewha.ac.kr",
    "baewha.ac.kr"
];

// 차단할 도메인 (개인 이메일 등)
const BLOCKED_DOMAINS = [
    "gmail.com", "naver.com", "daum.net", "kakao.com", "hotmail.com", "outlook.com", "nate.com"
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
    
    // Biometric State
    const [biometricValue, setBiometricValue] = useState('');
    const [isFetchingBio, setIsFetchingBio] = useState(false);

    // Verification Status UI
    const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'FAIL'>('IDLE');
    const [verifyMessage, setVerifyMessage] = useState('');

    // Email Verification State
    const [certEmail, setCertEmail] = useState('');
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [verificationCodeInput, setVerificationCodeInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [emailSending, setEmailSending] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

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
        // If first type is BIOMETRIC but user has no wearable, fallback to PHOTO
        let defaultType = subGoal.evidenceTypes?.[0] || 'PHOTO';
        if (defaultType === 'BIOMETRIC' && !currentUser?.hasWearable) {
            defaultType = 'PHOTO';
        }
        
        setCertType(defaultType);
        setCertText('');
        setCertFile(null);
        setCertPreviewUrl(null);
        setBiometricValue('');
        setIsFetchingBio(false);
        
        // Reset Email State
        setCertEmail('');
        setEmailVerificationSent(false);
        setVerificationCodeInput('');
        setGeneratedCode(null);
        setEmailError(null);
        
        // Reset Verify State
        setVerifyStatus('IDLE');
        setVerifyMessage('');
        
        setShowCertModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCertFile(file);
            setCertPreviewUrl(URL.createObjectURL(file));
            setVerifyStatus('IDLE'); // Reset status on new file
        }
    };

    const isDomainAllowed = (email: string) => {
        if (!email.includes('@')) return false;
        const domain = email.split('@')[1].trim().toLowerCase();
        if (!domain) return false;

        // 1. 차단 도메인 확인
        if (BLOCKED_DOMAINS.includes(domain)) return false;

        // 2. 허용 패턴 확인 (와일드카드 지원)
        return ALLOWED_PATTERNS.some(pattern => {
            if (pattern.startsWith('*')) {
                // *.ac.kr -> regex: ^.*\.ac\.kr$
                const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
                const regex = new RegExp(regexStr);
                return regex.test(domain);
            }
            return domain === pattern.toLowerCase();
        });
    };

    const handleSendVerificationEmail = async () => {
        setEmailError(null);
        if (!certEmail) return alert('이메일을 입력해주세요.');
        
        // 도메인 검증
        if (!isDomainAllowed(certEmail)) {
            const msg = `허용되지 않는 도메인입니다.\n학교 또는 회사 이메일만 사용 가능합니다.\n(허용: ${ALLOWED_PATTERNS.join(', ')})`;
            setEmailError(msg);
            alert(msg);
            return;
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

    // --- Simulated Biometric Sync ---
    const handleSyncBiometric = () => {
        if (selectedSubGoalIndex === null || !plan) return;
        setIsFetchingBio(true);
        setVerifyStatus('IDLE');
        setVerifyMessage('');

        // Simulate API delay
        setTimeout(() => {
            const subGoal = plan.subGoals[selectedSubGoalIndex];
            const rule = subGoal.exampleBiometricData || '';
            let simulatedValue = '0';

            // Try to generate a "passing" value based on the rule
            const match = rule.match(/([><=])\s*(\d+)/);
            if (match) {
                const operator = match[1];
                const threshold = parseInt(match[2], 10);
                // Generate a random successful value
                if (operator === '>') simulatedValue = (threshold + Math.floor(Math.random() * 20) + 5).toString();
                else if (operator === '<') simulatedValue = (threshold - Math.floor(Math.random() * 10) - 1).toString();
                else simulatedValue = threshold.toString();
            } else {
                // Default if no rule
                simulatedValue = (Math.floor(Math.random() * 60) + 80).toString(); 
            }

            setBiometricValue(simulatedValue);
            setIsFetchingBio(false);
        }, 2000);
    };

    // --- Validation Logic ---

    const validateMediaTime = (file: File, dueTimeStr?: string): { valid: boolean; msg: string } => {
        if (!dueTimeStr) return { valid: true, msg: '' }; // No strict time set

        const now = new Date();
        const fileTime = new Date(file.lastModified);
        
        // Construct target Date based on Today + DueTime
        const targetDate = new Date();
        const [hours, minutes] = dueTimeStr.split(':').map(Number);
        targetDate.setHours(hours, minutes, 0, 0);

        const diffMs = Math.abs(targetDate.getTime() - fileTime.getTime());
        const diffMins = diffMs / (1000 * 60);

        // Allow if file was created TODAY and within 20 mins of target
        const isSameDay = fileTime.toDateString() === targetDate.toDateString();

        if (!isSameDay) {
            return { valid: false, msg: '오늘 촬영된 사진/영상이 아닙니다.' };
        }

        if (diffMins > 20) {
            return { valid: false, msg: `인증 시간(${dueTimeStr}) 전후 20분을 초과했습니다.\n(촬영 시간: ${fileTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})` };
        }

        return { valid: true, msg: '시간 검증 완료' };
    };

    const validateBiometric = (inputVal: string, aiRule?: string): { valid: boolean; msg: string } => {
        if (!inputVal) return { valid: false, msg: '데이터를 동기화해주세요.' };
        if (!aiRule) return { valid: true, msg: '조건 없음 (통과)' };

        const numVal = parseFloat(inputVal);
        if (isNaN(numVal)) return { valid: false, msg: '유효한 수치가 아닙니다.' };

        // Simple Regex to extract number and operator
        const match = aiRule.match(/([><=])\s*(\d+)/);
        
        if (match) {
            const operator = match[1];
            const threshold = parseFloat(match[2]);
            
            if (operator === '>' && numVal > threshold) return { valid: true, msg: '목표 수치 달성!' };
            if (operator === '<' && numVal < threshold) return { valid: true, msg: '목표 수치 달성!' };
            if (operator === '=' && numVal === threshold) return { valid: true, msg: '목표 수치 달성!' };
            
            return { valid: false, msg: `목표 조건(${aiRule})을 만족하지 못했습니다.` };
        }

        return { valid: true, msg: '조건 검증 불가 (자동 통과)' };
    };

    const handleEvidenceSubmit = async () => {
        if (!plan || selectedSubGoalIndex === null || !currentUser) return;
        
        const subGoal = plan.subGoals[selectedSubGoalIndex];
        setSubmitting(true);
        setVerifyStatus('VERIFYING');
        setVerifyMessage('증거물 유효성을 검사 중입니다...');

        try {
            let evidenceData: Evidence = {
                id: `ev-${Date.now()}`,
                type: certType,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                credibilityScore: 0
            };

            // 1. Validation Steps based on Type
            if (certType === 'PHOTO' || certType === 'VIDEO') {
                if (!certFile) throw new Error('파일을 업로드해주세요.');

                // A. Time Check
                const timeCheck = validateMediaTime(certFile, subGoal.dueTime);
                if (!timeCheck.valid) {
                    setVerifyStatus('FAIL');
                    setVerifyMessage(timeCheck.msg);
                    setSubmitting(false);
                    return;
                }

                // B. Hash Check (Duplicate Prevention)
                const currentHash = await calculateFileHash(certFile);
                const isDuplicate = plan.subGoals.some(sg => 
                    sg.evidences?.some(ev => ev.fileHash === currentHash)
                );

                if (isDuplicate) {
                    setVerifyStatus('FAIL');
                    setVerifyMessage('이미 사용된 사진/영상입니다. 새로운 증거물을 제출해주세요.');
                    setSubmitting(false);
                    return;
                }

                const url = await uploadImage(certFile, 'evidence');
                evidenceData.url = url;
                evidenceData.fileHash = currentHash;
                evidenceData.imageUrls = [url];
                evidenceData.credibilityScore = 98; 

            } else if (certType === 'BIOMETRIC') {
                // Biometric Check
                const bioCheck = validateBiometric(biometricValue, subGoal.exampleBiometricData);
                if (!bioCheck.valid) {
                    setVerifyStatus('FAIL');
                    setVerifyMessage(bioCheck.msg);
                    setSubmitting(false);
                    return;
                }
                evidenceData.content = `생체 데이터 인증: ${biometricValue}`;
                evidenceData.credibilityScore = 100; // Trusted source (simulated)

            } else if (certType === 'TEXT') {
                if (!certText) throw new Error('내용을 입력해주세요.');
                evidenceData.content = certText;
                evidenceData.credibilityScore = 80;

            } else if (certType === 'EMAIL') {
                if (!emailVerificationSent || !generatedCode) throw new Error('이메일 인증이 필요합니다.');
                if (verificationCodeInput !== generatedCode) throw new Error('인증 코드가 일치하지 않습니다.');
                evidenceData.verifiedEmail = certEmail;
                evidenceData.status = 'APPROVED';
                evidenceData.credibilityScore = 100;
            }

            setVerifyStatus('SUCCESS');
            setVerifyMessage('인증 유효성 검사 통과! 제출합니다...');
            
            await new Promise(resolve => setTimeout(resolve, 800));

            await submitEvidence(plan.id, selectedSubGoalIndex, evidenceData);
            
            alert('인증이 완료되었습니다!');
            setShowCertModal(false);
            loadPlan(); 
        } catch (e: any) {
            setVerifyStatus('FAIL');
            setVerifyMessage(e.message || '오류가 발생했습니다.');
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

    const getDDay = (dateStr?: string) => {
        if (!dateStr) return null;
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        target.setHours(0,0,0,0);
        
        const diff = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "D-Day";
        if (diffDays > 0) return `D-${diffDays}`;
        return `D+${Math.abs(diffDays)}`;
    };

    if (loading) return <div className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></div>;
    if (error || !plan) return <div className="p-20 text-center">{error || 'Plan not found'}</div>;

    const isAuthor = currentUser?.id === plan.authorId;

    // Filter available cert types: BIOMETRIC only if user has wearable
    const availableCertTypes = [
        { id: 'PHOTO', label: '사진', icon: Camera },
        { id: 'VIDEO', label: '영상', icon: PlayCircle },
        { id: 'TEXT', label: '글', icon: TypeIcon },
        ...(currentUser?.hasWearable ? [{ id: 'BIOMETRIC', label: '생체', icon: Watch }] : []),
        { id: 'EMAIL', label: '이메일', icon: Mail },
        { id: 'API', label: '연동', icon: LinkIcon }
    ];

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
                {plan.subGoals.map((sg, idx) => {
                    const latestEvidence = sg.evidences && sg.evidences.length > 0 ? sg.evidences[sg.evidences.length - 1] : null;
                    const credibilityScore = latestEvidence?.credibilityScore;
                    const dDay = getDDay(sg.dueDate);
                    const hasBiometricEvidence = sg.evidences?.some(e => e.type === 'BIOMETRIC');

                    return (
                        <div key={idx} className={`bg-white rounded-2xl p-5 border transition-all ${sg.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            sg.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {sg.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        <h3 className={`font-bold text-gray-900 ${sg.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{sg.title}</h3>
                                    </div>
                                    
                                    {/* D-Day & Due Date Info */}
                                    <div className="pl-9 mb-2 flex items-center gap-2 text-xs">
                                        {dDay && (
                                            <span className={`font-bold px-1.5 py-0.5 rounded ${
                                                dDay === 'D-Day' ? 'bg-red-100 text-red-600' :
                                                dDay.startsWith('D+') ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {dDay}
                                            </span>
                                        )}
                                        {sg.dueDate && (
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {sg.dueDate}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 pl-9 mb-3">{sg.description}</p>
                                    
                                    {sg.status === 'completed' && sg.evidences && sg.evidences.length > 0 && (
                                        <div className="pl-9 mb-2">
                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> 인증 완료 ({sg.evidences.length})
                                                </div>
                                                {credibilityScore && (
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" /> 신빙성 {credibilityScore}%
                                                    </span>
                                                )}
                                                {/* Biometric Badge */}
                                                {hasBiometricEvidence && (
                                                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                                                        <Activity className="w-3 h-3" /> 생체 데이터 인증
                                                    </span>
                                                )}
                                            </div>
                                            {/* Evidence Preview if photo */}
                                            <div className="flex gap-2">
                                                {sg.evidences.filter(e => e.type === 'PHOTO').map((e, i) => (
                                                    <div key={i} className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 group">
                                                        <img src={e.url} alt="evidence" className="w-full h-full object-cover" />
                                                        {e.credibilityScore && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-[10px] font-bold">{e.credibilityScore}%</span>
                                                            </div>
                                                        )}
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
                    );
                })}
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
                            {selectedSubGoalIndex !== null && plan.subGoals[selectedSubGoalIndex].dueTime && (
                                <p className="text-xs text-primary-600 font-bold mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 목표 시간: {plan.subGoals[selectedSubGoalIndex].dueTime} (±20분 허용)
                                </p>
                            )}
                        </div>

                        {/* Certification Type Selector - Filtered for Wearable Users */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                            {availableCertTypes.map(t => (
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
                                        className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary-400 transition-colors overflow-hidden relative"
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

                            {certType === 'BIOMETRIC' && (
                                <div className="space-y-4">
                                    <div className="bg-indigo-50 p-4 rounded-xl text-xs text-indigo-700">
                                        <span className="font-bold text-sm block mb-1 flex items-center gap-1">
                                            <Activity className="w-4 h-4" /> AI 권장 데이터
                                        </span>
                                        <p className="opacity-80 mb-2">
                                            {selectedSubGoalIndex !== null && plan.subGoals[selectedSubGoalIndex].exampleBiometricData 
                                                ? plan.subGoals[selectedSubGoalIndex].exampleBiometricData
                                                : "설정된 목표 수치가 없습니다."}
                                        </p>
                                    </div>

                                    {!biometricValue ? (
                                        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                            {isFetchingBio ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-25"></div>
                                                        <div className="relative bg-white p-3 rounded-full shadow-md">
                                                            <Watch className="w-8 h-8 text-primary-600 animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-600 animate-pulse">워치 데이터 측정 중...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Watch className="w-10 h-10 text-gray-300 mb-3" />
                                                    <p className="text-sm text-gray-500 mb-4">연동된 웨어러블 기기에서<br/>데이터를 가져옵니다.</p>
                                                    <Button onClick={handleSyncBiometric} className="flex items-center gap-2">
                                                        <RefreshCw className="w-4 h-4" /> 워치 데이터 동기화
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white border-2 border-primary-100 rounded-xl p-5 text-center shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                                연동 완료
                                            </div>
                                            <p className="text-gray-500 text-xs mb-1">측정된 데이터</p>
                                            <div className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                                                <Zap className="w-6 h-6 text-yellow-500 fill-current" />
                                                {biometricValue}
                                            </div>
                                            <button 
                                                onClick={handleSyncBiometric}
                                                className="text-xs text-gray-400 underline hover:text-gray-600"
                                            >
                                                다시 측정하기
                                            </button>
                                        </div>
                                    )}
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
                                            * 허용 도메인: {ALLOWED_PATTERNS.join(', ')}
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
                                    {emailError && (
                                        <div className="text-xs text-red-500 whitespace-pre-line bg-red-50 p-2 rounded-lg border border-red-100 flex items-start gap-1">
                                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                            {emailError}
                                        </div>
                                    )}
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
                            
                            {certType === 'API' && (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">현재 데모 버전에서는 지원하지 않는 기능입니다.</p>
                                    <p className="text-xs mt-1">대신 '사진'이나 '글'로 인증해주세요.</p>
                                </div>
                            )}
                        </div>

                        {/* Validation Feedback UI */}
                        {verifyStatus !== 'IDLE' && (
                            <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 text-sm ${
                                verifyStatus === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                                verifyStatus === 'FAIL' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {verifyStatus === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                                {verifyStatus === 'FAIL' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                                {verifyStatus === 'VERIFYING' && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
                                <span>{verifyMessage}</span>
                            </div>
                        )}

                        <Button fullWidth onClick={handleEvidenceSubmit} disabled={submitting || verifyStatus === 'FAIL' || (certType === 'BIOMETRIC' && !biometricValue)}>
                            {submitting ? '처리 중...' : '인증 제출하기'}
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
