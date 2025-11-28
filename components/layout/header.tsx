"use client"

import { cn } from '@/lib/utils'

type HeaderProps = {
    title?: string
    rightSlot?: React.ReactNode
}

export function Header({ title = "Budget", rightSlot }: HeaderProps ) {
    return (
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Konto
                </span>
                <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            </div>
            <div className={cn('flex items-center gap-2')}>
                {rightSlot ?? (
                    <span className="text-xs text-slate-500">Last month ▾</span>
                )}
            </div>
        </header>
    )
}