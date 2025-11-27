import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Page() {
    return (
        <div className="space-y-3">
            <Card className="p-4 space-y-1">
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Mortgage
                </div>
                <div className="text-2xl font-semibold text-slate-900">£280.000</div>
                <div className="text-xs text-slate-500">£450.000 total</div>
                <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-sky-500" />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span>62% paid</span>
                    <span>£170,000 left</span>
                </div>
                <div className="mt-3 flex-justify-end">
                    <Button size="sm">+ Log</Button>
                </div>
            </Card>
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-3">
                    <div className="text-xs text-slate-500">Incomes</div>
                    <div className="text-lg font-semibold">£4200.00</div>
                </Card>
                <Card className="p-3">
                    <div className="text-xs text-slate-500">Expenses</div>
                    <div className="text-lg font-semibold">£2814.89</div>
                </Card>
            </div>
        </div>
    )
}