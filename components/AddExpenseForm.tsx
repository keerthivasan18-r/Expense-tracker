import React, { useState } from 'react';
import { Category, Expense } from '../types';
import { parseExpenseFromNaturalLanguage } from '../services/geminiService';
import { Plus, Wand2, Loader2, X, FileText, IndianRupee, Calendar as CalendarIcon, Tag } from 'lucide-react';

interface AddExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onClose: () => void;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onAdd, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [naturalInput, setNaturalInput] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      date
    });
    onClose();
  };

  const handleMagicAdd = async () => {
    if (!naturalInput) return;
    setIsProcessingAI(true);
    setAiError('');

    try {
      const result = await parseExpenseFromNaturalLanguage(naturalInput);
      if (result) {
        setDescription(result.description);
        setAmount(result.amount.toString());
        setCategory(result.category);
        if (result.date) setDate(result.date);
      } else {
        setAiError('Could not understand. Try "Lunch ₹250 yesterday".');
      }
    } catch (e) {
      setAiError('AI service unavailable.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div 
         className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
         onClick={onClose}
       />
       
       <div className="relative w-full max-w-lg bg-[#020617] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
          
          <div className="relative px-8 pt-8 pb-6">
             <div className="flex justify-between items-center relative z-10">
                <h2 className="text-2xl font-bold text-white">New Expense</h2>
                <button 
                  onClick={onClose} 
                  className="bg-slate-900 text-slate-500 hover:text-white p-2 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
             </div>
          </div>

          <div className="px-8 pb-8 overflow-y-auto custom-scrollbar space-y-6">
             
             {/* AI Magic Section */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Wand2 size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Magic Fill</span>
                </div>
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    placeholder="e.g. Starbucks ₹350 today"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMagicAdd()}
                    />
                    <button 
                    onClick={handleMagicAdd}
                    disabled={isProcessingAI || !naturalInput}
                    className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[3rem]"
                    >
                    {isProcessingAI ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    </button>
                </div>
                {aiError && <p className="text-rose-400 text-xs mt-2 font-medium">{aiError}</p>}
             </div>

             <div className="relative flex items-center">
               <div className="flex-grow border-t border-slate-800"></div>
               <span className="flex-shrink-0 mx-4 text-slate-600 text-xs font-bold uppercase">Manual Entry</span>
               <div className="flex-grow border-t border-slate-800"></div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                         <FileText size={18} />
                      </div>
                      <input
                        required
                        type="text"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500/50 outline-none transition-all font-medium text-white placeholder:text-slate-600"
                        placeholder="What did you spend on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Amount</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <IndianRupee size={18} />
                         </div>
                         <input
                           required
                           type="number"
                           step="1"
                           className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500/50 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                           placeholder="0"
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Date</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <CalendarIcon size={18} />
                         </div>
                         <input
                           required
                           type="date"
                           className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500/50 outline-none transition-all font-medium text-white"
                           value={date}
                           onChange={(e) => setDate(e.target.value)}
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1">Category</label>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                         <Tag size={18} />
                      </div>
                      <select
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500/50 outline-none transition-all font-medium text-white appearance-none cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                      >
                        {Object.values(Category).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                   </div>
                </div>

                <div className="flex gap-3 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 text-slate-400 hover:text-white rounded-xl transition-all font-medium text-sm hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-bold text-sm shadow-lg shadow-indigo-900/30"
                  >
                    Save Expense
                  </button>
                </div>

             </form>
          </div>
       </div>
    </div>
  );
};