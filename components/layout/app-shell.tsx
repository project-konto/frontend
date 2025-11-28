import { Header } from './header'
import { NavigationBar} from './navigation-bar'

type AppShellProperties = {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProperties) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="w-full max-w-sm h-[720px] bg-white rounded-3xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto px-4 py-3">
                    {children}
                </main>
                <NavigationBar />
            </div>
        </div>
    )
}