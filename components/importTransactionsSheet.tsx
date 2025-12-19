"use client"

import { useMemo, useRef, useState } from "react";
import apiClient from "@/lib/apiClient";
import { accountApi } from "@/lib/api/account";
import { budgetApi } from "@/lib/api/budget";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Props = {
    open: boolean;
    onClose: () => void;
    budgetId: string | null;
    onImported?: () => void;
};
type Stage = "pick" | "ready" | "uploading" | "done";
type ImportResultDto = {
    TotalProcessed: number;
    SuccessCount: number;
    FailedCount: number;
    Errors: string[];
}

export default function ImportTransactionsSheet({ open, onClose, onImported, budgetId }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [stage, setStage] = useState<Stage>("pick");
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [etaSec, setEtaSec] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ImportResultDto | null>(null);

    const fileSizeLabel = useMemo(() => {
        if (!file)
            return "";

        const kilobyte = Math.round(file.size / 1024);
        return kilobyte >= 1024 ? `${(kilobyte / 1024).toFixed(1)}MB` : `${kilobyte}KB`;
    }, [file]);

    if (!open)
        return null;

    function reset() {
        setStage("pick");
        setFile(null);
        setProgress(0);
        setEtaSec(null);
        setError(null);

        if (inputRef.current)
            inputRef.current.value = "";
    }

    function close() {
        reset();
        onClose();
    }

    function pickFile() {
        inputRef.current?.click();
    }

    function onFileSelected(file: File | null) {
        setError(null);
        setFile(file);
        setStage(file ? "ready" : "pick");

        if (!file && inputRef.current)
            inputRef.current.value = "";
    }

    async function upload() {
        if (!file) {
            setError("Choose a file first");
            return;
        }

        let activeId = budgetId;
        if (!activeId && typeof window !== "undefined") {
            const stored = localStorage.getItem("konto_active_budget");
            if (stored)
                activeId = stored;
        }

        if (!activeId) {
            setError("No budget selected");
            return;
        }

        setError(null);
        setStage("uploading");
        setProgress(0);
        setEtaSec(null);
        setResult(null);

        const form = new FormData();
        form.append("file", file);
        form.append("budgetId", activeId);

        const startedAt = performance.now();
        let lastLoaded = 0;
        let lastTime = startedAt;

        try {
            const result = await apiClient.post<ImportResultDto>("/api/transactions/import", form, {
                onUploadProgress: (e) => {
                    const total = e.total ?? file.size;
                    const loaded = e.loaded ?? 0;
                    const pct = total > 0 ? (loaded / total) * 100 : 0;
                    setProgress(Math.max(0, Math.min(100, Math.round(pct))));

                    const now = performance.now();
                    const dt = (now - lastTime) / 1000;

                    if (dt >= 0.25) {
                        const dLoaded = loaded - lastLoaded;
                        const speed = dLoaded / dt;

                        if (speed > 0) {
                            const remaining = Math.max(0, total - loaded);
                            setEtaSec(Math.ceil(remaining / speed));
                        }

                        lastLoaded = loaded;
                        lastTime = now;
                    }
                }
            });

            setResult(result.data);
            setStage("done");
            setProgress(100);
            setEtaSec(0);
            onImported?.();
        }

        catch (error: unknown) {
            setError(getErrorMessage(error, "Upload failed"));
            setStage("ready");
        }
    }

    return (
        <div style={overlay} onMouseDown={close}>
            <div style={sheet} onMouseDown={(e) => e.stopPropagation()}>
                <div style={header}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>Add Transaction</div>
                        <div style={{ opacity: 0.7, fontSize: 12 }}>We support .csv and .pdf</div>
                    </div>
                    <button style={iconButton} onClick={close}>×</button>
                </div>
                <div style={body}>
                    {stage === "pick" && (
                        <div style={center}>
                            <div style={{ fontSize: 28, opacity: 0.85 }}>⤴</div>
                            <div style={{ marginTop: 10, fontWeight: 800 }}>Choose File to Upload</div>
                            <div style={{ marginTop: 4, fontSize: 12, opacity: 0.65 }}>.CSV or .PDF</div>
                        </div>
                    )}
                    {(stage === "ready" || stage === "uploading" || stage === "done") && file && (
                        <div style={fileCard}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={fileIcon}>📄</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {file.name}
                                    </div>
                                    <div style={{ fontSize: 12, opacity: 0.65 }}>{fileSizeLabel}</div>
                                    {stage === "uploading" && (
                                        <>
                                            <div style={barWrap}>
                                                <div style={{ ...barFill, width: `${progress}%` }} />
                                            </div>
                                            <div style={{ fontSize: 12, opacity: 0.65 }}>
                                                {etaSec !== null ? `${etaSec}s left` : "Uploading..."}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {stage !== "uploading" && (
                                    <button
                                        title="Remove"
                                        style={trashButton}
                                        onClick={() => onFileSelected(null)}
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                            {stage === "done" && (
                                <div style={{ display: "grid", gap: 8, textAlign: "center" }}>
                                    <div style={{ fontWeight: 900, fontSize: 16 }}>
                                        Import finished
                                    </div>
                                    {result && (
                                        <div style={{ fontSize: 13, opacity: 0.8 }}>
                                            Processed: {result.TotalProcessed} • Success: {result.SuccessCount} • Failed: {result.FailedCount}
                                        </div>
                                    )}
                                    {result?.Errors?.length ? (
                                        <div style={{ textAlign: "left", fontSize: 12, opacity: 0.85, marginTop: 6 }}>
                                            <div style={{ fontWeight: 900, marginBottom: 6 }}>Some rows failed:</div>
                                            <ul style={{ paddingLeft: 18, margin: 0, display: "grid", gap: 4 }}>
                                                {result.Errors.slice(0, 5).map((e, i) => (
                                                    <li key={i}>{e}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    )}
                    {error && <div style={errorText}>{error}</div>}
                </div>
                <div style={footer}>
                    <button style={linkButton} onClick={() => alert("Help can be added later")}>Get Help</button>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button style={ghostButton} onClick={close}>Cancel</button>
                        <button
                            style={primaryButton}
                            onClick={stage === "pick" ? pickFile : upload}
                            disabled={stage === "uploading"}
                        >
                            {stage === "pick"
                                ? "Choose file"
                                : stage === "uploading"
                                    ? "Uploading..."
                                    : "Upload"}
                        </button>
                    </div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.pdf,application/pdf,text/csv"
                    style={{ display: "none" }}
                    onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                />
            </div>
        </div>
    );
}

const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    alignItems: "end",
    zIndex: 50,
};

const sheet: React.CSSProperties = {
    background: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: 24,
    minHeight: 350,
    display: "flex",
    flexDirection: "column",
};

const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 12
};

const iconButton: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 18,
    border: "none",
    background: "rgba(0,0,0,0.06)",
    cursor: "pointer",
    fontSize: 18
};

const body: React.CSSProperties = {
    marginTop: 14,
    flex: 1,
    display: "grid",
    placeItems: "center",
};

const center: React.CSSProperties = {
    textAlign: "center",
    color: "rgba(0,0,0,0.72)",
};

const fileCard: React.CSSProperties = {
    background: "rgba(0,0,0,0.04)",
    borderRadius: 16,
    padding: 12,
};

const fileIcon: React.CSSProperties = {
    width: 42,
    height: 42,
    borderRadius: 21,
    background: "rgba(0,0,0,0.06)",
    display: "grid",
    placeItems: "center",
    fontSize: 18,
};

const trashButton: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 20,
    border: "none",
    background: "rgba(0,0,0,0.06)",
    cursor: "pointer",
};

const barWrap: React.CSSProperties = {
    marginTop: 8,
    height: 8,
    borderRadius: 999,
    background: "rgba(0,0,0,0.10)",
    overflow: "hidden",
};

const barFill: React.CSSProperties = {
    height: "100%",
    borderRadius: 999,
    background: "rgba(22,58,74,0.65)",
};

const footer: React.CSSProperties = {
    marginTop: "auto",
    paddingTop: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
};

const linkButton: React.CSSProperties = {
    border: "none",
    background: "transparent",
    color: "rgba(0,0,0,0.55)",
    cursor: "pointer",
    fontWeight: 700,
};

const ghostButton: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 800,
};

const primaryButton: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "rgba(22,58,74,0.80)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900
};

const errorText: React.CSSProperties = {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(160,0,0,0.75)"
};