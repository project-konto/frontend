import apiClient from "@/lib/apiClient";

export type CreateAccountResponse = { accountId: string };
export type AccountOverviewDto = {
    id: string;
    name: string;
    createdAt: string;
    budgets: { id: string; name: string; balance: number; currency: string }[];
};

export const accountApi = {
    create(name: string) {
        return apiClient.post<CreateAccountResponse>("/api/account", { name }).then((r) => r.data);
    },

    overview() {
        return apiClient.get<AccountOverviewDto>("/api/account").then((r) => r.data);
    },

    delete() {
        return apiClient.delete(`/api/account`).then((r) => r.data);
    }
};
