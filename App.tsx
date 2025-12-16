import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  Plus, 
  Menu, 
  X,
  Zap,
  TrendingUp,
  LogOut,
  IndianRupee
} from 'lucide-react';
import { Expense, Budget, Category } from './types';
import { 
  subscribeToExpenses, 
  addExpenseToDb, 
  deleteExpenseFromDb, 
  subscribeToBudgets, 
  updateBudgetInDb 
} from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseForm } from './components/AddExpenseForm';
import { AIChat } from './components/AIChat';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'settings'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-time Subscriptions
  useEffect(() => {
    // Connect to Firebase and listen for changes
    const unsubscribeExpenses = subscribeToExpenses((data) => {
        setExpenses(data);
    });

    const unsubscribeBudgets = subscribeToBudgets((data) => {
        setBudgets(data);
    });

    // Cleanup listeners on unmount
    return () => {
        unsubscribeExpenses();
        unsubscribeBudgets();
    };
  }, []);

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: crypto.randomUUID()
    };
    // Send to Firebase (State will update automatically via subscription)
    addExpenseToDb(expense);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseFromDb(id);
  };

  const handleUpdateBudget = (category: Category, limit: number) => {
    // Optimistic update for smoother UI (optional, but good for sliders/inputs)
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit } : b));
    // Send to Firebase
    updateBudgetInDb({ category, limit });
  };

  const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);
  const totalBudget = budgets.reduce((a, b) => a + b.limit, 0);
  const budgetProgress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left mb-1
        ${activeTab === id 
          ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-900/40' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
    >
      <Icon size={20} className={activeTab === id ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex font-sans text-slate-200 bg-[#020617]">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#020617]/95 backdrop-blur-md z-40 px-5 py-4 flex justify-between items-center border-b border-slate-800">
         <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-white text-lg">Fin<span className="text-indigo-400">AI</span></span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 p-2 hover:bg-slate-800 rounded-lg">
           {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#020617] border-r border-slate-800 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:block flex flex-col justify-between
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
           <div className="flex items-center gap-3 mb-10 mt-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
                <Zap size={24} fill="currentColor" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white leading-tight">Student<span className="text-indigo-400">Fi</span></h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Expense Tracker</p>
             </div>
           </div>
           
           <nav className="space-y-1">
             <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4 px-4">Menu</div>
             <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
             <NavItem id="expenses" icon={CreditCard} label="Transactions" />
             <NavItem id="settings" icon={Wallet} label="Budgets" />
           </nav>
        </div>

        <div className="p-6">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-slate-400">Monthly Cap</span>
                    <span className="text-xs font-bold text-indigo-400">{budgetProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 mb-3 border border-slate-800">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${budgetProgress > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-white">₹{totalSpent.toLocaleString('en-IN')}</span>
                    <span className="text-slate-500">of ₹{totalBudget.toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <button className="flex items-center gap-3 mt-6 text-slate-500 hover:text-white transition-colors px-2">
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto mt-16 lg:mt-0 h-screen custom-scrollbar bg-[#020617]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'dashboard' && 'Financial Overview'}
              {activeTab === 'expenses' && 'Transactions'}
              {activeTab === 'settings' && 'Budget Settings'}
            </h2>
            <p className="text-slate-400 mt-1">Manage your money effectively.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition-all active:scale-95 font-medium"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>New Expense</span>
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {activeTab === 'dashboard' && <Dashboard expenses={expenses} budgets={budgets} />}
            {activeTab === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />}
            
            {activeTab === 'settings' && (
              <div className="bg-slate-900 rounded-3xl shadow-sm border border-slate-800 p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Monthly Budget Limits</h3>
                        <p className="text-slate-400 text-sm">Set your maximum spending limits in INR (₹).</p>
                    </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {budgets.map((budget) => (
                    <div key={budget.category} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-slate-300">{budget.category}</span>
                        <div className="p-1.5 rounded-lg bg-slate-900 text-slate-500">
                           {budget.category === Category.FOOD ? '🍛' : 
                            budget.category === Category.TRANSPORT ? '🚕' : 
                            budget.category === Category.ENTERTAINMENT ? '🎬' : '🏷️'}
                        </div>
                      </div>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                        <input
                          type="number"
                          value={budget.limit}
                          onChange={(e) => handleUpdateBudget(budget.category, parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none placeholder:text-slate-600 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
             <AIChat expenses={expenses} budgets={budgets} />
             
             {/* Mini Recent List */}
             {activeTab === 'dashboard' && (
                <div className="bg-slate-900 rounded-3xl shadow-sm border border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
                        <button onClick={() => setActiveTab('expenses')} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">View All</button>
                    </div>
                    <div className="space-y-4">
                        {expenses.slice(0, 5).map(e => (
                            <div key={e.id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                                        {e.category === Category.FOOD ? '🍛' : 
                                         e.category === Category.TRANSPORT ? '🚕' : '💸'}
                                    </div>
                                    <div className="truncate">
                                        <p className="font-medium text-slate-200 truncate text-sm">{e.description}</p>
                                        <p className="text-slate-500 text-xs">{e.category}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-white text-sm">-₹{e.amount.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                        {expenses.length === 0 && <p className="text-slate-500 text-sm py-4 italic text-center">No recent transactions</p>}
                    </div>
                </div>
             )}
          </div>
        </div>

        {showAddModal && (
          <AddExpenseForm 
            onAdd={handleAddExpense} 
            onClose={() => setShowAddModal(false)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;