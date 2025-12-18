"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import {getErrorMessage} from "@/lib/getErrorMessage";
import { authStorage } from "@/lib/authStorage";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password should be more than 8 symbols");
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            await authApi.register({ name, email, password });

            const loginResponse = await authApi.login({ email, password });
            authStorage.setToken(loginResponse.token);
            authStorage.setUser({ userId: loginResponse.userId, name: loginResponse.name, email: loginResponse.email });
            router.replace("/budget");
        }

        catch (e: unknown) {
            setError(getErrorMessage(e, "Registration failed"));
        }

        finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ height: "100%", padding: 20, display: "grid", alignContent: "center" }}>
            <h2 style={{ fontSize: 24, margin: 0, color: "rgba(255,255,255,0.92)" }}>Sign up</h2>
            <p style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>Create your Konto account.</p>
            <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inp} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inp} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={inp} />
                {error && <div style={{ fontSize: 12, color: "rgba(255,180,180,0.95)" }}>{error}</div>}
                <button disabled={loading} style={button}>
                    {loading ? "..." : "Create account"}
                </button>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                    Have an account? <Link href="/login" style={{ color: "rgba(255,255,255,0.95)" }}>Log in</Link>
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