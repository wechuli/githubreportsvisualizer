"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BillingData } from "@/types/billing";

interface BillingChartProps {
  data: BillingData[];
  title?: string;
}

export function BillingChart({
  data,
  title = "GitHub Billing Overview",
}: BillingChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-xl font-semibold mb-6 text-white text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="actions"
            stackId="1"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
            name="GitHub Actions ($)"
          />
          <Area
            type="monotone"
            dataKey="packages"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
            name="Packages ($)"
          />
          <Area
            type="monotone"
            dataKey="storage"
            stackId="1"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.6}
            name="Storage ($)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
