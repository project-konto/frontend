"use client";

import { useEffect, useMemo, useState } from "react";
import { accountApi } from "@/lib/api/account";
import { budgetApi, BudgetDetailsDto } from "@/lib/api/budget";
import { getErrorMessage } from "@/lib/getErrorMessage";
import ImportTransactionsSheet from "@/components/importTransactionsSheet";

export default function BudgetPage() {
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewErr, setOverviewErr] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [budgets, setBudgets] = useState<{ id: string; name: string; balance: number; currency: string }[]>([]);
    const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
    const [details, setDetails] = useState<BudgetDetailsDto | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isImportOpen, setImportOpen] = useState(false);
    const active = useMemo(
        () => budgets.find((b) => b.id === activeBudgetId),
        [budgets, activeBudgetId]
    );
    const hasNoData = (details?.transactions?.length ?? 0) === 0;
    const effectiveBudgetId = activeBudgetId ?? budgets[0]?.id ?? null;

    const [range, setRange] = useState<7 | 30>(7);

    const currency = details?.currency ?? active?.currency ?? "RUB";

    const expenseTotal = useMemo(() => {
        if (!details) return 0;
        return details.transactions
            .filter(t => t.type === "Expense")
            .reduce((s, t) => s + (t.amount ?? 0), 0);
    }, [details]);

    const incomeTotal = useMemo(() => {
        if (!details) return 0;
        return details.transactions
            .filter(t => t.type === "Income")
            .reduce((s, t) => s + (t.amount ?? 0), 0);
    }, [details]);

    type DayBar = { key: string; label: string; value: number };

    const expenseBars = useMemo<DayBar[]>(() => {
        if (!details) return [];

        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - (range - 1));

        // подготовим дни
        const days: DayBar[] = [];
        const map = new Map<string, number>();

        for (let i = 0; i < range; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
            const label = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
            days.push({ key, label, value: 0 });
            map.set(key, 0);
        }

        // суммируем расходы по дням
        for (const t of details.transactions) {
            if (t.type !== "Expense") continue;
            const key = t.date.slice(0, 10);
            if (!map.has(key)) continue;
            map.set(key, (map.get(key) ?? 0) + Math.abs(t.amount ?? 0));
        }

        return days.map(d => ({ ...d, value: map.get(d.key) ?? 0 }));
    }, [details, range]);

    async function loadOverview() {
        setOverviewLoading(true);
        setOverviewErr(null);

        try {
            const overview = await accountApi.overview();
            setAccountId(overview.id);
            setBudgets(overview.budgets ?? []);

            if (!activeBudgetId && overview.budgets?.length)
                setActiveBudgetId(overview.budgets[0].id);

        }

        catch (e: unknown) {
            setOverviewErr(getErrorMessage(e, "Failed to load account overview"));
        }

        finally {
            setOverviewLoading(false);
        }
    }

    async function loadDetails(id: string) {
        setDetailsLoading(true);
        try {
            const details = await budgetApi.details(id);
            setDetails(details);
        }

        catch (e: unknown) {
            console.error(getErrorMessage(e, "Failed to load budget details"));
            setDetails(null);
        }

        finally {
            setDetailsLoading(false);
        }
    }

    useEffect(() => {
        void loadOverview();
    }, []);

    useEffect(() => {
        if (activeBudgetId && typeof window !== "undefined") {
            localStorage.setItem("konto_active_budget", activeBudgetId);
            void loadDetails(activeBudgetId);
        }
    }, [activeBudgetId]);


    return (
        <div
            style={{
                height: "100%",
                padding: 16,
                display: "grid",
                gridTemplateRows: "auto 1fr",
                gap: 12,
                position: "relative",
            }}
        >
            {overviewLoading && <div style={muted}>Loading...</div>}
            {overviewErr && (
                <div style={{ color: "rgba(255,180,180,0.95)" }}>{overviewErr}</div>
            )}
            {!overviewLoading && !overviewErr && (
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, minHeight: 0 }}>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                        {budgets.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => setActiveBudgetId(b.id)}
                                style={{
                                    ...chip,
                                    background:
                                        b.id === activeBudgetId
                                            ? "rgba(255,255,255,0.18)"
                                            : "rgba(255,255,255,0.08)",
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: 13 }}>{b.name}</div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>{b.balance}</div>
                            </button>
                        ))}
                    </div>
                    <div style={card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 900 }}>{details?.name ?? active?.name ?? "Budget"}</div>
                            </div>
                        </div>
                        {detailsLoading && <div style={muted}>Loading transactions...</div>}
                        {!detailsLoading && !hasNoData && details && (
                            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                    <div style={{ fontWeight: 900, opacity: 0.9 }}>Overview</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            style={{ ...rangeButton, ...(range === 7 ? rangeButtonActive : {}) }}
                                            onClick={() => setRange(7)}
                                        >
                                            7d
                                        </button>
                                        <button
                                            style={{ ...rangeButton, ...(range === 30 ? rangeButtonActive : {}) }}
                                            onClick={() => setRange(30)}
                                        >
                                            30d
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div style={statCard}>
                                        <div style={statLabel}>Revenue</div>
                                        <div style={statValue}>{incomeTotal.toFixed(2)} {currency}</div>
                                    </div>
                                    <div style={statCard}>
                                        <div style={statLabel}>Expense</div>
                                        <div style={statValue}>{expenseTotal.toFixed(2)} {currency}</div>
                                    </div>
                                </div>

                                <div style={chartCard}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <div style={{ fontWeight: 900, opacity: 0.9 }}>Expenses</div>
                                        <div style={{ fontSize: 12, opacity: 0.7 }}>{range} days</div>
                                    </div>

                                    <div style={chartWrap}>
                                        {expenseBars.map((b) => {
                                            const max = Math.max(1, ...expenseBars.map(x => x.value));
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
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ImportTransactionsSheet
                open={isImportOpen}
                budgetId={effectiveBudgetId}
                onClose={() => setImportOpen(false)}
                onImported={() => {
                    setImportOpen(false);
                    if (effectiveBudgetId) void loadDetails(effectiveBudgetId);
                }}
            />
        </div>
    );
};

const card: React.CSSProperties = {
    minHeight: 0,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
};

const chip: React.CSSProperties = {
    flex: "0 0 auto",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
};

const muted: React.CSSProperties = { fontSize: 13, opacity: 0.75 };

const statCard: React.CSSProperties = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
};

const statLabel: React.CSSProperties = { fontSize: 12, opacity: 0.7 };
const statValue: React.CSSProperties = { fontWeight: 900, fontSize: 18, marginTop: 6 };

const chartCard: React.CSSProperties = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    gap: 10,
};

const chartWrap: React.CSSProperties = {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
    gap: 8,
    alignItems: "end",
    height: 180,
    marginTop: 6,
};

const barCol: React.CSSProperties = {
    display: "grid",
    gap: 6,
    alignItems: "end",
    minWidth: 0,
};

const barTrack: React.CSSProperties = {
    height: 140,
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
};

const barFill: React.CSSProperties = {
    width: "100%",
    background: "rgba(120, 190, 255, 0.55)",
};

const barLabel: React.CSSProperties = {
    fontSize: 10,
    opacity: 0.7,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const rangeButton: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
};

const rangeButtonActive: React.CSSProperties = {
    background: "rgba(120, 190, 255, 0.20)",
    border: "1px solid rgba(120, 190, 255, 0.45)",
};