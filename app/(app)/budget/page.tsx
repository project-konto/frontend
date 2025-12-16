"use client";

import { useEffect, useMemo, useState } from "react";
import { accountApi } from "@/lib/api/account";
import { budgetApi, BudgetDetailsDto } from "@/lib/api/budget";
import {getErrorMessage} from "@/lib/getErrorMessage";

export default function BudgetPage() {
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewErr, setOverviewErr] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [budgets, setBudgets] = useState<{ budgetId: string; name: string; balance: number }[]>([]);
    const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
    const [details, setDetails] = useState<BudgetDetailsDto | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const active = useMemo(() => budgets.find(b => b.budgetId === activeBudgetId), [budgets, activeBudgetId]);

    async function loadOverview() {
        setOverviewLoading(true);
        setOverviewErr(null);

        try {
            const ov = await accountApi.overview();
            setAccountId(ov.accountId);
            setBudgets(ov.budgets ?? []);
            if (!activeBudgetId && ov.budgets?.length) setActiveBudgetId(ov.budgets[0].budgetId);
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

        finally {
            setDetailsLoading(false);
        }
    }

    useEffect(() => { loadOverview(); }, []);
    useEffect(() => {
        if (activeBudgetId)
            loadDetails(activeBudgetId);
    }, [activeBudgetId]);

    async function createBudget() {
        const res = await budgetApi.create();
        await loadOverview();
        setActiveBudgetId(res.budgetId);
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
        const res = await accountApi.create();
        setAccountId(res.accountId);
        await loadOverview();
    }

    return (
        <div style={{ height: "100%", padding: 16, display: "grid", gridTemplateRows: "auto 1fr", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900, opacity: 0.92 }}>Budgets</div>
                <button style={smallButton} onClick={createBudget}>+ Create</button>
            </div>
            {overviewLoading && <div style={muted}>Loading...</div>}
            {overviewErr && (
                <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ color: "rgba(255,180,180,0.95)" }}>{overviewErr}</div>
                    <button style={button} onClick={createAccountIfMissing}>
                        Create account (if you don’t have one yet)
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
                                    background: b.budgetId === activeBudgetId ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
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
                                <button style={smallButton} onClick={renameBudget}>Rename</button>
                                <button style={{ ...smallButton, background: "rgba(255,120,120,0.16)" }} onClick={deleteBudget}>
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div style={{ marginTop: 12, fontWeight: 800, opacity: 0.9 }}>Transactions</div>
                        {detailsLoading && <div style={muted}>Loading transactions...</div>}
                        {!detailsLoading && (
                            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                                {(details?.transactions ?? []).map((t) => (
                                    <div key={t.transactionId} style={row}>
                                        <div style={{ fontWeight: 800 }}>{t.amount}</div>
                                        <div style={{ fontSize: 12, opacity: 0.75, textAlign: "right" }}>
                                            {t.description ?? "—"} <br />
                                            {new Date(t.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {!details?.transactions?.length && <div style={muted}>No transactions yet.</div>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

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

const button: React.CSSProperties = {
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.9)",
    color: "#163a4a",
    fontWeight: 900,
    border: "none",
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

const muted: React.CSSProperties = { fontSize: 13, opacity: 0.75 };
