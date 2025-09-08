# GitHub Reports Visualizer

A powerful web application for visualizing and analyzing GitHub billing reports with interactive charts, advanced filtering, and comprehensive service breakdowns.

## 🎯 Overview

The GitHub Reports Visualizer transforms complex GitHub billing CSV data into intuitive, interactive visualizations. Built with Next.js 15 and TypeScript, it provides deep insights into GitHub Actions, Packages, Storage, Copilot, and Codespaces usage across organizations, repositories, and cost centers.

## ✨ Key Features

### 📊 Service-Based Analysis

- **Actions Minutes**: Track workflow execution time with repository-based breakdowns
- **Actions Storage**: Monitor artifact and cache storage usage
- **GitHub Packages**: Analyze package hosting costs and usage
- **GitHub Copilot**: Visualize user engagement and costs
- **Codespaces**: Monitor development environment usage

### 🔍 Advanced Filtering

- **Date Range**: Filter data by custom date ranges
- **Organization**: Multi-organization support with breakdown views
- **Cost Center**: Analyze costs by business units
- **Repository**: Deep-dive into specific repository usage
- **Cost vs Quantity**: Toggle between cost analysis ($) and usage volume

### 📈 Interactive Visualizations

- **Stacked Bar Charts**: Daily trends with repository/organization breakdowns
- **Pie Charts**: Service distribution and repository analysis
- **Area Charts**: Time-series cost and usage trends
- **Summary Cards**: Key metrics and totals at a glance

### 🎨 Smart Chart Modes

- **Repository-Specific Views**: Focused analysis when filtering by repository
- **Organization Breakdowns**: Stacked charts when multiple organizations are present
- **Top 10 + Others**: Automatic grouping of less significant items
- **Dynamic Breakdown**: Switch between cost and usage metrics instantly

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.2 with Turbopack
- **Language**: TypeScript 5
- **UI**: React 19.1.0 with Tailwind CSS 4
- **Charts**: Recharts 3.1.2
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom components

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

The application expects GitHub billing CSV files with the following columns:

- `Date`: Usage date (YYYY-MM-DD format)
- `Product`: GitHub service (Actions, Packages, etc.)
- `SKU`: Specific service SKU
- `Quantity`: Usage amount
- `Unit Type`: Usage unit (minutes, GB-hours, etc.)
- `Price Per Unit`: Cost per unit
- `Multiplier`: Pricing multiplier
- `Cost`: Total cost
- `Repository Slug`: Repository identifier
- `Organization`: GitHub organization
- `Cost Center`: Business unit identifier

## 🎮 How to Use

1. **Upload Your Data**: Click "Choose File" and select your GitHub billing CSV
2. **Explore Services**: Use the tabs to navigate between different GitHub services
3. **Apply Filters**: Use the filter panel to narrow down your analysis
4. **Toggle Breakdown**: Switch between Cost ($) and Usage Volume views
5. **Repository Deep-Dive**: Filter by repository for focused analysis
6. **Organization Analysis**: View organization breakdowns when multiple orgs are present

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main application page
├── components/
│   ├── charts/           # Chart components
│   │   └── ServiceChart.tsx
│   └── ui/               # UI components
│       ├── DataFilters.tsx
│       ├── FileUpload.tsx
│       ├── Navigation.tsx
│       └── Tabs.tsx
├── lib/
│   ├── fileParser.ts     # CSV parsing logic
│   └── utils.ts          # Utility functions
└── types/
    └── billing.ts        # TypeScript type definitions
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

### Data Processing

- Client-side CSV parsing for privacy
- Efficient data aggregation and grouping
- Automatic date range detection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Large CSV files (>50MB) may cause performance issues
- Browser compatibility tested on Chrome, Firefox, and Safari
- Mobile responsiveness optimized for tablets and larger screens

## 📧 Support

For issues, questions, or contributions, please:

- Open an issue on GitHub
- Check existing documentation
- Review the CSV format requirements

---

Built with ❤️ using Next.js and TypeScript
