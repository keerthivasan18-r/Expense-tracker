import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import { Trash2, Search, Calendar, Tag } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => filterCategory === 'All' || e.category === filterCategory)
      .filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory, searchTerm]);

  const getCategoryStyles = (cat: Category) => {
    switch(cat) {
      case Category.FOOD: return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case Category.TRANSPORT: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case Category.ENTERTAINMENT: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case Category.SHOPPING: return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case Category.EDUCATION: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case Category.HOUSING: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case Category.HEALTH: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getCategoryIcon = (cat: Category) => {
      switch(cat) {
        case Category.FOOD: return '🍜';
        case Category.TRANSPORT: return '🚇';
        case Category.ENTERTAINMENT: return '🎬';
        case Category.SHOPPING: return '🛍️';
        case Category.EDUCATION: return '📚';
        case Category.HOUSING: return '🏠';
        case Category.HEALTH: return '💊';
        default: return '📝';
      }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-6">
      
      {/* Filters Toolbar */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-xl shadow-black/10 backdrop-blur-md">
         <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto p-1 no-scrollbar">
            <button 
                onClick={() => setFilterCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    filterCategory === 'All' 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/30' 
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-white'
                }`}
            >
                All
            </button>
            {Object.values(Category).map(c => (
                 <button 
                    key={c}
                    onClick={() => setFilterCategory(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        filterCategory === c 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    {c}
                </button>
            ))}
         </div>
      </div>

      {/* List Layout */}
      <div className="space-y-4 pb-8">
        {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
          <div 
            key={expense.id} 
            className="group bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${getCategoryStyles(expense.category)}`}>
                    {getCategoryIcon(expense.category)}
                </div>
                <div>
                    <h4 className="font-bold text-slate-200 text-base mb-1">{expense.description}</h4>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                           <Calendar size={12} /> {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                           <Tag size={12} /> {expense.category}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                <span className="text-lg font-bold text-white tracking-tight">
                    ₹{expense.amount.toLocaleString('en-IN')}
                </span>
                <button 
                    onClick={() => onDelete(expense.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-700 shadow-sm">
                <Search size={24} />
             </div>
             <p className="font-medium text-sm">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};