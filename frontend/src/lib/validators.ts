import { z } from 'zod';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from './constants';

// Extract codes for enums
const expenseCategoryCodes = EXPENSE_CATEGORIES.map(c => c.code) as [string, ...string[]];
const incomeSourceCodes = INCOME_SOURCES.map(c => c.code) as [string, ...string[]];
const paymentMethodCodes = PAYMENT_METHODS.map(c => c.code) as [string, ...string[]];

/**
 * Zod schema for the Expense Add/Edit form
 */
export const expenseFormSchema = z.object({
  category: z.enum(expenseCategoryCodes),
  subcategory: z.string().min(1, "Please select a subcategory"),
  description: z.string().min(1, "Description is required").max(200, "Description is too long"),
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be a valid number greater than 0"),
  payment_method: z.enum(paymentMethodCodes),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500, "Notes are too long").optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

/**
 * Zod schema for the Income Add/Edit form
 */
export const incomeFormSchema = z.object({
  income_source: z.enum(incomeSourceCodes),
  description: z.string().min(1, "Description is required").max(200, "Description is too long"),
  actual_amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be a valid number greater than 0"),
  expected_amount: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Expected amount must be a valid positive number"),
  payment_method: z.enum(paymentMethodCodes),
  date: z.string().min(1, "Date is required"),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
