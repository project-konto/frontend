export interface UserDto {
    id: string
    name: string
    email: string
}

export type TransactionType = "Income" | "Expense" | "Transfer";

export interface TransactionDto {
    id: string
    type: TransactionType
    amount: number
    currency: string
    category: string
    date: string
    description: string
}

export interface BudgetDto {
    id: string
    currentBalance: number
    currency: string
    transactionsCount: number
}