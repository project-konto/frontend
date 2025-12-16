import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="viewport">
            <div className="phone" style={{ color: "rgba(255,255,255,0.95)" }}>{children}</div>
        </div>
    );
}