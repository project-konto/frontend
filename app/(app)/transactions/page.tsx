"use client";

import { useEffect, useMemo, useState } from "react";
import { budgetApi, BudgetDetailsDto } from "@/lib/api/budget";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Group = { title: string; items: BudgetDetailsDto["transactions"] };

function dayTitle(iso: string) {
    const day = new Date(iso);
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startD = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const diffDays = Math.round((startToday - startD) / 86400000);

    if (diffDays === 0)
        return "Today";

    if (diffDays === 1)
        return "Yesterday";

    return day.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export default function TransactionsPage() {
    const [budgetId, setBudgetId] = useState<string | null>(null);
    const [details, setDetails] = useState<BudgetDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("konto_active_budget");
        setBudgetId(id);
    }, []);

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErr(null);

            try {
                if (!budgetId) {
                    setDetails(null);
                    return;
                }

                const budget = await budgetApi.details(budgetId);
                if (alive)
                    setDetails(budget);
            }

            catch (e: unknown) {
                if (alive)
                    setErr(getErrorMessage(e, "Failed to load transactions"));
            }

            finally {
                if (alive)
                    setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [budgetId]);

    const hasNoData = (details?.transactions?.length ?? 0) === 0;
    const groups = useMemo<Group[]>(() => {
        const tx = (details?.transactions ?? [])
            .filter((t) => t.type === "Expense")
            .slice()
            .sort((a, b) => +new Date(b.date) - +new Date(a.date));

        const map = new Map<string, BudgetDetailsDto["transactions"]>();
        for (const t of tx) {
            const k = dayTitle(t.date);
            const arr = map.get(k) ?? [];

            arr.push(t);
            map.set(k, arr);
        }

        return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
    }, [details]);

    return (
        <div style={{ height: "100%", padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
            {loading && <div style={muted}>Loading...</div>}
            {!loading && err && (
                <div style={{ color: "rgba(255,180,180,0.95)" }}>{err}</div>
            )}
            {!loading && !err && hasNoData && (
                <div style={centerEmpty}>
                    <div style={{ fontWeight: 900, opacity: 0.85 }}>No Data to Create Statistics</div>
                </div>
            )}
            {!loading && !err && !hasNoData && (
                <div style={{ display: "grid", gap: 14 }}>
                    {groups.map((g) => (
                        <div key={g.title} style={{ display: "grid", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontWeight: 900, opacity: 0.9 }}>{g.title}</div>
                                <button style={dotsButton} onClick={() => alert("Later: week/month/date range")}>⋯</button>
                            </div>
                            <div style={listCard}>
                                {g.items.map((t) => (
                                    <div key={t.id} style={itemRow}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                            <div style={avatar} />
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {t.categoryName || "Other"}
                                                </div>
                                                <div style={{ fontSize: 12, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {t.description || ""}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontWeight: 900 }}>
                                                −{t.amount} {t.currency}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const muted: React.CSSProperties = { fontSize: 13, opacity: 0.75 };

const dotsButton: React.CSSProperties = {
    width: 34,
    height: 30,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(0,0,0,0.03)",
    cursor: "pointer",
    fontWeight: 900,
};

const listCard: React.CSSProperties = {
    background: "rgba(0,0,0,0.03)",
    borderRadius: 16,
    overflow: "hidden",
};

const itemRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 12px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
};

const avatar: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 17,
    background: "rgba(0,0,0,0.10)",
};

const centerEmpty: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: 16,
};
