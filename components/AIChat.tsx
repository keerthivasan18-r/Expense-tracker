import React, { useState, useEffect } from 'react';
import { Expense, Budget } from '../types';
import { analyzeSpendingHabits } from '../services/geminiService';
import { Sparkles, Lightbulb, TrendingDown, RefreshCw, Bot } from 'lucide-react';

interface AIChatProps {
  expenses: Expense[];
  budgets: Budget[];
}

export const AIChat: React.FC<AIChatProps> = ({ expenses, budgets }) => {
  const [analysis, setAnalysis] = useState<{ summary: string, tips: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await analyzeSpendingHabits(expenses, budgets);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (expenses.length > 0 && !analysis) {
        fetchInsights();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses.length]);

  return (
    <div className="group relative overflow-hidden rounded-3xl shadow-xl transition-all hover:shadow-2xl hover:shadow-violet-500/20">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 animate-gradient-xy"></div>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Glass Content */}
      <div className="relative z-10 p-6 text-white h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-inner ring-1 ring-white/30">
                    <Bot size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold tracking-tight">AI Advisor</h3>
                    <p className="text-violet-200 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} /> Live Insights
                    </p>
                </div>
            </div>
            <button 
                onClick={fetchInsights} 
                disabled={loading}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm ring-1 ring-white/10 active:scale-95 disabled:opacity-50"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        {loading ? (
            <div className="space-y-4 py-2 flex-1">
                <div className="h-4 bg-white/20 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded-full w-5/6 animate-pulse"></div>
            </div>
        ) : analysis ? (
            <div className="space-y-5">
                <div className="bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                    <p className="text-violet-50 font-medium leading-relaxed text-sm">
                        "{analysis.summary}"
                    </p>
                </div>
                
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-violet-200 opacity-80">Action Plan</h4>
                    {analysis.tips.map((tip, idx) => (
                        <div key={idx} className="flex gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                            {idx === 0 ? <TrendingDown size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" /> :
                             <Lightbulb size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />}
                            <span className="text-sm text-white font-medium">{tip}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center py-8 text-violet-200 bg-white/5 rounded-2xl border border-dashed border-white/20">
                <p className="text-sm font-medium">Add expenses to unlock AI insights.</p>
            </div>
        )}
      </div>
    </div>
  );
};