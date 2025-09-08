"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { ServiceData } from "@/types/billing";

interface ServiceChartProps {
  data: ServiceData[];
  title: string;
  serviceType:
    | "actionsMinutes"
    | "actionsStorage"
    | "packages"
    | "copilot"
    | "codespaces";
  useSkuAnalysis?: boolean; // Override to use SKU-based analysis instead of repository-based
  breakdown?: "cost" | "quantity"; // Whether to breakdown by cost or quantity
  hasMultipleOrganizations?: boolean; // Whether to show organization breakdown charts
}

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#d946ef",
  "#64748b",
];

export function ServiceChart({
  data,
  title,
  serviceType,
  useSkuAnalysis = false,
  breakdown = "quantity",
}: ServiceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">
            No {title.toLowerCase()} usage found in your billing report
          </p>
        </div>
      </div>
    );
  }

  // Check if data is filtered to a specific repository
  const repositories = Array.from(
    new Set(data.map((item) => item.repository).filter(Boolean))
  );
  const isRepositorySpecific = repositories.length === 1;

  // Check if data includes multiple organizations (for organization stacked charts)
  const organizations = Array.from(
    new Set(data.map((item) => item.organization).filter(Boolean))
  );
  const hasMultipleOrganizations = organizations.length > 1;

  // Repository-specific view: show only cost OR quantity based on breakdown
  if (isRepositorySpecific) {
    return (
      <RepositorySpecificChart
        data={data}
        title={title}
        serviceType={serviceType}
        breakdown={breakdown}
      />
    );
  }

  // Special case for Actions Minutes with specific organization selected
  if (serviceType === "actionsMinutes" && !useSkuAnalysis) {
    const isSingleOrganization = organizations.length === 1;

    if (isSingleOrganization) {
      return (
        <ActionsMinutesDetailedChart
          data={data}
          title={title}
          serviceType={serviceType}
          breakdown={breakdown}
        />
      );
    }
  }

  // Use repository-based analysis for Actions services (unless override), SKU-based for others
  const shouldUseRepositoryAnalysis =
    !useSkuAnalysis &&
    (serviceType === "actionsMinutes" || serviceType === "actionsStorage");

  if (shouldUseRepositoryAnalysis) {
    return (
      <RepositoryBasedChart
        data={data}
        title={title}
        serviceType={serviceType}
        breakdown={breakdown}
        hasMultipleOrganizations={hasMultipleOrganizations}
      />
    );
  } else {
    return (
      <SKUBasedChart
        data={data}
        title={title}
        serviceType={serviceType}
        breakdown={breakdown}
      />
    );
  }
}

function RepositorySpecificChart({
  data,
  title,
  serviceType,
  breakdown = "quantity",
}: ServiceChartProps) {
  const repository = data[0]?.repository || "Unknown Repository";

  // Aggregate data by date for the single repository
  const dailyData = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { date, cost: 0, quantity: 0, skus: new Set() };
    }
    acc[date].cost += item.cost;
    acc[date].quantity += item.quantity;
    acc[date].skus.add(item.sku);
    return acc;
  }, {} as Record<string, { date: string; cost: number; quantity: number; skus: Set<string> }>);

  const chartData = Object.values(dailyData)
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cost: item.cost,
      quantity: item.quantity,
      skuCount: item.skus.size,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Show last 30 days

  // SKU breakdown
  const skuData = data.reduce((acc, item) => {
    if (!acc[item.sku]) {
      acc[item.sku] = { sku: item.sku, cost: 0, quantity: 0 };
    }
    acc[item.sku].cost += item.cost;
    acc[item.sku].quantity += item.quantity;
    return acc;
  }, {} as Record<string, { sku: string; cost: number; quantity: number }>);

  const skuBreakdown = Object.values(skuData).sort((a, b) =>
    breakdown === "cost" ? b.cost - a.cost : b.quantity - a.quantity
  );

  // Calculate totals
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueSkus = new Set(data.map((item) => item.sku)).size;

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatQuantity = (value: number) => {
    if (serviceType === "actionsMinutes") {
      return `${value.toLocaleString()} min`;
    } else if (serviceType === "actionsStorage" || serviceType === "packages") {
      return `${value.toLocaleString()} GB·h`;
    } else if (serviceType === "copilot") {
      return `${value.toFixed(2)} users`;
    } else {
      return value.toLocaleString();
    }
  };

  const getFormatter = () =>
    breakdown === "cost" ? formatCurrency : formatQuantity;
  const getBreakdownLabel = () => (breakdown === "cost" ? "Cost" : "Usage");
  const getDataKey = () => (breakdown === "cost" ? "cost" : "quantity");

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-400">
          Repository: {repository}
        </h3>
        <p className="text-sm text-gray-400">
          Filtered view showing {getBreakdownLabel().toLowerCase()} analysis for
          this repository
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Cost</h3>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Usage</h3>
          <p className="text-2xl font-bold text-blue-400">
            {formatQuantity(totalQuantity)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">SKU Types</h3>
          <p className="text-2xl font-bold text-purple-400">{uniqueSkus}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Daily {getBreakdownLabel()} Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={getFormatter()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  getFormatter()(value),
                  getBreakdownLabel(),
                ]}
                labelStyle={{ color: "#d1d5db" }}
              />
              <Area
                type="monotone"
                dataKey={getDataKey()}
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* SKU Breakdown */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {getBreakdownLabel()} by SKU
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skuBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey={breakdown}
              >
                {skuBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  getFormatter()(value),
                  getBreakdownLabel(),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {skuBreakdown.map((entry, index) => (
              <div key={entry.sku} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-gray-300 flex-1 truncate"
                  title={entry.sku}
                >
                  {entry.sku}
                </span>
                <span className="text-white font-medium">
                  {getFormatter()(entry[breakdown])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionsMinutesDetailedChart({
  data,
  title,
  serviceType,
  breakdown = "quantity",
}: ServiceChartProps) {
  // Get top 10 repositories by total cost
  const repoTotals = data.reduce((acc, item) => {
    const repo = item.repository || "Unknown";
    if (!acc[repo]) {
      acc[repo] = { cost: 0, quantity: 0 };
    }
    acc[repo].cost += item.cost;
    acc[repo].quantity += item.quantity;
    return acc;
  }, {} as Record<string, { cost: number; quantity: number }>);

  const topRepos = Object.entries(repoTotals)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 10)
    .map(([repo]) => repo);

  // SKU breakdown
  const skuTotals = data.reduce((acc, item) => {
    if (!acc[item.sku]) {
      acc[item.sku] = { cost: 0, quantity: 0 };
    }
    acc[item.sku].cost += item.cost;
    acc[item.sku].quantity += item.quantity;
    return acc;
  }, {} as Record<string, { cost: number; quantity: number }>);

  const topSkus = Object.entries(skuTotals)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 6)
    .map(([sku]) => sku);

  // Aggregate data by date with repository breakdown
  const dailyData = data.reduce((acc, item) => {
    const date = item.date;
    const repo = topRepos.includes(item.repository || "Unknown")
      ? item.repository || "Unknown"
      : "Others";

    if (!acc[date]) {
      acc[date] = { date, total: 0, totalQuantity: 0 };
      // Initialize all top repos and Others to 0 for both cost and quantity
      topRepos.forEach((r) => {
        acc[date][r] = 0;
        acc[date][`${r}_quantity`] = 0;
      });
      acc[date]["Others"] = 0;
      acc[date]["Others_quantity"] = 0;
    }

    acc[date][repo] = (acc[date][repo] || 0) + item.cost;
    acc[date][`${repo}_quantity`] =
      (acc[date][`${repo}_quantity`] || 0) + item.quantity;
    acc[date].total += item.cost;
    acc[date].totalQuantity += item.quantity;
    return acc;
  }, {} as Record<string, any>);

  const stackedChartData = Object.values(dailyData)
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Show last 30 days

  // Repository breakdown for pie chart (top 10 + others)
  const repoBreakdown = [
    ...topRepos.map((repo) => ({
      name: repo,
      cost: repoTotals[repo].cost,
      quantity: repoTotals[repo].quantity,
    })),
  ];

  // Add "Others" if there are more than 10 repos
  const otherRepos = Object.keys(repoTotals).filter(
    (repo) => !topRepos.includes(repo)
  );
  if (otherRepos.length > 0) {
    const othersCost = otherRepos.reduce(
      (sum, repo) => sum + repoTotals[repo].cost,
      0
    );
    const othersQuantity = otherRepos.reduce(
      (sum, repo) => sum + repoTotals[repo].quantity,
      0
    );
    repoBreakdown.push({
      name: "Others",
      cost: othersCost,
      quantity: othersQuantity,
    });
  }

  // SKU breakdown for pie chart
  const skuBreakdown = topSkus.map((sku) => ({
    name: sku,
    cost: skuTotals[sku].cost,
    quantity: skuTotals[sku].quantity,
  }));

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueRepos = new Set(
    data.map((item) => item.repository).filter(Boolean)
  ).size;
  const uniqueSkus = new Set(data.map((item) => item.sku)).size;

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatQuantity = (value: number) => {
    return `${value.toLocaleString()} min`;
  };

  const reposToShow =
    topRepos.length > 0
      ? [...topRepos, ...(otherRepos.length > 0 ? ["Others"] : [])]
      : [];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Cost</h3>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Minutes</h3>
          <p className="text-2xl font-bold text-blue-400">
            {formatQuantity(totalQuantity)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Repositories</h3>
          <p className="text-2xl font-bold text-purple-400">{uniqueRepos}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">SKU Types</h3>
          <p className="text-2xl font-bold text-orange-400">{uniqueSkus}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Cost Trend - Stacked by Repository */}
        <div className="lg:col-span-2 bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Daily Cost by Repository
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stackedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Cost"]}
                labelStyle={{ color: "#d1d5db" }}
              />
              {reposToShow.map((repo, index) => (
                <Area
                  key={repo}
                  type="monotone"
                  dataKey={repo}
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* SKU Breakdown */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cost by SKU</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skuBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="cost"
              >
                {skuBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Cost"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {skuBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-gray-300 flex-1 truncate"
                  title={entry.name}
                >
                  {entry.name}
                </span>
                <span className="text-white font-medium">
                  {formatCurrency(entry.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Breakdown */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cost by Repository</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repoBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="cost"
              >
                {repoBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Cost"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {repoBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-gray-300 flex-1 truncate"
                  title={entry.name}
                >
                  {entry.name}
                </span>
                <span className="text-white font-medium">
                  {formatCurrency(entry.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Usage Volume - Stacked by Repository */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Daily Minutes by Repository
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={formatQuantity}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  formatQuantity(value),
                  "Minutes",
                ]}
                labelStyle={{ color: "#d1d5db" }}
              />
              {reposToShow.map((repo, index) => (
                <Bar
                  key={repo}
                  dataKey={`${repo}_quantity`}
                  stackId="1"
                  fill={COLORS[index % COLORS.length]}
                  radius={
                    index === reposToShow.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RepositoryBasedChart({
  data,
  title,
  serviceType,
  breakdown = "quantity",
  hasMultipleOrganizations = false,
}: ServiceChartProps) {
  // Get top 10 repositories by the selected breakdown metric
  const repoTotals = data.reduce((acc, item) => {
    const repo = item.repository || "Unknown";
    if (!acc[repo]) {
      acc[repo] = { cost: 0, quantity: 0 };
    }
    acc[repo].cost += item.cost;
    acc[repo].quantity += item.quantity;
    return acc;
  }, {} as Record<string, { cost: number; quantity: number }>);

  const topRepos = Object.entries(repoTotals)
    .sort(([, a], [, b]) =>
      breakdown === "cost" ? b.cost - a.cost : b.quantity - a.quantity
    )
    .slice(0, 10)
    .map(([repo]) => repo);

  // Aggregate data by date with repository breakdown
  const dailyData = data.reduce((acc, item) => {
    const date = item.date;
    const repo = topRepos.includes(item.repository || "Unknown")
      ? item.repository || "Unknown"
      : "Others";

    if (!acc[date]) {
      acc[date] = { date, total: 0, totalQuantity: 0 };
      // Initialize all top repos and Others to 0 for both cost and quantity
      topRepos.forEach((r) => {
        acc[date][r] = 0;
        acc[date][`${r}_quantity`] = 0;
      });
      acc[date]["Others"] = 0;
      acc[date]["Others_quantity"] = 0;
    }

    acc[date][repo] = (acc[date][repo] || 0) + item.cost;
    acc[date][`${repo}_quantity`] =
      (acc[date][`${repo}_quantity`] || 0) + item.quantity;
    acc[date].total += item.cost;
    acc[date].totalQuantity += item.quantity;
    return acc;
  }, {} as Record<string, any>);

  const stackedChartData = Object.values(dailyData)
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Show last 30 days

  // Repository breakdown for pie chart (top 10 + others)
  const repoBreakdown = [
    ...topRepos.map((repo) => ({
      name: repo,
      cost: repoTotals[repo].cost,
      quantity: repoTotals[repo].quantity,
    })),
  ];

  // Add "Others" if there are more than 10 repos
  const otherRepos = Object.keys(repoTotals).filter(
    (repo) => !topRepos.includes(repo)
  );
  if (otherRepos.length > 0) {
    const othersCost = otherRepos.reduce(
      (sum, repo) => sum + repoTotals[repo].cost,
      0
    );
    const othersQuantity = otherRepos.reduce(
      (sum, repo) => sum + repoTotals[repo].quantity,
      0
    );
    repoBreakdown.push({
      name: "Others",
      cost: othersCost,
      quantity: othersQuantity,
    });
  }

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueRepos = new Set(
    data.map((item) => item.repository).filter(Boolean)
  ).size;

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatQuantity = (value: number) => {
    if (serviceType === "actionsMinutes") {
      return `${value.toLocaleString()} min`;
    } else if (serviceType === "actionsStorage" || serviceType === "packages") {
      return `${value.toLocaleString()} GB·h`;
    } else if (serviceType === "copilot") {
      return `${value.toFixed(2)} users`;
    } else {
      return value.toLocaleString();
    }
  };

  const reposToShow =
    topRepos.length > 0
      ? [...topRepos, ...(otherRepos.length > 0 ? ["Others"] : [])]
      : [];

  // Get the appropriate data key and formatter based on breakdown
  const getDataKey = (repo: string) =>
    breakdown === "cost" ? repo : `${repo}_quantity`;
  const getFormatter = () =>
    breakdown === "cost" ? formatCurrency : formatQuantity;
  const getBreakdownValue = (item: any) =>
    breakdown === "cost" ? item.cost : item.quantity;
  const getBreakdownLabel = () => (breakdown === "cost" ? "Cost" : "Usage");

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Cost</h3>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Usage</h3>
          <p className="text-2xl font-bold text-blue-400">
            {formatQuantity(totalQuantity)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Repositories</h3>
          <p className="text-2xl font-bold text-purple-400">{uniqueRepos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend - Stacked Bar Chart by Repository */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Daily {getBreakdownLabel()} by Repository
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={getFormatter()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  getFormatter()(value),
                  getBreakdownLabel(),
                ]}
                labelStyle={{ color: "#d1d5db" }}
              />
              {reposToShow.map((repo, index) => (
                <Bar
                  key={repo}
                  dataKey={getDataKey(repo)}
                  stackId="1"
                  fill={COLORS[index % COLORS.length]}
                  radius={
                    index === reposToShow.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Repository Breakdown */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {getBreakdownLabel()} by Repository
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repoBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey={breakdown}
              >
                {repoBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  getFormatter()(value),
                  getBreakdownLabel(),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {repoBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-gray-300 flex-1 truncate"
                  title={entry.name}
                >
                  {entry.name}
                </span>
                <span className="text-white font-medium">
                  {getFormatter()(getBreakdownValue(entry))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organization Stacked Chart (when multiple organizations are present) */}
      {hasMultipleOrganizations && (
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Daily {getBreakdownLabel()} by Organization
          </h3>
          <OrganizationStackedChart
            data={data}
            breakdown={breakdown}
            serviceType={serviceType}
          />
        </div>
      )}

      {/* Repository Usage Table */}
      <div className="bg-gray-800/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Repositories</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">
                  Repository
                </th>
                <th className="text-right py-3 px-4 text-gray-300">Cost</th>
                <th className="text-right py-3 px-4 text-gray-300">Usage</th>
                <th className="text-right py-3 px-4 text-gray-300">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {repoBreakdown.map((repo, index) => (
                <tr
                  key={repo.name}
                  className="border-b border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded mr-3"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-white truncate" title={repo.name}>
                        {repo.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-white font-medium">
                    {formatCurrency(repo.cost)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-300">
                    {formatQuantity(repo.quantity)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-300">
                    {breakdown === "cost"
                      ? ((repo.cost / totalCost) * 100).toFixed(1)
                      : ((repo.quantity / totalQuantity) * 100).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SKUBasedChart({
  data,
  title,
  serviceType,
  breakdown = "quantity",
}: ServiceChartProps) {
  // Check if we have multiple organizations to show organization breakdown
  const organizations = Array.from(
    new Set(data.map((item) => item.organization).filter(Boolean))
  );
  const hasMultipleOrganizations = organizations.length > 1;

  // Aggregate data by date
  const dailyData = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        cost: 0,
        quantity: 0,
        skus: new Set(),
        organizations: new Set(),
      };
    }
    acc[date].cost += item.cost;
    acc[date].quantity += item.quantity;
    acc[date].skus.add(item.sku);
    if (item.organization) acc[date].organizations.add(item.organization);
    return acc;
  }, {} as Record<string, { date: string; cost: number; quantity: number; skus: Set<string>; organizations: Set<string> }>);

  const chartData = Object.values(dailyData)
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cost: item.cost,
      quantity: item.quantity,
      skuCount: item.skus.size,
      orgCount: item.organizations.size,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Show last 30 days

  // SKU breakdown for pie chart
  const skuData = data.reduce((acc, item) => {
    if (!acc[item.sku]) {
      acc[item.sku] = { sku: item.sku, cost: 0, quantity: 0 };
    }
    acc[item.sku].cost += item.cost;
    acc[item.sku].quantity += item.quantity;
    return acc;
  }, {} as Record<string, { sku: string; cost: number; quantity: number }>);

  const skuPieData = Object.values(skuData)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 6); // Top 6 SKUs

  // Organization breakdown for pie chart (if multiple organizations)
  const orgData = hasMultipleOrganizations
    ? data.reduce((acc, item) => {
        const org = item.organization || "Unknown";
        if (!acc[org]) {
          acc[org] = { organization: org, cost: 0, quantity: 0 };
        }
        acc[org].cost += item.cost;
        acc[org].quantity += item.quantity;
        return acc;
      }, {} as Record<string, { organization: string; cost: number; quantity: number }>)
    : {};

  const orgPieData = hasMultipleOrganizations
    ? Object.values(orgData).sort((a, b) => b.cost - a.cost)
    : [];

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueSkus = new Set(data.map((item) => item.sku)).size;
  const uniqueOrganizations = organizations.length;

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatQuantity = (value: number) => {
    if (serviceType === "actionsMinutes") {
      return `${value.toLocaleString()} min`;
    } else if (serviceType === "actionsStorage" || serviceType === "packages") {
      return `${value.toLocaleString()} GB·h`;
    } else if (serviceType === "copilot") {
      return `${value.toFixed(2)} users`;
    } else {
      return value.toLocaleString();
    }
  };

  // Get the appropriate formatter and labels based on breakdown
  const getFormatter = () =>
    breakdown === "cost" ? formatCurrency : formatQuantity;
  const getBreakdownLabel = () => (breakdown === "cost" ? "Cost" : "Usage");
  const getDataKey = () => (breakdown === "cost" ? "cost" : "quantity");

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div
        className={`grid grid-cols-1 ${
          hasMultipleOrganizations ? "md:grid-cols-4" : "md:grid-cols-3"
        } gap-4 mb-6`}
      >
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Cost</h3>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Usage</h3>
          <p className="text-2xl font-bold text-blue-400">
            {formatQuantity(totalQuantity)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">SKU Types</h3>
          <p className="text-2xl font-bold text-purple-400">{uniqueSkus}</p>
        </div>
        {hasMultipleOrganizations && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Organizations</h3>
            <p className="text-2xl font-bold text-orange-400">
              {uniqueOrganizations}
            </p>
          </div>
        )}
      </div>

      <div
        className={`grid grid-cols-1 ${
          hasMultipleOrganizations ? "lg:grid-cols-3" : "lg:grid-cols-2"
        } gap-6`}
      >
        {/* Daily Trend */}
        <div className={hasMultipleOrganizations ? "lg:col-span-2" : ""}>
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Daily {getBreakdownLabel()} Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={getFormatter()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    getFormatter()(value),
                    getBreakdownLabel(),
                  ]}
                  labelStyle={{ color: "#d1d5db" }}
                />
                <Area
                  type="monotone"
                  dataKey={getDataKey()}
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SKU Breakdown */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {getBreakdownLabel()} by SKU
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skuPieData}
                cx="50%"
                cy="50%"
                innerRadius={hasMultipleOrganizations ? 40 : 60}
                outerRadius={hasMultipleOrganizations ? 80 : 100}
                paddingAngle={2}
                dataKey={breakdown}
              >
                {skuPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  getFormatter()(value),
                  getBreakdownLabel(),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {skuPieData.map((entry, index) => (
              <div key={entry.sku} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-gray-300 flex-1 truncate"
                  title={entry.sku}
                >
                  {entry.sku}
                </span>
                <span className="text-white font-medium">
                  {getFormatter()(entry[breakdown])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Breakdown (only if multiple organizations) */}
        {hasMultipleOrganizations && (
          <div className="lg:col-span-3 bg-gray-800/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {getBreakdownLabel()} by Organization
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orgPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey={breakdown}
                  >
                    {orgPieData.map((entry, index) => (
                      <Cell
                        key={`org-${index}`}
                        fill={COLORS[(index + 6) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      getFormatter()(value),
                      getBreakdownLabel(),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-300 mb-3">
                  Organization Breakdown
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orgPieData.map((entry, index) => (
                    <div
                      key={entry.organization}
                      className="flex items-center justify-between text-sm bg-gray-700/30 rounded p-2"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded mr-3"
                          style={{
                            backgroundColor:
                              COLORS[(index + 6) % COLORS.length],
                          }}
                        />
                        <span
                          className="text-white font-medium"
                          title={entry.organization}
                        >
                          {entry.organization}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">
                          {getFormatter()(entry[breakdown])}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {breakdown === "cost"
                            ? formatQuantity(entry.quantity)
                            : formatCurrency(entry.cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
