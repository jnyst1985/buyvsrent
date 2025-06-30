# Buy or Invest Calculator

A comprehensive web calculator that helps users compare buying real estate versus renting and investing in the stock market. The tool provides detailed financial analysis considering all costs, tax implications, and long-term wealth accumulation.

## Features

- **Currency Agnostic**: Works with any currency (USD, EUR, GBP, etc.)
- **Comprehensive Calculations**: Includes all costs (mortgage, taxes, insurance, maintenance, HOA, etc.)
- **Tax Considerations**: Accounts for mortgage interest deduction, property tax deduction, and capital gains
- **Visual Comparisons**: Interactive charts showing net worth over time
- **Detailed Breakdowns**: Year-by-year analysis and cost summaries
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd buy-or-invest
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The app is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy with default settings

## Usage

1. Enter your financial parameters:
   - Property details (price, down payment, mortgage rate)
   - Investment assumptions (expected returns, dividend yield)
   - Rental costs and increases
   - Tax situation

2. Click "Calculate" to see:
   - Final net worth comparison
   - Break-even analysis
   - Detailed cost breakdowns
   - Year-by-year progression chart

3. Adjust parameters to explore different scenarios

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.