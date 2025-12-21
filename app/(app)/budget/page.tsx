"use client";

import { useEffect, useMemo, useState } from "react";
import { accountApi } from "@/lib/api/account";
import { budgetApi, BudgetDetailsDto } from "@/lib/api/budget";
import { getErrorMessage } from "@/lib/getErrorMessage";
import ImportTransactionsSheet from "@/components/importTransactionsSheet";
import BudgetOverview from "@/components/budgetOverview";
import LogTransactionSheet from "@/components/logTransactionSheet";

export default function BudgetPage() {
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewErr, setOverviewErr] = useState<string | null>(null);
    const [budgets, setBudgets] = useState<{ id: string; name: string; balance: number; currency: string }[]>([]);
    const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
    const [details, setDetails] = useState<BudgetDetailsDto | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isImportOpen, setImportOpen] = useState(false);
    const [logType, setLogType] = useState<"Income" | "Expense" | null>(null);
    const active = useMemo(
        () => budgets.find((b) => b.id === activeBudgetId),
        [budgets, activeBudgetId]
    );
    const hasNoData = (details?.transactions?.length ?? 0) === 0;
    const effectiveBudgetId = activeBudgetId ?? budgets[0]?.id ?? null;
    const currency = details?.currency ?? active?.currency ?? "RUB";

    async function loadOverview() {
        setOverviewLoading(true);
        setOverviewErr(null);

        try {
            const overview = await accountApi.overview();
            const list = overview.budgets ?? [];
            setBudgets(list);

            const stored = typeof window !== "undefined"
                ? localStorage.getItem("konto_active_budget")
                : null;

            const storedExists = stored && list.some(b => b.id === stored);
            const initial = storedExists ? stored : (list[0]?.id ?? null);

            if (typeof window !== "undefined") {
                if (initial)
                    localStorage.setItem("konto_active_budget", initial);

                else localStorage.removeItem("konto_active_budget");
            }

            setActiveBudgetId(initial);
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
            const d = await budgetApi.details(id);
            setDetails(d);
        }

        catch (e: any) {
            const status = e?.response?.status;

            if (status === 404 && typeof window !== "undefined") {
                localStorage.removeItem("konto_active_budget");
                setActiveBudgetId(null);
                setDetails(null);
                void loadOverview();
                return;
            }

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
        <div style={page}>
            {overviewLoading && <div style={muted}>Loading...</div>}
            {overviewErr && <div style={{ color: "rgba(255,180,180,0.95)" }}>{overviewErr}</div>}
            {!overviewLoading && !overviewErr && (
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, minHeight: 0 }}>
                    <div style={card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 18 }}>{details?.name ?? active?.name ?? "Budget"}</div>
                            </div>
                        </div>
                        {detailsLoading && <div style={muted}>Loading...</div>}
                        {!detailsLoading && hasNoData && (
                            <div style={emptyWrap}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontWeight: 900, fontSize: 16, opacity: 0.85 }}>
                                        No Data to Create Statistics
                                    </div>
                                    <div style={{ display: "grid", gap: 10, marginTop: 14, justifyItems: "center" }}>
                                        <button style={primaryBtn} onClick={() => setImportOpen(true)}>
                                            Import file
                                        </button>
                                        <button style={secondaryBtn} onClick={() => setLogType("Expense")}>
                                            + Log expense
                                        </button>
                                        <button style={secondaryBtn} onClick={() => setLogType("Income")}>
                                            + Log income
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!detailsLoading && !hasNoData && details && (
                            <div style={{ marginTop: 12 }}>
                                <BudgetOverview
                                    details={details}
                                    currency={currency}
                                    onImport={() => setImportOpen(true)}
                                    onLogIncome={() => setLogType("Income")}
                                    onLogExpense={() => setLogType("Expense")}
                                />
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
            <LogTransactionSheet
                open={logType !== null}
                budgetId={effectiveBudgetId}
                type={logType ?? "Expense"}
                onClose={() => setLogType(null)}
                onLogged={() => {
                    if (effectiveBudgetId) void loadDetails(effectiveBudgetId);
                }}
            />
        </div>
    );
}

const page: React.CSSProperties = {
    height: "100%",
    padding: 16,
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gap: 12,
    position: "relative",
};

const card: React.CSSProperties = {
    minHeight: 0,
    padding: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
};

const emptyWrap: React.CSSProperties = {
    position: "relative",
    display: "grid",
    placeItems: "center",
    padding: 16,
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

const primaryBtn: React.CSSProperties = {
    width: 240,
    padding: "14px 14px",
    borderRadius: 14,
    background: "#2d6f8a",
    color: "white",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
    width: 240,
    padding: "14px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
};

const muted: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.75
};