"use client";

import { useState } from "react";
import { transactionsApi } from "@/lib/api/transactions";
import {getErrorMessage} from "@/lib/getErrorMessage";

export default function TransactionsPage() {
    const [budgetId, setBudgetId] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function add() {
        setError(null); setMessage(null);

        try {
            const res = await transactionsApi.add({ budgetId, amount, description });
            setMessage(`Created transaction: ${res.transactionId}`);
        }

        catch (e: unknown) {
            setError(getErrorMessage(e, "Add failed"));
        }
    }

    async function del() {
        setError(null); setMessage(null);

        try {
            await transactionsApi.delete(transactionId, budgetId);
            setMessage("Deleted");
        }

        catch (e: unknown) {
            setError(getErrorMessage(e, "Delete failed"));
        }
    }

    async function importCsv() {
        setError(null);
        setMessage(null);

        if (!file)
            return setError("Choose a file first");

        try {
            const result = await transactionsApi.importCsv(budgetId, file);
            setMessage(`Imported: ${result.imported}, skipped: ${result.skipped}`);
        }

        catch (e: unknown) {
            setError(getErrorMessage(e, "Import failed"));
        }
    }

    return (
        <div style={{ height: "100%", padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
            <div style={{ fontWeight: 900, opacity: 0.92 }}>Transactions</div>
            <div style={card}>
                <div style={title}>Add transaction</div>
                <input style={inp} placeholder="BudgetId (GUID)" value={budgetId} onChange={(e) => setBudgetId(e.target.value)} />
                <input style={inp} placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                <input style={inp} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button style={button} onClick={add}>Create</button>
            </div>
            <div style={card}>
                <div style={title}>Delete transaction</div>
                <input style={inp} placeholder="BudgetId (GUID)" value={budgetId} onChange={(e) => setBudgetId(e.target.value)} />
                <input style={inp} placeholder="TransactionId (GUID)" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
                <button style={buttonDanger} onClick={del}>Delete</button>
            </div>
            <div style={card}>
                <div style={title}>Import CSV</div>
                <input style={inp} placeholder="BudgetId (GUID)" value={budgetId} onChange={(e) => setBudgetId(e.target.value)} />
                <input style={inp} type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <button style={button} onClick={importCsv}>Import</button>
            </div>
            {message && <div style={{ fontSize: 13, opacity: 0.85 }}>{message}</div>}
            {error && <div style={{ fontSize: 13, color: "rgba(255,180,180,0.95)" }}>{error}</div>}
        </div>
    );
}

const card: React.CSSProperties = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    gap: 8,
};

const title: React.CSSProperties = {
    fontWeight: 900,
    opacity: 0.9
};

const inp: React.CSSProperties = {
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
};

const button: React.CSSProperties = {
    padding: "12px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.9)",
    color: "#163a4a",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
};

const buttonDanger: React.CSSProperties = {
    ...button,
    background: "rgba(255,120,120,0.18)",
    color: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(255,120,120,0.25)",
};
