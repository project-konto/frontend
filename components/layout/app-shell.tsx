"use client";

import { Header } from "./header";
import { NavigationBar } from "./navigation-bar";
import { usePathname } from "next/navigation";

type AppShellProperties = { children: React.ReactNode };

function getPageTitle(pathname: string): string {
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/budget")) return "Budget";
    if (pathname.startsWith("/transactions")) return "Transactions";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Budget";
}

export function AppShell({ children }: AppShellProperties) {
    const pathname = usePathname();
    const title = getPageTitle(pathname);

    return (
        <>
            <Header title={title} />
            <main
                className="flex-1 overflow-y-auto px-3 py-3"
                style={{ backgroundColor: "#F5F5F5", paddingBottom: 92, position: "relative" }}
            >
                {children}
            </main>
            <NavigationBar />
        </>
    );
}