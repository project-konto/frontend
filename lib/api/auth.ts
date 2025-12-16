import apiClient from "@/lib/apiClient";

export type RegisterRequest = { name: string; email: string; password: string };
export type RegisterResponse = { userId: string; };
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; userId: string; name: string; email: string; };

export const authApi = {
    register(payload: RegisterRequest) {
        return apiClient.post<RegisterResponse>('api/auth/register', payload).then(r => r.data);
    },

    login(payload: LoginRequest) {
        return apiClient.post<LoginResponse>('api/auth/login', payload).then(r => r.data);
    }
};