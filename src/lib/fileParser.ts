import {
  BillingData,
  GitHubBillingReport,
  FileUploadResult,
} from "@/types/billing";

export function parseCSV(csvContent: string): BillingData[] {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const data: BillingData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index];

      // Handle different possible column names
      if (
        header.includes("month") ||
        header.includes("date") ||
        header.includes("period")
      ) {
        row.month = value;
      } else if (header.includes("action") || header.includes("workflow")) {
        row.actions = parseFloat(value) || 0;
      } else if (header.includes("package") || header.includes("registry")) {
        row.packages = parseFloat(value) || 0;
      } else if (header.includes("storage") || header.includes("lfs")) {
        row.storage = parseFloat(value) || 0;
      }
    });

    if (row.month) {
      data.push({
        month: row.month,
        actions: row.actions || 0,
        packages: row.packages || 0,
        storage: row.storage || 0,
        total: (row.actions || 0) + (row.packages || 0) + (row.storage || 0),
      });
    }
  }

  return data;
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

    const data = parseCSV(content);

    if (data.length === 0) {
      return {
        success: false,
        error: "No billing data found in the CSV file.",
      };
    }

    return {
      success: true,
      data: {
        organization: "Unknown", // This could be extracted from the file if available
        period: {
          start: data[0]?.month || "",
          end: data[data.length - 1]?.month || "",
        },
        data,
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
