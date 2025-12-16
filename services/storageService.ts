import { Expense, Budget, Category } from '../types';

// Constants for LocalStorage
const STORAGE_KEYS = {
  EXPENSES: 'student_expenses_data',
  BUDGETS: 'student_budgets_data'
};

// Custom events for reactivity
const EVENTS = {
  EXPENSES_UPDATED: 'expenses_updated',
  BUDGETS_UPDATED: 'budgets_updated'
};

// Helper to dispatch updates
const triggerEvent = (eventName: string) => {
  window.dispatchEvent(new Event(eventName));
};

// --- EXPENSES ---

export const subscribeToExpenses = (onUpdate: (expenses: Expense[]) => void) => {
  const loadExpenses = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const expenses: Expense[] = stored ? JSON.parse(stored) : [];
      // Sort by date descending
      expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(expenses);
    } catch (e) {
      console.error("Failed to load expenses:", e);
      onUpdate([]);
    }
  };

  loadExpenses(); // Initial load

  const handler = () => loadExpenses();
  
  // Listen for local updates and cross-tab updates
  window.addEventListener(EVENTS.EXPENSES_UPDATED, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENTS.EXPENSES_UPDATED, handler);
    window.removeEventListener('storage', handler);
  };
};

export const addExpenseToDb = async (expense: Expense) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const expenses: Expense[] = stored ? JSON.parse(stored) : [];
    expenses.push(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    triggerEvent(EVENTS.EXPENSES_UPDATED);
  } catch (e) {
    console.error("Error adding expense:", e);
    alert("Failed to save expense locally.");
  }
};

export const deleteExpenseFromDb = async (id: string) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    let expenses: Expense[] = stored ? JSON.parse(stored) : [];
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    triggerEvent(EVENTS.EXPENSES_UPDATED);
  } catch (e) {
    console.error("Error deleting expense:", e);
  }
};

// --- BUDGETS ---

export const subscribeToBudgets = (onUpdate: (budgets: Budget[]) => void) => {
  const loadBudgets = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      let budgets: Budget[] = stored ? JSON.parse(stored) : [];

      // If empty, set defaults
      if (budgets.length === 0) {
        budgets = Object.values(Category).map(cat => ({
            category: cat,
            limit: cat === Category.FOOD ? 5000 : cat === Category.ENTERTAINMENT ? 1500 : 0
        }));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      } else {
        // Merge missing categories if any new ones were added to the enum
        const existing = new Set(budgets.map(b => b.category));
        const missing = Object.values(Category)
            .filter(c => !existing.has(c))
            .map(c => ({ category: c, limit: 0 }));
        
        if (missing.length > 0) {
            budgets = [...budgets, ...missing];
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
        }
      }
      onUpdate(budgets);
    } catch (e) {
      console.error("Failed to load budgets:", e);
      onUpdate([]);
    }
  };

  loadBudgets();

  const handler = () => loadBudgets();
  window.addEventListener(EVENTS.BUDGETS_UPDATED, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENTS.BUDGETS_UPDATED, handler);
    window.removeEventListener('storage', handler);
  };
};

export const updateBudgetInDb = async (budget: Budget) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    let budgets: Budget[] = stored ? JSON.parse(stored) : [];
    
    const index = budgets.findIndex(b => b.category === budget.category);
    if (index >= 0) {
      budgets[index] = budget;
    } else {
      budgets.push(budget);
    }
    
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    triggerEvent(EVENTS.BUDGETS_UPDATED);
  } catch (e) {
    console.error("Error updating budget:", e);
  }
};