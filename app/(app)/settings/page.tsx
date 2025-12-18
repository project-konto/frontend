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
                const u = await usersApi.me();
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
        <div
            style={{
                height: "100%",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div style={card}>
                <div style={{ fontWeight: 900, opacity: 0.9 }}>Profile</div>

                {error && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Couldn’t load profile. Showing saved data.
                    </div>
                )}
                <div style={{ fontSize: 16, lineHeight: "22px", opacity: 0.85 }}>
                    <div>Name: {user?.name ?? stored?.name ?? "-"}</div>
                    <div>Email: {user?.email ?? stored?.email ?? "-"}</div>
                </div>
            </div>
            <div style={logoutWrap}>
                <button style={logoutButton} onClick={logout}>Logout</button>
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

const logoutWrap: React.CSSProperties = {
    position: "sticky",
    bottom: 92,
    paddingTop: 12,
};

const logoutButton: React.CSSProperties = {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 14,
    background: "#163a4a",
    color: "white",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
};