
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, Globe, Hash, UploadCloud } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { uploadImage } from '../services/storageService';
import { createChallenge } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const categories = ['운동', '건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서'];

export function NewChallenge() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Form State
  const [title, setTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return alert('로그인이 필요합니다.');
      if (!title || !description) return alert('제목과 설명은 필수입니다.');

      setIsSubmitting(true);
      
      try {
          let imageUrl = '';
          if (selectedFile) {
              imageUrl = await uploadImage(selectedFile, 'challenges');
          } else {
              // Fallback random image if no file uploaded
              imageUrl = `https://picsum.photos/800/400?random=${Date.now()}`;
          }

          const challengeData = {
              title,
              description,
              statusMessage,
              category,
              imageUrl,
              tags: tags.split(',').map(t => t.trim()).filter(t => t),
              isPublic,
              host: { 
                  id: currentUser.id, 
                  nickname: currentUser.nickname, 
                  avatarUrl: currentUser.avatarUrl,
                  trustScore: currentUser.trustScore
              },
              participantIds: [currentUser.id]
          };

          const newChallengeId = await createChallenge(challengeData);
          
          alert('도전방이 생성되었습니다!');
          navigate(`/challenges/${newChallengeId}`);
      } catch (error) {
          console.error(error);
          alert('도전방 생성 실패');
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">새로운 도전방 만들기</h1>
            <p className="text-gray-500 mt-1">함께하면 더 멀리 갈 수 있습니다. 동료들을 모아보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">배경 사진 (FR-148)</label>
                <div 
                    className={`h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                        previewUrl ? 'border-primary-500' : 'border-gray-200 hover:bg-gray-50'
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
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <UploadCloud className="w-10 h-10 mb-2 mx-auto" />
                            <span className="text-sm font-medium">클릭하여 이미지 업로드</span>
                            <p className="text-xs mt-1">또는 드래그 앤 드롭</p>
                        </div>
                    )}
                </div>
            </div>

            <Input 
                label="방 제목 (FR-147)" 
                placeholder="예: 매일 아침 6시 기상 챌린지" 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">상태 메시지 (FR-147)</label>
                <input 
                    type="text" 
                    placeholder="예: 일찍 일어나는 새가 되어보자!" 
                    className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500" 
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">방 설명 (FR-147)</label>
                <textarea 
                    rows={4} 
                    placeholder="어떤 방식으로 진행되는지 자세히 적어주세요." 
                    className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 resize-none" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">카테고리 (FR-149)</label>
                <select 
                    className="w-full rounded-xl border-gray-300 p-3 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">해시태그 (FR-150)</label>
                <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="쉼표(,)로 구분하여 입력 (예: 기상, 아침, 습관)" 
                        className="w-full pl-10 pr-3 py-3 rounded-xl border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500" 
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">공개 설정 (FR-151)</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setIsPublic(true)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${isPublic ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Globe className="w-6 h-6" />
                        <span className="font-bold text-sm">공개</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPublic(false)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${!isPublic ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Lock className="w-6 h-6" />
                        <span className="font-bold text-sm">비공개</span>
                    </button>
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={() => navigate(-1)} disabled={isSubmitting}>취소</Button>
                <Button type="submit" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? '생성 중...' : '도전방 생성하기'}
                </Button>
            </div>
        </form>
    </div>
  );
}
