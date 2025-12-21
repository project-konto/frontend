"use client";

import { useEffect, useMemo, useState } from "react";
import { budgetApi, BudgetDetailsDto } from "@/lib/api/budget";
import { getErrorMessage } from "@/lib/getErrorMessage";
import DateRangePicker, { DateRange } from "@/components/dateRangePicker";
import CategoryFilterSheet, { loadSelectedCategories, saveSelectedCategories } from "@/components/categoryFilterSheet";

type Mode = "week" | "month" | "custom";
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

function clampRange(mode: Mode, custom: DateRange) {
    const now = new Date();
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);

    if (mode === "week") {
        const from = new Date(now);
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);

        return { from, to };
    }

    if (mode === "month") {
        const from = new Date(now);
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);

        return { from, to };
    }

    const from = new Date(custom.from + "T00:00:00Z");
    const toC = new Date(custom.to + "T23:59:59Z");

    return { from, to: toC };
}

export default function TransactionsPage() {
    const [budgetId, setBudgetId] = useState<string | null>(null);
    const [details, setDetails] = useState<BudgetDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>("week");
    const [custom, setCustom] = useState<DateRange>(() => {
        const to = new Date().toISOString().slice(0, 10);
        const fromD = new Date();
        fromD.setDate(fromD.getDate() - 6);
        const from = fromD.toISOString().slice(0, 10);

        return { from, to };
    });

    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCats, setSelectedCats] = useState<string[]>([]);

    useEffect(() => {
        const id = localStorage.getItem("konto_active_budget");
        setBudgetId(id);

        const storedCats = loadSelectedCategories();
        if (storedCats)
            setSelectedCats(storedCats);
    }, []);

    useEffect(() => {
        saveSelectedCategories(selectedCats);
    }, [selectedCats]);

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
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [budgetId]);

    const range = useMemo(() => clampRange(mode, custom), [mode, custom]);

    const filtered = useMemo(() => {
        const tx = details?.transactions ?? [];
        const fromMs = range.from.getTime();
        const toMs = range.to.getTime();
        return tx.filter((t) => {
            const ms = new Date(t.date).getTime();

            return ms >= fromMs && ms <= toMs;
        });
    }, [details, range]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        for (const t of filtered) {
            if (t.type !== "Expense")
                continue;

            set.add(t.categoryName || "Other");
        }

        return Array.from(set);
    }, [filtered]);

    const effectiveSelected = useMemo(() => {
        if (selectedCats.length === 0)
            return categories;

        return selectedCats.filter((c) => categories.includes(c));
    }, [selectedCats, categories]);

    const categorySummary = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of filtered) {
            if (t.type !== "Expense")
                continue;
            const name = t.categoryName || "Other";

            if (effectiveSelected.length > 0 && !effectiveSelected.includes(name))
                continue;

            map.set(name, (map.get(name) ?? 0) + Math.abs(t.amount ?? 0));
        }

        return Array.from(map.entries())
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);
    }, [filtered, effectiveSelected]);

    const groups = useMemo<Group[]>(() => {
        const tx = filtered
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
    }, [filtered]);

    const hasNoData = filtered.length === 0;

    return (
        <div style={{ height: "100%", padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 900, fontSize: 20 }}>Transactions</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...rangeBtn, ...(mode === "week" ? rangeBtnActive : {}) }} onClick={() => setMode("week")}>Week</button>
                    <button style={{ ...rangeBtn, ...(mode === "month" ? rangeBtnActive : {}) }} onClick={() => setMode("month")}>Month</button>
                    <button style={{ ...rangeBtn, ...(mode === "custom" ? rangeBtnActive : {}) }} onClick={() => setMode("custom")}>Range</button>
                </div>
            </div>
            {mode === "custom" && (
                <div style={panel}>
                    <DateRangePicker value={custom} onChange={setCustom} />
                </div>
            )}
            {loading && <div style={muted}>Loading...</div>}
            {!loading && err && <div style={{ color: "rgba(255,180,180,0.95)" }}>{err}</div>}
            {!loading && !err && !hasNoData && (
                <div style={panel}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div style={{ fontWeight: 900, opacity: 0.9 }}>Top categories (Expense)</div>
                        <button style={linkBtn} onClick={() => setFilterOpen(true)}>Edit</button>
                    </div>
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        {categorySummary.slice(0, 8).map((c) => (
                            <div key={c.name} style={sumRow}>
                                <div style={{ fontWeight: 800, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {c.name}
                                </div>
                                <div style={{ fontWeight: 900 }}>{c.total.toFixed(2)} {details?.currency}</div>
                            </div>
                        ))}
                        {categorySummary.length === 0 && <div style={{ opacity: 0.7 }}>No expenses in this range</div>}
                    </div>
                </div>
            )}
            {!loading && !err && hasNoData && (
                <div style={centerEmpty}>
                    <div style={{ fontWeight: 900, opacity: 0.85 }}>No Data for selected range</div>
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
                                                {t.type === "Expense" ? "−" : t.type === "Income" ? "+" : "·"}{t.amount} {t.currency}
                                            </div>
                                            <div style={{ fontSize: 12, opacity: 0.65 }}>{t.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <CategoryFilterSheet
                open={filterOpen}
                categories={categories}
                selected={effectiveSelected.length === 0 ? categories : effectiveSelected}
                onChangeSelected={setSelectedCats}
                onClose={() => setFilterOpen(false)}
            />
        </div>
    );
}

const panel: React.CSSProperties = {
    padding: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
};

const sumRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
};

const linkBtn: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 900,
};

const rangeBtn: React.CSSProperties = {
    padding: "7px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 900,
};

const rangeBtnActive: React.CSSProperties = {
    background: "rgba(120, 190, 255, 0.18)",
    border: "1px solid rgba(120, 190, 255, 0.40)",
};

const muted: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.75
};

const centerEmpty: React.CSSProperties = {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    display: "grid",
    placeItems: "center",
};

const listCard: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
};

const itemRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const avatar: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
};

const dotsButton: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 900,
};