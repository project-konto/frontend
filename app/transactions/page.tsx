import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {mock} from "node:test";

const mockToday = [
    { id: 1, title: "IKEA", category: "Home", amount: -239.99 },
    { id: 2, title: "Joe and the...", category: "Food", amount: -14.89 },
    { id: 3, title: "Shell", category: "Fuel", amount: -34.83 }
]

export default function TransactionsPage() {
    return (
        <div className="space-y-3">
            <div className="flex gap-2 mb-1">
                <Button size="sm" variant="outline" className="flex-1">
                    February
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                    All categories
                </Button>
                <Button size="sm">+</Button>
            </div>
            <Card className="p-4 space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Budget
                </div>
                <div className="flex justify-between text-sm">
                    <div>
                        <div className="font-semibold">£1400</div>
                        <div className="text-xs text-slate-500">Needs</div>
                    </div>
                    <div>
                        <div className="font-semibold">£870</div>
                        <div className="text-xs text-slate-500">Wants</div>
                    </div>
                    <div>
                        <div className="font-semibold">£840</div>
                        <div className="text-xs text-slate-500">Savings</div>
                    </div>
                </div>
            </Card>
            <Card className="p-4 space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Today
                </div>
                <div className="space-y-2">
                    {mockToday.map((tx) => (
                        <div key={tx.id} className="flex justify-between text-sm">
                            <div>
                                <div className="font-medium">{tx.title}</div>
                                <div className="text-xs text-slate-500">{tx.category}</div>
                            </div>
                            <div className="font-medium text-red-600">
                                {tx.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                    + Log Income
                </Button>
                <Button variant="outline" className="flex-1">
                    + Log Spending
                </Button>
            </div>
        </div>
    )
}