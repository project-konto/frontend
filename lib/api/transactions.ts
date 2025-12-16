import apiClient from "@/lib/apiClient";
import ApiClient from "@/lib/apiClient";

export type AddTransactionCommand = {
    budgetId: string;
    amount: number;
    description?: string | null;
    categoryId?: string | null;
    createdAt?: string | null;
};
export type AddTransactionResponse = { transactionId: string };
export type TransactionDetailsDto = {
    transactionId: string;
    budgetId: string;
    amount: number;
    createdAt: string;
    description?: string | null;
    categoryId?: string | null;
};
export type ImportResultsDto = {
    imported: number;
    skipped: number;
    errors: string[];
};

export const transactionsApi = {
    add(payload: AddTransactionCommand) {
        return apiClient.post<AddTransactionResponse>("/api/transactions", payload).then((r) => r.data);
    },

    get(id: string) {
        return apiClient.get<TransactionDetailsDto>(`/api/transactions/${id}`).then((r) => r.data);
    },

    delete(transactionId: string, budgetId: string) {
        return ApiClient.delete(`/api/transactions/${transactionId}`, { params: { budgetId } }).then((r) => r.data);
    },

    importCsv(budgetId: string, file: File) {
        const form = new FormData();
        form.append("budgetId", budgetId);
        form.append("file", file);

        return apiClient.post<ImportResultsDto>("/api/transactions/import", form).then((r) => r.data);
    }
};