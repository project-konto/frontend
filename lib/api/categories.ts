import apiClient from "@/lib/apiClient";

export type CategoryDto = { id: string; name: string };

export const categoriesApi = {
    list() {
        return apiClient.get<CategoryDto[]>("/api/categories").then((r) => r.data);
    },

    get(id: string) {
        return apiClient.get<CategoryDto>(`/api/categories/${id}`).then((r) => r.data);
    },

    create(payload: { name: string }) {
        return apiClient.post(`/api/categories`, payload).then((r) => r.data);
    },

    update(id: string, payload: { name: string }) {
        return apiClient.put(`/api/categories/${id}`, payload).then((r) => r.data);
    },

    delete(id: string) {
        return apiClient.delete(`/api/categories/${id}`).then((r) => r.data);
    }
};