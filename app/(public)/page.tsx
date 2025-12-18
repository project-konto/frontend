import Link from "next/link";

export default function WelcomePage() {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                padding: 24,
                background: "radial-gradient(900px 700px at 20% 0%, #2f5a6f 0%, #163a4a 40%, #0f2a36 100%)",
                color: "rgba(255,255,255,0.92)",
            }}>
            <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ opacity: 0.9, fontWeight: 600, letterSpacing: 0.5 }}>Konto</div>
                <h1 style={{ marginTop: 56, fontSize: 44, lineHeight: 1.05, fontWeight: 800, opacity: 0.95 }}>
                    Take control <br /> of your money
                </h1>
                <p style={{ marginTop: 14, opacity: 0.75, fontSize: 13 }}>
                    Manage your incomes and expenses, log transactions and create financial goals in one place.
                </p>
                <div style={{ marginTop: 22, display: "flex", gap: 10, justifyContent: "center" }}>
                    <Link href="/register" style={buttonPrimary}>Sign up</Link>
                    <Link href="/login" style={buttonSecondary}>Log in</Link>
                </div>
            </div>
        </div>
    );
}

const buttonPrimary: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.9)",
    color: "#163a4a",
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
};

const buttonSecondary: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
};
