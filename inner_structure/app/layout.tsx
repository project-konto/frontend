import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
    title: "Konto",
    description: "Personal finance tracker",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <AppShell>{children}</AppShell>
        </body>
        </html>
    )
}