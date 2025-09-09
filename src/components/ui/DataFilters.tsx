import { useState, useEffect, useMemo } from "react";
import { ServiceData } from "@/types/billing";

interface DataFiltersProps {
  data: ServiceData[];
  onFiltersChange: (filteredData: ServiceData[]) => void;
  onBreakdownChange?: (breakdown: "cost" | "quantity") => void;
  serviceType?:
    | "actionsMinutes"
    | "actionsStorage"
    | "packages"
    | "copilot"
    | "codespaces";
}

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  organization: string;
  costCenter: string;
  repository: string;
  breakdown: "cost" | "quantity";
}

export function DataFilters({
  data,
  onFiltersChange,
  onBreakdownChange,
  serviceType,
}: DataFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: "", end: "" },
    organization: "",
    costCenter: "",
    repository: "",
    breakdown: "quantity",
  });

  // Get unique values for dropdowns
  const organizations = Array.from(
    new Set(data.map((item) => item.organization).filter(Boolean))
  ).sort();
  const costCenters = Array.from(
    new Set(data.map((item) => item.costCenter).filter(Boolean))
  ).sort();
  
  // Repositories are now filtered based on the selected organization
  const repositories = useMemo(() => {
    if (!filters.organization) {
      return []; // No organization selected, so no repositories to show
    }
    return Array.from(
      new Set(
        data
          .filter((item) => item.organization === filters.organization)
          .map((item) => item.repository)
          .filter(Boolean)
      )
    ).sort();
  }, [data, filters.organization]);

  // Get date range from data
  const dates = data.map((item) => item.date).sort();
  const minDate = dates[0] || "";
  const maxDate = dates[dates.length - 1] || "";

  // Initialize date range on first load
  useEffect(() => {
    if (
      minDate &&
      maxDate &&
      !filters.dateRange.start &&
      !filters.dateRange.end
    ) {
      setFilters((prev) => ({
        ...prev,
        dateRange: { start: minDate, end: maxDate },
      }));
    }
  }, [minDate, maxDate, filters.dateRange.start, filters.dateRange.end]);

  // Calculate filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Date range filter
      if (filters.dateRange.start && item.date < filters.dateRange.start)
        return false;
      if (filters.dateRange.end && item.date > filters.dateRange.end)
        return false;

      // Organization filter
      if (filters.organization && item.organization !== filters.organization)
        return false;

      // Cost center filter
      if (filters.costCenter && item.costCenter !== filters.costCenter)
        return false;

      // Repository filter
      if (filters.repository && item.repository !== filters.repository)
        return false;

      return true;
    });
  }, [data, filters]);

  // Apply filters whenever filteredData changes
  useEffect(() => {
    onFiltersChange(filteredData);
  }, [filteredData]);

  // Notify parent of breakdown changes
  useEffect(() => {
    if (onBreakdownChange) {
      onBreakdownChange(filters.breakdown);
    }
  }, [filters.breakdown]);

  // Notify parent of initial breakdown state on mount
  useEffect(() => {
    if (onBreakdownChange) {
      onBreakdownChange(filters.breakdown);
    }
  }, []); // Only run on mount

  const handleFilterChange = (
    key: string,
    value: string | { start: string; end: string }
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { start: minDate, end: maxDate },
      organization: "",
      costCenter: "",
      repository: "",
      breakdown: "quantity",
    });
  };

  const handleOrganizationChange = (org: string) => {
    setFilters((prev) => ({
      ...prev,
      organization: org,
      repository: "", // Reset repository when organization changes
    }));
  };

  const hasActiveFilters =
    filters.organization ||
    filters.costCenter ||
    filters.repository ||
    filters.dateRange.start !== minDate ||
    filters.dateRange.end !== maxDate;

  // Show breakdown selector for relevant service types
  const showBreakdownSelector =
    serviceType === "actionsMinutes" ||
    serviceType === "actionsStorage" ||
    serviceType === "packages";

  return (
    <div className="bg-gray-800/30 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          showBreakdownSelector ? "lg:grid-cols-4" : "lg:grid-cols-3"
        } gap-4`}
      >
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start}
              min={minDate}
              max={maxDate}
              onChange={(e) =>
                handleFilterChange("dateRange", {
                  ...filters.dateRange,
                  start: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              min={minDate}
              max={maxDate}
              onChange={(e) =>
                handleFilterChange("dateRange", {
                  ...filters.dateRange,
                  end: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Organization</label>
          <select
            value={filters.organization}
            onChange={(e) => handleOrganizationChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Center */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Cost Center</label>
          <select
            value={filters.costCenter}
            onChange={(e) => handleFilterChange("costCenter", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Cost Centers</option>
            {costCenters.map((cc) => (
              <option key={cc} value={cc}>
                {cc}
              </option>
            ))}
          </select>
        </div>

        {/* Repository (conditionally rendered) */}
        {filters.organization && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Repository</label>
            <select
              value={filters.repository}
              onChange={(e) => handleFilterChange("repository", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!filters.organization}
            >
              <option value="">All Repositories</option>
              {repositories.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Breakdown Selector */}
        {showBreakdownSelector && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Breakdown By</label>
            <select
              value={filters.breakdown}
              onChange={(e) =>
                handleFilterChange(
                  "breakdown",
                  e.target.value as "cost" | "quantity"
                )
              }
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cost">Cost ($)</option>
              <option value="quantity">Usage Volume</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
