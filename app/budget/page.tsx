"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for expenses chart
const expenseChartData = [
  { name: "Mon", amount: 45 },
  { name: "Tue", amount: 78 },
  { name: "Wed", amount: 92 },
  { name: "Thu", amount: 65 },
  { name: "Fri", amount: 110 },
  { name: "Sat", amount: 85 },
  { name: "Sun", amount: 58 },
];

function formatCurrency(amount: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const timePeriodOptions = [
  { label: "Last Week", value: "last-week" },
  { label: "Last Month", value: "last-month" },
];

export default function BudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-week");

  return (
    <div className="space-y-3">
      {/* Savings Card */}
      <Card className="p-3 bg-white rounded-xl gap-0">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-0">
          CURRENT BALANCE
        </div>
        <div className="text-3xl font-bold text-slate-900">£2178.45</div>
      </Card>

      {/* Expenses Chart Card */}
      <Card className="p-3 bg-white rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Expenses
          </div>
          <Dropdown
            options={timePeriodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            buttonClassName="text-slate-900"
          />
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={expenseChartData}
            margin={{ top: 5, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b" }}
              stroke="#cbd5e1"
              axisLine={false}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#64748b", dx: 0 }}
              stroke="#cbd5e1"
              axisLine={false}
              domain={[0, 120]}
              ticks={[0, 30, 60, 90, 120]}
              tickFormatter={(value) => `£${value}`}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                padding: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar
              dataKey="amount"
              fill="#4C7D95"
              radius={[4, 4, 0, 0]}
              yAxisId="right"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Incomes and Expenses Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-white rounded-xl flex flex-col gap-0">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
            Incomes
          </div>
          <div className="text-xl font-bold text-slate-900 mb-auto">
            £4200.00
          </div>
          <Button
            size="sm"
            className="text-white rounded-lg w-full py-1.5 text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: "#4C7D95" }}
          >
            + Log
          </Button>
        </Card>
        <Card className="p-3 bg-white rounded-xl flex flex-col gap-0">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
            Expenses
          </div>
          <div className="text-xl font-bold text-slate-900 mb-auto">
            £2814.89
          </div>
          <Button
            size="sm"
            className="text-white rounded-lg w-full py-1.5 text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: "#4C7D95" }}
          >
            + Log
          </Button>
        </Card>
      </div>
    </div>
  );
}
