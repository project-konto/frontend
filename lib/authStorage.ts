const TOKEN_KEY = "konto_token";
const USER_KEY = "konto_user";

export type StoredUser = { userId: string; name: string; email: string };

export const authStorage = {
    getToken(): string | null {
        if (typeof window === "undefined")
            return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    clearToken() {
        localStorage.removeItem(TOKEN_KEY);
    },

    getUser(): StoredUser | null {
        if (typeof window === "undefined")
            return null;

        const raw = localStorage.getItem(USER_KEY);
        return raw ? (JSON.parse(raw) as StoredUser) : null;
    },

    setUser(user: StoredUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clearUser() {
        localStorage.removeItem(USER_KEY);
    },

    clearAll() {
        this.clearToken();
        this.clearUser();
    }
}