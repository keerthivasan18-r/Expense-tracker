import { GoogleGenAI, Type } from "@google/genai";
import { Category, Expense, ParsedExpense, Budget } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

export const parseExpenseFromNaturalLanguage = async (input: string): Promise<ParsedExpense | null> => {
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract expense details from this text: "${input}". Today is ${getToday()}. If date is not specified, use today. The currency is Indian Rupees (INR), but do not include the symbol in the amount number. Map category to one of: ${Object.values(Category).join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
          },
          required: ["amount", "category", "description", "date"]
        }
      }
    });

    if (response.text) {
        const data = JSON.parse(response.text);
        // Validate category
        const matchedCategory = Object.values(Category).find(c => c === data.category) || Category.OTHER;
        return {
            ...data,
            category: matchedCategory
        };
    }
    return null;

  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
};

export const analyzeSpendingHabits = async (expenses: Expense[], budgets: Budget[]): Promise<{ summary: string, tips: string[] }> => {
  if (!apiKey) {
    return {
      summary: "Add your API Key to enable AI insights for your finances.",
      tips: ["Track every rupee spent.", "Set strict monthly limits.", "Avoid impulse buying."]
    };
  }

  const expenseSummary = expenses.slice(0, 50).map(e => `${e.date}: ${e.description} (₹${e.amount}) - ${e.category}`).join('\n');
  const budgetSummary = budgets.filter(b => b.limit > 0).map(b => `${b.category}: ₹${b.limit}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a financial advisor for an Indian student. 
      Analyze these recent expenses (in INR) and budgets. 
      Provide a brief summary of their spending habits (max 2 sentences) and 3 specific, actionable tips to save money or stay on budget.
      
      Expenses:
      ${expenseSummary}

      Budgets:
      ${budgetSummary}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Could not analyze data at this time.",
      tips: ["Check your internet connection.", "Ensure API key is valid."]
    };
  }
};