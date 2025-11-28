"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigationItems = [
    { href: '/budget', label: 'Budget' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/settings', label: 'Settings' },
]

export function NavigationBar() {
    const pathname = usePathname()
    return (
        <nav className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-white">
            {navigationItems.map((item) => {
                const active = pathname.startsWith(item.href)
                    || (pathname === "/" && item.href === '/budget')

                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex-1 text-center text-xs',
                        'py-2 rounded-full',
                        active
                            ? 'font-semibold text-sky-700 bg-sky-100'
                            : 'text-slate-500 hover:text-slate-900',
                    )}>
                        {item.label}
                        </Link>
                )
            })}
        </nav>
    )
}