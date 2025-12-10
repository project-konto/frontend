"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/budget", label: "Budget", icon: BarChart3 },
  { href: "/transactions", label: "Transactions", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavigationBar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-around px-4 py-2.5 border-t border-slate-200 bg-white">
      {navigationItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1",
              "py-1",
              active ? "" : "text-slate-500"
            )}
            style={active ? { color: "#4C7D95" } : undefined}
          >
            <Icon
              className={cn("w-5 h-5", !active && "text-slate-500")}
              style={active ? { color: "#4C7D95" } : undefined}
            />
            <span
              className={cn(
                "text-xs",
                active ? "font-medium" : "text-slate-500"
              )}
              style={active ? { color: "#4C7D95" } : undefined}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
