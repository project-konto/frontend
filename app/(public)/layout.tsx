import "../globals.css";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg">
            <div className="phone">{children}</div>
        </div>
    );
}