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
        if (budgets.length > 0 && !activeBudgetId) {
            setActiveBudgetId(budgets[0].id);
        }
    }, [budgets, activeBudgetId]);


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
                        {!detailsLoading && hasNoData && (
                            <div style={emptyWrap}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontWeight: 900, fontSize: 16, opacity: 0.85 }}>
                                        No Data to Create Statistics
                                    </div>

                                    <button style={importButton} onClick={() => setImportOpen(true)}>
                                        Import Data
                                    </button>
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

const emptyWrap: React.CSSProperties = {
    position: "absolute",
    inset: 0,
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

const importButton: React.CSSProperties = {
    marginTop: 14,
    width: 240,
    padding: "14px 14px",
    borderRadius: 14,
    background: "#163a4a",
    color: "white",
    fontWeight: 900,
    border: "none",
    cursor: "pointer"
};

const muted: React.CSSProperties = { fontSize: 13, opacity: 0.75 };