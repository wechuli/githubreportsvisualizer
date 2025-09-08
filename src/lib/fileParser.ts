import {
  BillingData,
  GitHubBillingReport,
  FileUploadResult,
  CategorizedBillingData,
  ServiceData,
} from "@/types/billing";

export function parseCSV(csvContent: string): {
  data: BillingData[];
  categorizedData: CategorizedBillingData;
} {
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV file appears to be empty or invalid");
  }

  // Parse header
  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

  // Find column indices (flexible matching)
  const dateIndex = header.findIndex((h) => h.toLowerCase().includes("date"));
  const productIndex = header.findIndex((h) =>
    h.toLowerCase().includes("product")
  );
  const skuIndex = header.findIndex((h) => h.toLowerCase().includes("sku"));
  const quantityIndex = header.findIndex((h) =>
    h.toLowerCase().includes("quantity")
  );
  const netAmountIndex = header.findIndex((h) =>
    h.toLowerCase().includes("net_amount")
  );
  const organizationIndex = header.findIndex((h) =>
    h.toLowerCase().includes("organization")
  );
  const repositoryIndex = header.findIndex((h) =>
    h.toLowerCase().includes("repository")
  );
  const costCenterIndex = header.findIndex(
    (h) =>
      h.toLowerCase().includes("cost_center") ||
      h.toLowerCase().includes("costcenter")
  );

  const categorizedData: CategorizedBillingData = {
    actionsMinutes: [],
    actionsStorage: [],
    packages: [],
    copilot: [],
    codespaces: [],
  };

  // Parse data rows
  lines.slice(1).forEach((line, index) => {
    try {
      const values = line.split(",").map((v) => v.replace(/"/g, "").trim());

      if (values.length < header.length) return; // Skip incomplete rows

      const date = values[dateIndex];
      const product = values[productIndex];
      const sku = values[skuIndex];
      const quantity = parseFloat(values[quantityIndex]) || 0;
      const netAmount = parseFloat(values[netAmountIndex]) || 0;
      const organization = values[organizationIndex] || "";
      const repository = values[repositoryIndex] || "";
      const costCenter = values[costCenterIndex] || "";

      if (!date || !product || !sku) return; // Skip rows with missing essential data

      const serviceData: ServiceData = {
        date,
        cost: netAmount,
        quantity,
        sku,
        organization,
        repository,
        costCenter,
      };

      // Categorize by product and sku
      switch (product.toLowerCase()) {
        case "actions":
          if (sku.includes("storage")) {
            categorizedData.actionsStorage.push(serviceData);
          } else if (
            sku.includes("linux") ||
            sku.includes("windows") ||
            sku.includes("macos") ||
            sku.includes("self_hosted")
          ) {
            categorizedData.actionsMinutes.push(serviceData);
          }
          break;
        case "packages":
          categorizedData.packages.push(serviceData);
          break;
        case "copilot":
          categorizedData.copilot.push(serviceData);
          break;
        case "codespaces":
          categorizedData.codespaces.push(serviceData);
          break;
      }
    } catch (error) {
      console.warn(`Error parsing row ${index + 2}:`, error);
    }
  });

  // Create summary data for backward compatibility
  const monthlyData = new Map<
    string,
    { actions: number; packages: number; storage: number }
  >();

  // Aggregate by month
  Object.values(categorizedData)
    .flat()
    .forEach((item) => {
      const monthKey = item.date.substring(0, 7); // YYYY-MM format
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { actions: 0, packages: 0, storage: 0 });
      }

      const monthData = monthlyData.get(monthKey)!;

      // Categorize costs for the summary
      if (categorizedData.actionsMinutes.includes(item)) {
        monthData.actions += item.cost;
      } else if (categorizedData.packages.includes(item)) {
        monthData.packages += item.cost;
      } else if (categorizedData.actionsStorage.includes(item)) {
        monthData.storage += item.cost;
      }
    });

  const data = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      ...values,
      total: values.actions + values.packages + values.storage,
    }));

  return { data, categorizedData };
}

export async function processFile(file: File): Promise<FileUploadResult> {
  try {
    const content = await file.text();
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension !== "csv") {
      return {
        success: false,
        error: "Invalid file format. Please upload a CSV file.",
      };
    }

    const { data, categorizedData } = parseCSV(content);

    if (data.length === 0) {
      return {
        success: false,
        error: "No billing data found in the CSV file.",
      };
    }

    // Determine date range from categorized data
    const allDates = Object.values(categorizedData)
      .flat()
      .map((item) => item.date)
      .sort();
    const startDate = allDates[0] || "";
    const endDate = allDates[allDates.length - 1] || "";

    // Get primary organization
    const organizations = Object.values(categorizedData)
      .flat()
      .map((item) => item.organization)
      .filter((org) => org)
      .reduce((acc, org) => {
        acc[org] = (acc[org] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const primaryOrganization =
      Object.keys(organizations).sort(
        (a, b) => organizations[b] - organizations[a]
      )[0] || "Unknown";

    return {
      success: true,
      data: {
        organization: primaryOrganization,
        period: {
          start: startDate,
          end: endDate,
        },
        data,
        categorizedData,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process CSV file.",
    };
  }
}
