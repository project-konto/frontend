"use client";

import React, { useMemo, useState } from "react";
import DateRangePicker, { DateRange } from "@/components/dateRangePicker";
import type { BudgetDetailsDto } from "@/lib/api/budget";

type Mode = "7d" | "30d" | "custom";

export default function BudgetOverview(props: {
    details: BudgetDetailsDto;
    currency: string;
    onImport: () => void;
    onLogIncome: () => void;
    onLogExpense: () => void;
}) {
    const { details, currency, onImport, onLogIncome, onLogExpense } = props;
    const [mode, setMode] = useState<Mode>("7d");
    const [custom, setCustom] = useState<DateRange>(() => {
        const to = new Date().toISOString().slice(0, 10);
        const fromD = new Date();
        fromD.setDate(fromD.getDate() - 6);
        const from = fromD.toISOString().slice(0, 10);
        return { from, to };
    });

    const range = useMemo(() => {
        const to = new Date();
        to.setHours(23, 59, 59, 999);

        if (mode === "7d") {
            const from = new Date();
            from.setDate(from.getDate() - 6);
            from.setHours(0, 0, 0, 0);

            return { from, to };
        }

        if (mode === "30d") {
            const from = new Date();
            from.setDate(from.getDate() - 29);
            from.setHours(0, 0, 0, 0);

            return { from, to };
        }

        const from = new Date(custom.from + "T00:00:00Z");
        const toC = new Date(custom.to + "T23:59:59Z");

        return { from, to: toC };
    }, [mode, custom]);

    const filtered = useMemo(() => {
        const fromMs = range.from.getTime();
        const toMs = range.to.getTime();

        return details.transactions.filter((t) => {
            const ms = new Date(t.date).getTime();

            return ms >= fromMs && ms <= toMs;
        });
    }, [details, range]);

    const incomeTotal = useMemo(() => {
        return filtered
            .filter((t) => t.type === "Income")
            .reduce((s, t) => s + (t.amount ?? 0), 0);
    }, [filtered]);

    const expenseTotal = useMemo(() => {
        return filtered
            .filter((t) => t.type === "Expense")
            .reduce((s, t) => s + Math.abs(t.amount ?? 0), 0);
    }, [filtered]);

    const bars = useMemo(() => {
        const days: { key: string; label: string; value: number }[] = [];
        const fromD = new Date(range.from);
        fromD.setHours(0, 0, 0, 0);

        const toD = new Date(range.to);
        toD.setHours(0, 0, 0, 0);

        const diffDays = Math.max(1, Math.round((toD.getTime() - fromD.getTime()) / 86400000) + 1);
        const count = Math.min(diffDays, 31);

        for (let i = 0; i < count; i++) {
            const d = new Date(fromD);
            d.setDate(fromD.getDate() + i);

            const key = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
            days.push({ key, label, value: 0 });
        }

        const map = new Map(days.map((d) => [d.key, 0]));
        for (const t of filtered) {
            if (t.type !== "Expense")
                continue;

            const key = t.date.slice(0, 10);
            if (!map.has(key))
                continue;

            map.set(key, (map.get(key) ?? 0) + Math.abs(t.amount ?? 0));
        }

        return days.map((d) => ({ ...d, value: map.get(d.key) ?? 0 }));
    }, [filtered, range]);

    const max = Math.max(1, ...bars.map((b) => b.value));
    return (
            <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Overview</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button style={{ ...rangeBtn, ...(mode === "7d" ? rangeBtnActive : {}) }} onClick={() => setMode("7d")}>7d</button>
                            <button style={{ ...rangeBtn, ...(mode === "30d" ? rangeBtnActive : {}) }} onClick={() => setMode("30d")}>30d</button>
                            <button style={{ ...rangeBtn, ...(mode === "custom" ? rangeBtnActive : {}) }} onClick={() => setMode("custom")}>Custom</button>
                        </div>
                </div>

            {mode === "custom" && (
            <div style={cardSoft}>
                <DateRangePicker value={custom} onChange={setCustom} />
            </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={statCard}>
                <div style={statLabel}>Income</div>
                <div style={statValue}>{incomeTotal.toFixed(2)} {currency}</div>
                <button style={logBtn} onClick={onLogIncome}>+ Log</button>
            </div>

            <div style={statCard}>
                <div style={statLabel}>Expense</div>
                    <div style={statValue}>{expenseTotal.toFixed(2)} {currency}</div>
                    <button style={logBtn} onClick={onLogExpense}>+ Log</button>
                </div>
            </div>

            <div style={chartCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>Expenses</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {mode === "7d" ? "This week" : mode === "30d" ? "This month" : "Custom"}
                </div>
            </div>

        <div style={barWrap}>
            {bars.map((b) => {
                    const h = Math.round((b.value / max) * 100);
                    return (
                        <div key={b.key} style={barCol} title={`${b.label}: ${b.value.toFixed(2)} ${currency}`}>
                            <div style={barTrack}>
                            <div style={{ ...barFill, height: `${h}%` }} />
                        </div>
                        <div style={barLabel}>{b.label}</div>
                        </div>
                );
                })}
            </div>
            <button style={importButton} onClick={onImport}>Import file</button>
        </div>
        </div>
    );
}

const cardSoft: React.CSSProperties = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
};

const statCard: React.CSSProperties = {
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    gap: 8,
};

const statLabel: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7
};

const statValue: React.CSSProperties = {
    fontWeight: 900,
    fontSize: 22,
    lineHeight: "26px"
};

const logBtn: React.CSSProperties = {
    justifySelf: "start",
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(45, 111, 138, 0.25)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
};

const chartCard: React.CSSProperties = {
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 10,
};

const barWrap: React.CSSProperties = {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(12px, 1fr)",
    gap: 8,
    alignItems: "end",
    height: 170,
    marginTop: 6,
    minWidth: "max-content",
};

const barCol: React.CSSProperties = {
    display: "grid",
    gap: 6,
    alignItems: "end",
    minWidth: 0,
};

const barTrack: React.CSSProperties = {
    height: 130,
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
};

const barFill: React.CSSProperties = {
    width: "100%",
    background: "rgba(60, 130, 160, 0.85)",
};

const barLabel: React.CSSProperties = {
    fontSize: 10,
    opacity: 0.65,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const importButton: React.CSSProperties = {
    marginTop: 2,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(255,255,255,0.85)",
    color: "rgba(10,18,28,0.92)",
    cursor: "pointer",
    fontWeight: 900,
};

const rangeBtn: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.70)",
    color: "rgba(10,18,28,0.92)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    lineHeight: "16px",
};

const rangeBtnActive: React.CSSProperties = {
    background: "rgba(120, 190, 255, 0.35)",
    border: "1px solid rgba(45, 111, 138, 0.55)",
    color: "rgba(10,18,28,0.95)",
};