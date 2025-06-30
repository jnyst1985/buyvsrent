'use client';

import { CalculationResults } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import ComparisonChart from './ComparisonChart';

interface ResultsDisplayProps {
  results: CalculationResults;
  currency: string;
}

export default function ResultsDisplay({ results, currency }: ResultsDisplayProps) {
  // Use utility functions for consistent formatting
  const formatCurrencyLocal = (value: number) => formatCurrency(value, currency);

  const buyBetter = results.difference > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Results</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Buy Scenario</h3>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrencyLocal(results.buyScenarioNetWorth)}
          </p>
          <p className="text-sm text-blue-700">Net Worth after selling</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-900 mb-2">Rent & Invest Scenario</h3>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrencyLocal(results.rentScenarioNetWorth)}
          </p>
          <p className="text-sm text-green-700">Portfolio value after taxes</p>
        </div>
      </div>

      {/* Winner Card */}
      <div className={`rounded-lg p-6 ${buyBetter ? 'bg-blue-100' : 'bg-green-100'}`}>
        <h3 className="text-xl font-semibold mb-2">
          {buyBetter ? '🏠 Buying is Better' : '📈 Renting & Investing is Better'}
        </h3>
        <p className="text-3xl font-bold mb-2">
          {formatCurrencyLocal(Math.abs(results.difference))}
        </p>
        <p className="text-lg">
          {buyBetter ? 'Buying' : 'Renting & Investing'} results in {formatPercent(Math.abs(results.differencePercent))} more wealth
        </p>
        {results.breakEvenYear && (
          <p className="mt-2 text-sm">
            Break-even point: Year {results.breakEvenYear}
          </p>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Buy Scenario Costs</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Interest Paid:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Property Tax:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.totalPropertyTax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Insurance:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.totalInsurance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Maintenance:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.totalMaintenance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total HOA Fees:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.totalHOA)}</span>
            </div>
            <div className="flex justify-between">
              <span>Closing Costs:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.closingCosts)}</span>
            </div>
            <div className="flex justify-between">
              <span>Selling Costs:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.buy.sellingCosts)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Costs:</span>
              <span>{formatCurrencyLocal(
                results.totalCosts.buy.totalInterest +
                results.totalCosts.buy.totalPropertyTax +
                results.totalCosts.buy.totalInsurance +
                results.totalCosts.buy.totalMaintenance +
                results.totalCosts.buy.totalHOA +
                results.totalCosts.buy.closingCosts +
                results.totalCosts.buy.sellingCosts
              )}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Rent Scenario Costs</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Rent Paid:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.rent.totalRent)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Renter's Insurance:</span>
              <span className="font-medium">{formatCurrencyLocal(results.totalCosts.rent.totalRentersInsurance)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Costs:</span>
              <span>{formatCurrencyLocal(
                results.totalCosts.rent.totalRent +
                results.totalCosts.rent.totalRentersInsurance
              )}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ComparisonChart yearlyData={results.yearlyData} currency={currency} />

      {/* Year by Year Data (First 5 years) */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Year-by-Year Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Home Equity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Portfolio Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.yearlyData.slice(0, 10).map((year) => (
                <tr key={year.year}>
                  <td className="px-4 py-2 text-sm">{year.year}</td>
                  <td className="px-4 py-2 text-sm">{formatCurrencyLocal(year.buyScenario.equity)}</td>
                  <td className="px-4 py-2 text-sm">{formatCurrencyLocal(year.rentScenario.portfolioValue)}</td>
                  <td className="px-4 py-2 text-sm font-medium">
                    {formatCurrencyLocal(year.buyScenario.equity - year.rentScenario.portfolioValue)}
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