export interface BillingData {
  month: string;
  actions: number;
  packages: number;
  storage: number;
  total?: number;
}

export interface GitHubBillingReport {
  organization: string;
  period: {
    start: string;
    end: string;
  };
  data: BillingData[];
}

export interface FileUploadResult {
  success: boolean;
  data?: GitHubBillingReport;
  error?: string;
}
