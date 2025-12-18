import axios from "axios";
import { authStorage } from "@/lib/authStorage";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = authStorage.getToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (result) => result,
    (error) => {
        const status = error?.response?.status;
        const url = (error?.config?.url as string | undefined) ?? "";

        if (status === 401 && typeof window !== "undefined") {
            if (url.includes("/api/auth/"))
                return Promise.reject(error);

            authStorage.clearAll();

            const path = window.location.pathname;
            if (path !== "/login" && path !== "/register")
                window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default apiClient;