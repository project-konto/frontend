"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { authStorage } from "@/lib/authStorage";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        const emailParts = email.split("@");
        if (emailParts.length !== 2 || emailParts[0].length === 0 || !emailParts[1].includes(".")) {
            setErr("Invalid email or password");
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.login({ email, password });
            authStorage.setToken(res.token);
            authStorage.setUser({ userId: res.userId, name: res.name, email: res.email });
            router.replace("/budget");
        }

        catch (e: unknown) {
            setErr(getErrorMessage(e, "Login failed"));
        }

        finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ height: "100%", padding: 20, display: "grid", alignContent: "center" }}>
            <h2 style={{ fontSize: 24, margin: 0, color: "rgba(255,255,255,0.92)" }}>Log in</h2>
            <p
                style={{
                    marginTop: 6,
                    opacity: 0.7,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                }}
            >
                Use your email and password.
            </p>
            <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inp} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={inp} />
                {err && <div style={{ fontSize: 12, color: "rgba(255,180,180,0.95)" }}>{err}</div>}
                <button disabled={loading} style={button}>
                    {loading ? "..." : "Log in"}
                </button>
                <div
                    style={{
                        marginTop: 6,
                        fontSize: 13,
                        opacity: 0.8,
                        color: "rgba(255,255,255,0.85)",
                    }}
                >
                    No account? <Link href="/register" style={{ color: "rgba(255,255,255,0.95)" }}>Sign up</Link>
                </div>
            </form>
        </div>
    );
}

const inp: React.CSSProperties = {
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
};

const button: React.CSSProperties = {
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.9)",
    color: "#163a4a",
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
};