# GitHub Reports Visualizer

A powerful web application for visualizing and analyzing GitHub billing reports with interactive charts, advanced filtering, and comprehensive service breakdowns. **All data processing happens client-side in your browser** - your billing data never leaves your machine.

## 🎯 Overview

The GitHub Reports Visualizer transforms complex GitHub billing CSV data into intuitive, interactive visualizations. Built with Next.js 15 and TypeScript, it provides deep insights into GitHub Actions, Packages, Storage, Copilot, and Codespaces usage across organizations, repositories, and cost centers.

**🔒 Privacy First**: All CSV processing is done entirely in your browser. No data is uploaded to any server, ensuring your sensitive billing information remains completely private.

## ✨ Key Features

### 📊 Service-Based Analysis

- **Actions Minutes**: Track workflow execution time with repository-based breakdowns
- **Actions Storage**: Monitor artifact and cache storage usage
- **GitHub Packages**: Analyze package hosting costs and usage
- **GitHub Copilot**: Visualize user engagement and costs
- **Codespaces**: Monitor development environment usage

### 🔍 Advanced Filtering

- **Date Range**: Filter data by custom date ranges with min/max bounds
- **Organization**: Multi-organization support with breakdown views
- **Cost Center**: Analyze costs by business units
- **Repository**: Smart repository filtering - shows all repos by default, automatically filters by selected organization
- **Cost vs Quantity**: Toggle between cost analysis ($) and usage volume for Actions, Storage, and Packages

### 📈 Interactive Visualizations

- **Stacked Bar Charts**: Complete historical daily trends with repository/organization breakdowns (no artificial date limits)
- **Pie Charts**: Service distribution and repository analysis with Top 10 + Others grouping
- **Area Charts**: Time-series cost and usage trends across entire dataset
- **Summary Cards**: Key metrics and totals at a glance with formatted values

### 🎨 Smart Chart Modes

- **Repository-Specific Views**: Focused analysis when filtering by repository
- **Organization Breakdowns**: Stacked charts when multiple organizations are present
- **Top 10 + Others**: Automatic grouping of less significant items
- **Dynamic Breakdown**: Switch between cost and usage metrics instantly

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.2 with App Router and Turbopack
- **Language**: TypeScript 5
- **UI**: React 19 with Tailwind CSS
- **Charts**: Recharts 2.14.1
- **Icons**: Lucide React
- **Data Processing**: Client-side CSV parsing with flexible column detection
- **Styling**: Tailwind CSS with custom dark theme components
- **Deployment**: Static export for GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- A GitHub billing report CSV file

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/wechuli/githubreportsvisualizer.git
   cd githubreportsvisualizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 📁 CSV File Format

The application automatically detects and parses GitHub billing CSV files with flexible column name matching:

### Required Columns

- **Date**: Usage date (flexible: `date`, `usage_date`, `billing_date`)
- **Product**: GitHub service (flexible: `product`, `service`, `service_type`)
- **SKU**: Specific service SKU identifier
- **Quantity**: Usage amount (flexible: `quantity`, `usage_quantity`, `units`)

### Optional Columns (Enhance filtering and analysis)

- **Price/Cost**: Cost per unit (flexible: `price_per_unit`, `unit_price`, `cost`, `applied_cost_per_quantity`)
- **Repository**: Repository identifier (flexible: `repository`, `repo`, `repository_name`, `repository slug`)
- **Organization**: GitHub organization (flexible: `organization`, `org`, `owner`, `account`)
- **Cost Center**: Business unit (flexible: `cost_center`, `costcenter`, `cost_centre`, `cost_center_name`)
- **Multiplier**: Pricing multiplier (flexible: `multiplier`, `pricing_multiplier`)

The parser automatically detects column names in various formats, making it compatible with different GitHub billing export formats.

## 🎮 How to Use

1. **Upload Your Data**: Drag and drop or click to select your GitHub billing CSV file
2. **Watch Processing**: Real-time progress bar shows parsing status with row counts
3. **Explore Services**: Navigate between Actions Minutes, Actions Storage, Packages, Copilot, and Codespaces tabs
4. **Apply Filters**:
   - Adjust date range to focus on specific time periods
   - Select organization to filter by org (repository list updates automatically)
   - Choose repository to see repo-specific analysis
   - Filter by cost center for business unit insights
5. **Toggle Breakdown**: Switch between Cost ($) and Usage Volume views for Actions, Storage, and Packages
6. **Analyze Trends**: View complete historical data with no date limitations
7. **Export Insights**: All charts and data remain in your browser for analysis

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx          # Main application page
├── components/
│   ├── charts/           # Chart components
│   │   └── ServiceChart.tsx   # All visualization logic
│   └── ui/               # UI components
│       ├── DataFilters.tsx    # Smart filtering with org-repo dependency
│       ├── FileUpload.tsx     # Drag-drop upload with progress tracking
│       └── Tabs.tsx          # Service navigation tabs
├── lib/
│   ├── fileParser.ts     # CSV parsing and categorization
│   └── utils.ts          # Utility functions
├── types/
│   └── billing.ts        # TypeScript type definitions
└── public/

    └── favicon.svg       # Custom app favicon
```

## 🎨 Features in Detail

### Service Categorization

- Automatically categorizes GitHub services from CSV data
- Provides service-specific visualizations and metrics
- Handles various GitHub product types and SKUs

### Smart Filtering

- Real-time data filtering without page reloads
- Persistent filter state across service tabs
- Visual indicators for active filters

### Responsive Design

- Mobile-friendly interface
- Adaptive chart layouts
- Touch-friendly controls

### Data Processing & Performance

- **100% Client-Side**: All CSV processing happens in your browser
- **Non-Blocking UI**: Large files are processed without freezing the interface
- **Real-Time Progress**: Visual progress indicators with row counts and validation status
- **Efficient Aggregation**: Chunked processing for memory efficiency
- **No Server Upload**: All CSV processing is done in-browser
- **Automatic Detection**: Smart column mapping and date range detection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Compatibility

- Browser compatibility tested on Chrome, Firefox, and Safari
- Mobile responsiveness optimized for tablets and larger screens
- Very large CSV files (>100MB) may require additional processing time
