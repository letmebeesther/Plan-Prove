import React, { useState } from 'react';
import { Wand2, Calendar, Target, AlignLeft, AlertCircle } from 'lucide-react';
import { generateAIPlan, AIPlanResponse } from '../services/geminiService';

export function NewPlan() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Input State
  const [goalInput, setGoalInput] = useState('');
  const [durationInput, setDurationInput] = useState('30 days');
  const [levelInput, setLevelInput] = useState('Beginner');
  const [styleInput, setStyleInput] = useState('Steady');

  // Result State
  const [generatedPlan, setGeneratedPlan] = useState<AIPlanResponse | null>(null);

  const handleGenerate = async () => {
    if (!goalInput) return;
    
    setLoading(true);
    setError('');
    
    try {
      const plan = await generateAIPlan({
        goal: goalInput,
        duration: durationInput,
        level: levelInput,
        style: styleInput
      });
      setGeneratedPlan(plan);
    } catch (err) {
      setError('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    alert("Plan Saved! (This would persist to DB)");
    // Navigate home...
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-gray-900">Create New Plan</h1>
         <div className="bg-white p-1 rounded-xl border border-gray-200 flex">
            <button 
                onClick={() => setMode('ai')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <Wand2 className="w-4 h-4" /> AI Auto
            </button>
            <button 
                onClick={() => setMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'manual' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <Target className="w-4 h-4" /> Manual
            </button>
         </div>
      </div>

      {/* AI Form */}
      {mode === 'ai' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What is your main goal?</label>
                    <textarea 
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g. Lose 5kg, Learn Python, Read 3 books..."
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <select 
                            value={durationInput}
                            onChange={(e) => setDurationInput(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                        >
                            <option>1 Week</option>
                            <option>2 Weeks</option>
                            <option>30 Days</option>
                            <option>3 Months</option>
                            <option>6 Months</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                        <select 
                             value={levelInput}
                             onChange={(e) => setLevelInput(e.target.value)}
                             className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                        <select 
                             value={styleInput}
                             onChange={(e) => setStyleInput(e.target.value)}
                             className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                        >
                            <option>Steady (Consistent)</option>
                            <option>Intensive (Bootcamp)</option>
                            <option>Flexible</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <button 
                onClick={handleGenerate}
                disabled={loading || !goalInput}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${loading || !goalInput ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 active:scale-[0.99]'}`}
            >
                {loading ? <><span className="animate-spin text-xl">✨</span> Generating Plan...</> : <><Wand2 className="w-5 h-5" /> Generate Plan with Gemini</>}
            </button>
        </div>
      )}

      {/* Manual Form Placeholder */}
      {mode === 'manual' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-500">Manual creation mode form would go here.</p>
          </div>
      )}

      {/* Generated Result Preview */}
      {generatedPlan && (
        <div className="bg-white rounded-2xl shadow-lg border border-primary-100 overflow-hidden animate-fade-in">
            <div className="bg-primary-50 p-6 border-b border-primary-100">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-2 py-1 bg-white text-primary-600 text-xs font-bold rounded mb-2 border border-primary-100">{generatedPlan.category}</span>
                        <h2 className="text-2xl font-bold text-gray-900">{generatedPlan.title}</h2>
                        <p className="text-gray-600 mt-2">{generatedPlan.description}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Calendar className="w-6 h-6 text-primary-500" />
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlignLeft className="w-5 h-5" /> Milestones (Sub-goals)
                </h3>
                <div className="space-y-4">
                    {generatedPlan.subGoals.map((sub, idx) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors bg-gray-50/50">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{sub.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                                <div className="mt-2 text-xs font-medium text-gray-400">Est. {sub.estimatedDays} days</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                    <button onClick={() => setGeneratedPlan(null)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Discard</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all">Start Plan</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}