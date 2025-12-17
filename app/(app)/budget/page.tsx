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
    const [budgets, setBudgets] = useState<{ budgetId: string; name: string; balance: number }[]>([]);
    const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
    const [details, setDetails] = useState<BudgetDetailsDto | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isImportOpen, setImportOpen] = useState(false);
    const active = useMemo(
        () => budgets.find((b) => b.budgetId === activeBudgetId),
        [budgets, activeBudgetId]
    );
    const hasNoData = (details?.transactions?.length ?? 0) === 0;

    async function loadOverview() {
        setOverviewLoading(true);
        setOverviewErr(null);

        try {
            const overview = await accountApi.overview();
            setAccountId(overview.accountId);
            setBudgets(overview.budgets ?? []);

            if (!activeBudgetId && overview.budgets?.length)
                setActiveBudgetId(overview.budgets[0].budgetId);

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
        if (!activeBudgetId) return;
        void loadDetails(activeBudgetId);
    }, [activeBudgetId]);

    async function createBudget() {
        const response = await budgetApi.create();
        await loadOverview();
        setActiveBudgetId(response.budgetId);
    }

    async function renameBudget() {
        if (!activeBudgetId)
            return;

        const newName = prompt("New budget name:", active?.name ?? "");
        if (!newName)
            return;

        await budgetApi.rename(activeBudgetId, newName);
        await loadOverview();
        await loadDetails(activeBudgetId);
    }

    async function deleteBudget() {
        if (!activeBudgetId)
            return;

        if (!confirm("Delete this budget?"))
            return;

        await budgetApi.delete(activeBudgetId);
        setActiveBudgetId(null);
        setDetails(null);
        await loadOverview();
    }

    async function createAccountIfMissing() {
        const response = await accountApi.create();
        setAccountId(response.accountId);
        await loadOverview();
    }

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900, opacity: 0.92 }}>Budgets</div>
                <button style={btnSmall} onClick={createBudget}>
                    + Create
                </button>
            </div>
            {overviewLoading && <div style={muted}>Loading...</div>}
            {overviewErr && (
                <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ color: "rgba(255,180,180,0.95)" }}>{overviewErr}</div>
                    <button style={btn} onClick={createAccountIfMissing}>
                        Create account
                    </button>
                </div>
            )}
            {!overviewLoading && !overviewErr && (
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, minHeight: 0 }}>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                        {budgets.map((b) => (
                            <button
                                key={b.budgetId}
                                onClick={() => setActiveBudgetId(b.budgetId)}
                                style={{
                                    ...chip,
                                    background:
                                        b.budgetId === activeBudgetId
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
                                <div style={{ fontSize: 12, opacity: 0.7 }}>Account: {accountId ?? "-"}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button style={btnSmall} onClick={renameBudget}>
                                    Rename
                                </button>
                                <button style={{ ...btnSmall, background: "rgba(255,120,120,0.16)" }} onClick={deleteBudget}>
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div style={{ marginTop: 12, fontWeight: 800, opacity: 0.9 }}>Transactions</div>
                        {detailsLoading && <div style={muted}>Loading transactions...</div>}
                        {!detailsLoading && (
                            <>
                                {hasNoData ? (
                                    <div style={{ height: 320, display: "grid", placeItems: "center" }}>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontWeight: 900, opacity: 0.85, fontSize: 18 }}>No data</div>
                                            <div style={{ marginTop: 10 }}>
                                                <button
                                                    style={btn}
                                                    onClick={() => {
                                                        // если бюджета нет, импортировать некуда
                                                        if (!activeBudgetId) return;
                                                        setImportOpen(true);
                                                    }}
                                                    disabled={!activeBudgetId}
                                                >
                                                    Add Transaction
                                                </button>
                                            </div>
                                            {!activeBudgetId && (
                                                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                                                    Create a budget first
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                                        {(details?.transactions ?? []).map((t) => (
                                            <div key={t.transactionId} style={row}>
                                                <div style={{ fontWeight: 800 }}>{t.amount}</div>
                                                <div style={{ fontSize: 12, opacity: 0.75, textAlign: "right" }}>
                                                    {t.description ?? "—"}
                                                    <br />
                                                    {new Date(t.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            <ImportTransactionsSheet
                open={isImportOpen}
                onClose={() => setImportOpen(false)}
                budgetId={activeBudgetId}
                onImported={() => {
                    if (activeBudgetId)
                        void loadDetails(activeBudgetId);
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

const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
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

const btn: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.9)",
    color: "#163a4a",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
};

const btnSmall: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
};

const muted: React.CSSProperties = { fontSize: 13, opacity: 0.75 };