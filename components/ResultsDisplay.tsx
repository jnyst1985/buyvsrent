'use client';

import { useState } from 'react';
import { CalculationResults, YearlyData, CalculationInputs } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { trackResultsViewed } from '@/lib/analytics';
import ComparisonChart from './ComparisonChart';
import ShareResults from './ShareResults';
import MonthlyPaymentSummary from './MonthlyPaymentSummary';

interface ResultsDisplayProps {
  results: CalculationResults;
  currency: string;
  sellingCostPercent: number;
  inputs: CalculationInputs;
  resultsStale?: boolean;
}

export default function ResultsDisplay({ results, currency, sellingCostPercent, inputs, resultsStale = false }: ResultsDisplayProps) {
  // Use utility functions for consistent formatting
  const formatCurrencyLocal = (value: number) => formatCurrency(value, currency);
  
  // State for toggling between milestone and full view
  const [showAllYears, setShowAllYears] = useState(false);

  const buyBetter = results.difference > 0;

  // Function to get milestone years based on time horizon
  const getMilestoneYears = (yearlyData: YearlyData[], breakEvenYear: number | null): YearlyData[] => {
    const totalYears = yearlyData.length;
    const milestoneYearNumbers = new Set<number>();
    
    // Always include year 1
    milestoneYearNumbers.add(1);
    
    // Add key milestone years based on total timeframe
    if (totalYears >= 5) milestoneYearNumbers.add(5);
    if (totalYears >= 10) milestoneYearNumbers.add(10);
    if (totalYears >= 15) milestoneYearNumbers.add(15);
    if (totalYears >= 20) milestoneYearNumbers.add(20);
    if (totalYears >= 25) milestoneYearNumbers.add(25);
    if (totalYears >= 30) milestoneYearNumbers.add(30);
    
    // Always include break-even year if it exists
    if (breakEvenYear && breakEvenYear <= totalYears) {
      milestoneYearNumbers.add(breakEvenYear);
    }
    
    // Always include the final year
    milestoneYearNumbers.add(totalYears);
    
    // Filter yearly data to only include milestone years
    return yearlyData.filter(year => milestoneYearNumbers.has(year.year));
  };

  // Determine which years to display
  const displayYears = showAllYears 
    ? results.yearlyData 
    : getMilestoneYears(results.yearlyData, results.breakEvenYear);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        {resultsStale && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            ⚠️ Outdated
          </div>
        )}
      </div>

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
      <div 
        className={`rounded-lg p-6 ${buyBetter ? 'bg-blue-100' : 'bg-green-100'}`}
        role="region"
        aria-label="Calculation results summary"
      >
        <h3 className="text-xl font-semibold mb-2">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${buyBetter ? 'bg-blue-500' : 'bg-green-500'}`} aria-hidden="true"></span>
          {buyBetter ? 'Winner: Buying is Better' : 'Winner: Renting & Investing is Better'}
          <span className="sr-only">
            {buyBetter ? 'The buying scenario performs better financially' : 'The renting and investing scenario performs better financially'}
          </span>
        </h3>
        <p className="text-3xl font-bold mb-2">
          <span className="sr-only">Advantage amount: </span>
          {formatCurrencyLocal(Math.abs(results.difference))}
        </p>
        <p className="text-lg">
          {buyBetter ? 'Buying' : 'Renting & Investing'} results in {formatPercent(Math.abs(results.differencePercent))} more wealth
          <span className="sr-only"> at the end of the {inputs.general.timeHorizon}-year period</span>
        </p>
        {results.breakEvenYear && (
          <p className="mt-2 text-sm">
            Break-even point: Year {results.breakEvenYear}
          </p>
        )}
      </div>

      {/* Monthly Payment Breakdown */}
      <MonthlyPaymentSummary 
        inputs={inputs} 
        currency={currency} 
      />

      {/* Share Results */}
      <div>
        <ShareResults 
          results={results} 
          inputs={inputs} 
          currency={currency} 
        />
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

      {/* Year by Year Data */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Year-by-Year Comparison</h3>
          <button
            onClick={() => {
              const newValue = !showAllYears;
              setShowAllYears(newValue);
              trackResultsViewed(newValue ? 'all_years' : 'milestone');
            }}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
          >
            {showAllYears ? 'Show Key Milestones' : 'Show All Years'}
          </button>
        </div>
        
        {!showAllYears && (
          <p className="text-sm text-gray-600 mb-3">
            Showing key milestone years
          </p>
        )}
        
        <div className="text-xs text-gray-500 mb-3">
          <span className="font-medium">Note:</span> Net Worth (Buy) includes selling costs ({sellingCostPercent}%) for accurate comparison.
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Worth (Buy)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Worth (Rent)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayYears.map((year) => {
                // Calculate true net worth for buying (home value - mortgage - selling costs)
                const sellingCosts = year.buyScenario.homeValue * (sellingCostPercent / 100);
                const buyNetWorth = year.buyScenario.homeValue - year.buyScenario.mortgageBalance - sellingCosts;
                const rentNetWorth = year.rentScenario.portfolioValue;
                const difference = buyNetWorth - rentNetWorth;
                
                return (
                  <tr key={year.year}>
                    <td className="px-2 py-2 text-sm font-medium text-center">{year.year}</td>
                    <td className="px-4 py-2 text-sm">{formatCurrencyLocal(buyNetWorth)}</td>
                    <td className="px-4 py-2 text-sm">{formatCurrencyLocal(rentNetWorth)}</td>
                    <td className={`px-4 py-2 text-sm font-medium ${difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrencyLocal(difference)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}