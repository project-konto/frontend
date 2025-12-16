import apiClient from "@/lib/apiClient";

export type CreateAccountResponse = { accountId: string };
export type AccountOverviewDto = {
    accountId: string;
    budgets: { budgetId: string; name: string; balance: number }[];
}

export const accountApi = {
    create() {
        return apiClient.post<CreateAccountResponse>("/api/account").then((r) => r.data);
    },

    overview() {
        return apiClient.post<AccountOverviewDto>("/api/account").then((r) => r.data);
    },

    delete(id: string) {
        return apiClient.delete(`/api/account/${id}`).then((r) => r.data);
    }
};
