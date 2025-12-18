"use client";

import { cn } from "@/lib/utils";

type HeaderProps = {
  title?: string;
  rightSlot?: React.ReactNode;
};

export function Header({ title = "Budget", rightSlot }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <div className={cn("flex items-center gap-1")}>
        {rightSlot}
      </div>
    </header>
  );
}