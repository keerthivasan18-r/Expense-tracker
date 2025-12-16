export enum Category {
  FOOD = 'Food & Drink',
  TRANSPORT = 'Transportation',
  HOUSING = 'Housing & Utilities',
  ENTERTAINMENT = 'Entertainment',
  EDUCATION = 'Education',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  OTHER = 'Other'
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO String
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface AIAnalysisResult {
  message: string;
  tips: string[];
  status: 'good' | 'warning' | 'critical';
}

export interface ParsedExpense {
  amount: number;
  category: Category;
  description: string;
  date: string;
}
