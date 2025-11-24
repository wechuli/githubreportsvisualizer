# GitHub Reports Visualizer

Visualize GitHub billing reports with interactive charts and filters. Upload your CSV billing data and explore usage across Actions minutes, storage, packages, and Copilot.

**Privacy first**: All data processing happens in your browser. Nothing is uploaded to any server.

## Features

- Filter by date range, organization, repository, and cost center
- Toggle between cost ($) and usage volume views
- Switch storage units between GB-hours and GB-months
- View breakdowns by repository and organization
- All processing happens client-side - your data stays private

## Running Locally

### Prerequisites

- Node.js 20 or higher

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/wechuli/githubreportsvisualizer.git
   cd githubreportsvisualizer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Upload your GitHub billing CSV file
2. Navigate between service tabs (Actions, Storage, Packages, Copilot)
3. Use filters to drill down by date, organization, or repository
4. Toggle between cost and usage views
5. For storage services, switch between GB-hours and GB-months

