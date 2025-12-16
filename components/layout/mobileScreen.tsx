import type { ReactNode } from "react";

export default function MobileScreen({ children }: { children: ReactNode }) {
    return <div style={{ height: "100%", padding: 20 }}>{children}</div>;
}