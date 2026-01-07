"use client";

import React, { useEffect, useState } from "react";
import { categoriesApi, CategoryDto } from "@/lib/api/categories";
import { transactionsApi } from "@/lib/api/transactions";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Props = {
    open: boolean;
    budgetId: string | null;
    type: "Income" | "Expense";
    onClose: () => void;
    onLogged?: () => void;
};

export default function LogTransactionSheet({ open, budgetId, type, onClose, onLogged }: Props) {
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [description, setDescription] = useState("");
    const [cats, setCats] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!open)
            return;

        (async () => {
            try {
                setErr(null);
                const list = await categoriesApi.list();
                setCats(list);
                if (!categoryId && list[0]?.id) setCategoryId(list[0].id);
            } catch (e: unknown) {
                setErr(getErrorMessage(e, "Failed to load categories"));
            }
        })();
    }, [open]);

    const title = type === "Income" ? "Income" : "Expense";

    async function submit() {
        if (!budgetId) {
            setErr("No budget selected");
            return;
        }

        const v = Number(amount);
        if (!Number.isFinite(v) || v <= 0) {
            setErr("Amount must be > 0");
            return;
        }

        if (!categoryId) {
            setErr("Choose category");
            return;
        }

        setLoading(true);
        setErr(null);

        try {
            await transactionsApi.add({
                budgetId,
                amount: v,
                categoryId,
                description: description || null,
                createdAt: new Date(date).toISOString(),
            } as any);

            onLogged?.();
            onClose();
            setAmount("");
            setDescription("");
        }

        catch (e: unknown) {
            setErr(getErrorMessage(e, "Log failed"));
        }

        finally {
            setLoading(false);
        }
    }

    if (!open)
        return null;

    return (
        <div style={overlay} onMouseDown={onClose}>
            <div style={sheet} onMouseDown={(e) => e.stopPropagation()}>
                <div style={header}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>+ Log {title}</div>
                    <button style={iconButton} onClick={onClose}>×</button>
                </div>
                {err && <div style={{ color: "rgba(255,180,180,0.95)", fontSize: 13 }}>{err}</div>}
                <div style={{ display: "grid", gap: 10 }}>
                    <label style={label}>Amount</label>
                    <input style={inp} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                    <label style={label}>Category</label>
                    <select style={selectInp as any} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        {cats.map((c) => (
                            <option key={c.id} value={c.id} style={selectOption as any}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <label style={label}>Date</label>
                    <input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <label style={label}>Description</label>
                    <input style={inp} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
                </div>
                <button style={primaryBtn} disabled={loading} onClick={submit}>
                    {loading ? "..." : "Save"}
                </button>
            </div>
        </div>
    );
}

const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 60,
    overflowY: "auto"
};

const sheet: React.CSSProperties = {
    width: "min(520px, 100%)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(20,24,30,0.92)",
    backdropFilter: "blur(10px)",
    padding: 12,
    display: "grid",
    gap: 10,
    maxHeight: "calc(100dvh - 28px)",
    overflowY: "auto",
    color: "rgba(255,255,255,0.92)"
};

const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const iconButton: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 18,
    lineHeight: "32px",
};

const label: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7
};

const inp: React.CSSProperties = {
    padding: "10px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
};

const primaryBtn: React.CSSProperties = {
    marginTop: 6,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    background: "#2d6f8a",
    color: "white",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
};

const selectInp: React.CSSProperties = {
    ...inp,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.20)",
    color: "rgba(10,18,28,0.92)",
};

const selectOption: React.CSSProperties = {
    color: "rgba(10,18,28,0.95)",
    background: "#ffffff",
};