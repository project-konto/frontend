import apiClient from "@/lib/apiClient";

export type CreateBudgetResponse = { budgetId: string };
export type BudgetDetailsDto = {
    budgetId: string;
    name: string;
    balance: number;
    transactions: {
        transactionId: string;
        amount: number;
        createdAt: string;
        description?: string | null;
        categoryId?: string | null;
    }[];
};

export const budgetApi = {
    create() {
        return apiClient.post<CreateBudgetResponse>('api/budget/create').then((r) => r.data);
    },

    details(id: string) {
        return apiClient.get<BudgetDetailsDto>(`/api/budget/${id}`).then((r) => r.data);
    },

    rename(id: string, newName: string) {
        return apiClient.put(`api/budget/${id}/rename`, newName, {
            headers: { 'Content-Type': 'application/json' },
        }).then((r) => r.data);
    },

    delete(id: string) {
        return apiClient.delete(`api/budget/${id}`).then((r) => r.data);
    }
};