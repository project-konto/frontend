"use client";

import { Header } from "./header";
import { NavigationBar } from "./navigation-bar";
import { usePathname } from "next/navigation";

type AppShellProperties = {
  children: React.ReactNode;
};

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
    <div
      className="min-h-screen flex items-center justify-center p-2"
      style={{ backgroundColor: "#E5E5E5" }}
    >
      <div className="w-full max-w-sm h-[600px] bg-white rounded-3xl flex flex-col overflow-hidden">
        <Header title={title} />
        <main
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          {children}
        </main>
        <NavigationBar />
      </div>
    </div>
  );
}
