import apiClient from "@/lib/apiClient";

export type UserDto = { id: string; name: string; email: string };

export const usersApi = {
    me() {
        return apiClient.get<UserDto>(`/api/users/me`).then((r) => r.data);
    }
};

