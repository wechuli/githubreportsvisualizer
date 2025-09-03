"use client";

import { useState } from "react";
import { Navigation } from "@/components/ui/Navigation";
import { FileUpload } from "@/components/ui/FileUpload";
import { BillingChart } from "@/components/charts/BillingChart";
import { GitHubBillingReport, BillingData } from "@/types/billing";

const sampleBillingData: BillingData[] = [
  { month: "Jan", actions: 120, packages: 80, storage: 40 },
  { month: "Feb", actions: 150, packages: 90, storage: 45 },
  { month: "Mar", actions: 180, packages: 110, storage: 50 },
  { month: "Apr", actions: 220, packages: 130, storage: 55 },
  { month: "May", actions: 190, packages: 120, storage: 48 },
  { month: "Jun", actions: 250, packages: 140, storage: 60 },
];

export default function Home() {
  const [billingData, setBillingData] =
    useState<BillingData[]>(sampleBillingData);
  const [hasUploadedData, setHasUploadedData] = useState(false);

  const handleDataLoaded = (report: GitHubBillingReport) => {
    setBillingData(report.data);
    setHasUploadedData(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />

      {/* Main Content */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Understand Your
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              GitHub Costs
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your GitHub billing report to visualize spending patterns and
            optimize costs.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Your data is processed locally and not stored on our servers.
            </span>
          </p>

          {/* File Upload */}
          <div className="mb-16">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>

          {/* Chart Visualization */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <BillingChart
                data={billingData}
                title={
                  hasUploadedData
                    ? "Your GitHub Billing Data"
                    : "Sample GitHub Billing Visualization"
                }
              />
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}
