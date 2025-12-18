import "../globals.css";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import AuthGate from "@/components/layout/authGate";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg">
            <div className="phone">
                <AuthGate>
                    <AppShell>{children}</AppShell>
                </AuthGate>
            </div>
        </div>
    );
}