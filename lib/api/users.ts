import apiClient from "@/lib/apiClient";

export type UserDto = { id: string; name: string; email: string };

export const usersApi = {
    get(id: string) {
        return apiClient.get<UserDto>(`/api/users/${id}`).then((r) => r.data);
    }
};

