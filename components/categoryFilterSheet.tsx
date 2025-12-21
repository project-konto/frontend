"use client";

import React, { useMemo } from "react";

const STORAGE_KEY = "konto_tx_category_filters";

export default function CategoryFilterSheet(props: {
    open: boolean;
    categories: string[]; // уникальные имена
    selected: string[];   // выбранные категории
    onChangeSelected: (next: string[]) => void;
    onClose: () => void;
}) {
    const { open, categories, selected, onChangeSelected, onClose } = props;
    const sorted = useMemo(
        () => categories.slice().sort((a, b) => a.localeCompare(b)),
        [categories]
    );

    if (!open)
        return null;

    function toggle(name: string) {
        if (selected.includes(name))
            onChangeSelected(selected.filter((x) => x !== name));

        else
            onChangeSelected([...selected, name]);
    }

    function selectAll() {
        onChangeSelected(sorted);
    }

    function clearAll() {
        onChangeSelected([]);
    }

    return (
        <div style={overlay} onMouseDown={onClose}>
            <div style={sheet} onMouseDown={(e) => e.stopPropagation()}>
                <div style={header}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Categories for analysis</div>
                    <button style={iconButton} onClick={onClose}>×</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button style={btn} onClick={selectAll}>Select all</button>
                    <button style={btn} onClick={clearAll}>Clear</button>
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 8, maxHeight: "60vh", overflow: "auto" }}>
                    {sorted.map((c) => (
                        <label key={c} style={row}>
                            <input
                                type="checkbox"
                                checked={selected.includes(c)}
                                onChange={() => toggle(c)}
                            />
                            <span style={{ fontWeight: 700 }}>{c}</span>
                        </label>
                    ))}
                    {sorted.length === 0 && <div style={{ opacity: 0.7 }}>No categories</div>}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
                    Saved locally as: <code>{STORAGE_KEY}</code>
                </div>
            </div>
        </div>
    );
}

export function loadSelectedCategories(): string[] | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : null;
    } catch {
        return null;
    }
}

export function saveSelectedCategories(arr: string[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 14,
    zIndex: 50,
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

const btn: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 800,
};

const row: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
};