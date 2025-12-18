import apiClient from "@/lib/apiClient";

export type CreateBudgetResponse = { budgetId: string };
export type BudgetDetailsDto = {
    id: string;
    name: string;
    currentBalance: number;
    currency: string;
    transactions: {
        id: string;
        amount: number;
        currency: string;
        type: "Income" | "Expense";
        categoryName: string;
        date: string;
        description: string;
    }[];
};

export const budgetApi = {
    create(payload: { accountId: string; name: string; initialBalance: number; currency: string }) {
        return apiClient.post<CreateBudgetResponse>("/api/budgets", payload).then((r) => r.data);
    },

    details(id: string) {
        return apiClient.get<BudgetDetailsDto>(`/api/budgets/${id}`).then((r) => r.data);
    },
};