"use client";

import { useEffect, useState, startTransition } from "react";
import { categoriesApi, CategoryDto } from "@/lib/api/categories";
import {getErrorMessage} from "@/lib/getErrorMessage";

export default function CategoriesPage() {
    const [items, setItems] = useState<CategoryDto[]>([]);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setError(null);

        try {
            setItems(await categoriesApi.list());
        }

        catch (e: unknown) {
            setError(getErrorMessage(e, "Failed to load cateogries"));
        }
    }

    useEffect(() => {
        startTransition(() => {
            void load();
        });
    }, []);

    async function create() {
        setError(null);

        try {
            await categoriesApi.create({ name });
            setName("");
            await load();
        }
        catch (e: unknown) {
            setError(getErrorMessage(e, "Create failed"));
        }
    }

    async function rename(id: string, oldName: string) {
        const newName = prompt("New name:", oldName);
        if (!newName)
            return;

        await categoriesApi.update(id, { name: newName });
        await load();
    }

    async function del(id: string) {
        if (!confirm("Delete?"))
            return;

        await categoriesApi.delete(id);
        await load();
    }

    return (
        <div style={{ height: "100%", padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
            <div style={{ fontWeight: 900, opacity: 0.92 }}>Categories</div>
            <div style={card}>
                <input style={inp} placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
                <button style={button} onClick={create}>Create</button>
            </div>
            {error && <div style={{ fontSize: 13, color: "rgba(255,180,180,0.95)" }}>{error}</div>}
            <div style={{ display: "grid", gap: 8 }}>
                {items.map((c) => (
                    <div key={c.id} style={row}>
                        <div style={{ fontWeight: 800 }}>{c.name}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button style={smallButton} onClick={() => rename(c.id, c.name)}>Rename</button>
                            <button style={{ ...smallButton, background: "rgba(255,120,120,0.16)" }} onClick={() => del(c.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
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

const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
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

const smallButton: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
};
