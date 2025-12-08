import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../components/common/ProgressBar';

const steps = [
  {
    title: '성별을 선택해주세요',
    options: [
      { label: '남성', value: 'male' },
      { label: '여성', value: 'female' },
      { label: '선택 안함', value: 'none' },
    ],
  },
  {
    title: '연령대를 선택해주세요',
    options: [
      { label: '10대', value: '10s' },
      { label: '20대', value: '20s' },
      { label: '30대', value: '30s' },
      { label: '40대', value: '40s' },
      { label: '50대 이상', value: '50s+' },
    ],
  },
  {
    title: '관심사를 선택해주세요 (최대 5개)',
    multiple: true,
    maxSelection: 5,
    options: [
      { label: '건강/운동', value: 'health', emoji: '💪' },
      { label: '공부/자격증', value: 'study', emoji: '📚' },
      { label: '취미/여가', value: 'hobby', emoji: '🎨' },
      { label: '재테크', value: 'finance', emoji: '💰' },
      { label: '자기계발', value: 'self-improvement', emoji: '🌱' },
      { label: '독서', value: 'reading', emoji: '📖' },
      { label: '다이어트', value: 'diet', emoji: '🥗' },
      { label: '외국어', value: 'language', emoji: '🌍' },
      { label: '코딩', value: 'coding', emoji: '💻' },
      { label: '요리', value: 'cooking', emoji: '🍳' },
    ],
  },
  {
    title: '당신의 실천 성향은?',
    options: [
      { label: '혼자 조용히 실천', value: 'alone', desc: '나만의 페이스로 꾸준히' },
      { label: '함께 도전하며 실천', value: 'together', desc: '동료와 함께 동기부여' },
      { label: '경쟁하며 실천', value: 'compete', desc: '순위와 경쟁으로 자극' },
    ],
  },
];

export function IntroPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({});
  
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  const handleSelect = (value: string) => {
    if (currentStepData.multiple) {
      const current = (answers[currentStep] as string[]) || [];
      if (current.includes(value)) {
        setAnswers({
          ...answers,
          [currentStep]: current.filter((v) => v !== value),
        });
      } else if (current.length < (currentStepData.maxSelection || Infinity)) {
        setAnswers({
          ...answers,
          [currentStep]: [...current, value],
        });
      }
    } else {
      setAnswers({
        ...answers,
        [currentStep]: value,
      });
    }
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    navigate('/');
  };
  
  const isStepComplete = () => {
    const answer = answers[currentStep];
    if (currentStepData.multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl animate-fade-up">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-m text-gray-600">
              {currentStep + 1} / {steps.length}
            </span>
            <span className="text-body-m text-primary-600 font-medium">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <ProgressBar progress={((currentStep + 1) / steps.length) * 100} />
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-2xl shadow-[0_4px_12px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)] p-6">
          <h2 className="mb-6 text-xl font-bold">{currentStepData.title}</h2>
          
          <div className={`grid gap-3 ${currentStepData.multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
            {currentStepData.options.map((option) => {
              const isSelected = currentStepData.multiple
                ? ((answers[currentStep] as string[]) || []).includes(option.value)
                : answers[currentStep] === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-[0_2px_8px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.04)]'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {'emoji' in option && (
                    <div className="text-2xl mb-2">{option.emoji}</div>
                  )}
                  <div className="text-body-m font-medium text-gray-900">{option.label}</div>
                  {'desc' in option && (
                    <div className="text-body-s text-gray-500 mt-1">{option.desc}</div>
                  )}
                </button>
              );
            })}
          </div>
          
          {currentStepData.multiple && (
            <p className="text-body-s text-gray-600 mt-4 text-center">
              여러 개 선택 가능합니다
            </p>
          )}
          
          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                variant="text"
                onClick={handlePrev}
                className="flex-1"
              >
                이전
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? '완료' : '다음'}
            </Button>
          </div>
        </div>
        
        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-body-m text-gray-600 hover:text-gray-900 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}