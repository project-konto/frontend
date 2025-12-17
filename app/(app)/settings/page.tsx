"use client";

import { useEffect, useState } from "react";
import { authStorage } from "@/lib/authStorage";
import { usersApi, UserDto } from "@/lib/api/users";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function SettingsPage() {
    const stored = authStorage.getUser();
    const userId = stored?.userId;
    const [user, setUser] = useState<UserDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        if (!userId)
            return;

        (async () => {
            try {
                const u = await usersApi.get(userId);
                if (alive)
                    setUser(u);
            }

            catch (e: unknown) {
                if (alive)
                    setError(getErrorMessage(e, "Failed to load profile"));
            }
        })();

        return () => {
            alive = false;
        };
    }, [userId]);

    function logout() {
        authStorage.clearAll();
        window.location.href = "/login";
    }

    return (
        <div style={{ height: "100%", padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 900, opacity: 0.92 }}>Settings</div>
                <button style={smallButton} onClick={logout}>Logout</button>
            </div>

            <div style={card}>
                <div style={{ fontWeight: 900, opacity: 0.9 }}>Profile</div>
                {error && <div style={{ fontSize: 13, color: "rgba(255,180,180,0.95)" }}>{error}</div>}
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                    <div>Name: {user?.name ?? stored?.name ?? "-"}</div>
                    <div>Email: {user?.email ?? stored?.email ?? "-"}</div>
                    <div>UserId: {userId ?? "-"}</div>
                </div>
            </div>
        </div>
    );
}

const card: React.CSSProperties = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    gap: 8,
};

const smallButton: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
};