import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Expense, Budget, Category } from '../types';
import { Wallet, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

// Harmonious Theme Palette
const COLORS = [
  '#6366f1', // Indigo-500
  '#10b981', // Emerald-500
  '#f59e0b', // Amber-500
  '#ec4899', // Pink-500
  '#06b6d4', // Cyan-500
  '#8b5cf6', // Violet-500
  '#f43f5e', // Rose-500
  '#64748b'  // Slate-500
];

const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 p-4 border border-slate-700 shadow-xl rounded-xl text-sm">
        <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></div>
            <p className="font-semibold text-slate-200">{payload[0].name}</p>
        </div>
        <p className="text-white font-bold text-lg pl-4">
          {formatINR(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ expenses, budgets }) => {
  
  const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    Object.values(Category).forEach(c => data[c] = 0);
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const budgetProgress = useMemo(() => {
    return budgets
        .filter(b => b.limit > 0)
        .map(b => {
            const spent = expenses
                .filter(e => e.category === b.category)
                .reduce((acc, curr) => acc + curr.amount, 0);
            return {
                name: b.category,
                spent,
                limit: b.limit,
                percent: Math.min((spent / b.limit) * 100, 100)
            };
        })
        .sort((a, b) => b.percent - a.percent);
  }, [expenses, budgets]);

  const StatCard = ({ icon: Icon, label, value, trend, colorClass }: any) => (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-white`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">
                    <TrendingUp size={12} />
                    {trend}
                </div>
            )}
        </div>
        <p className="text-slate-500 text-sm font-medium mb-1 tracking-wide">{label}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Wallet} 
          label="Total Spending" 
          value={formatINR(totalSpent)}
          trend="Tracked"
          colorClass="bg-indigo-500"
        />
        <StatCard 
          icon={ArrowUpRight} 
          label="Top Category" 
          value={categoryData[0]?.name || 'N/A'}
          colorClass="bg-amber-500"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Budget Alerts" 
          value={budgetProgress.filter(b => b.spent > b.limit).length}
          colorClass="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Breakdown Chart */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-white">Expense Breakdown</h3>
                <p className="text-slate-500 text-sm">Where your money goes</p>
             </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-slate-500 font-medium ml-2 mr-4">{value}</span>}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                   <p>No data available</p>
                </div>
            )}
             {/* Center Text */}
             {categoryData.length > 0 && (
                <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total</p>
                    <p className="text-lg font-bold text-white">{formatINR(totalSpent)}</p>
                </div>
             )}
          </div>
        </div>

        {/* Budget vs Actual Chart */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-white">Budget Tracking</h3>
                <p className="text-slate-500 text-sm">Monthly limits vs Actuals</p>
             </div>
          </div>
          
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {budgetProgress.length > 0 ? budgetProgress.map((item) => (
                <div key={item.name} className="group">
                    <div className="flex justify-between text-sm mb-2.5">
                        <span className="font-semibold text-slate-300 flex items-center gap-2">
                           {item.name}
                           {item.spent > item.limit && <AlertCircle size={14} className="text-rose-500" />}
                        </span>
                        <span className="text-slate-500 text-xs font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                           <span className={item.spent > item.limit ? "text-rose-500 font-bold" : "text-slate-200"}>{formatINR(item.spent)}</span> 
                           <span className="mx-1 opacity-50">/</span> 
                           {formatINR(item.limit)}
                        </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                                item.spent > item.limit ? 'bg-rose-500' : 
                                item.percent > 85 ? 'bg-amber-500' : 
                                'bg-emerald-500'
                            }`}
                            style={{ width: `${item.percent}%` }}
                        ></div>
                    </div>
                </div>
            )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                   <p>Set a budget to see progress</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};