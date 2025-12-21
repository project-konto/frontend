"use client";

import React from "react";

export type DateRange = { from: string; to: string };
export default function DateRangePicker(props: {
    value: DateRange;
    onChange: (v: DateRange) => void;
}) {
    const { value, onChange } = props;

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={label}>From</label>
            <input
                type="date"
                value={value.from}
                onChange={(e) => onChange({ ...value, from: e.target.value })}
                style={inp}
            />
            <label style={label}>To</label>
            <input
                type="date"
                value={value.to}
                onChange={(e) => onChange({ ...value, to: e.target.value })}
                style={inp}
            />
        </div>
    );
}

const label: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7
};

const inp: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
};