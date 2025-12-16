"use client"

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authStorage } from "@/lib/authStorage";

export default function AuthGate({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = authStorage.getToken();
        if (!token)
            router.replace("/login");
    }, [router, pathname]);

    return <>{children}</>;
};