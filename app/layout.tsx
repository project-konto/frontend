import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body style={{ color: "#0b0b0b", background: "#f3f4f6" }}>{children}</body>
        </html>
    );
}