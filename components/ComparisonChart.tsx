'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { YearlyData } from '@/lib/types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/formatting';
import { UI_CONSTANTS } from '@/lib/constants';
import ChartErrorBoundary from './ChartErrorBoundary';

interface ComparisonChartProps {
  yearlyData: YearlyData[];
  currency: string;
}

export default function ComparisonChart({ yearlyData, currency }: ComparisonChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen size for responsive chart
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < UI_CONSTANTS.MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const chartData = yearlyData.map((year) => ({
    year: year.year,
    'Home Equity': year.buyScenario.equity,
    'Portfolio Value': year.rentScenario.portfolioValue,
  }));

  // Use utility functions for consistent formatting
  const formatCurrencyLocal = (value: number) => formatCurrency(value, currency);
  const formatCurrencyCompactLocal = (value: number) => formatCurrencyCompact(value, currency);

  // Calculate summary for screen readers
  const finalYear = yearlyData[yearlyData.length - 1];
  const homeEquityFinal = finalYear?.buyScenario.equity || 0;
  const portfolioFinal = finalYear?.rentScenario.portfolioValue || 0;
  const winner = homeEquityFinal > portfolioFinal ? 'Home Equity' : 'Portfolio Value';
  const difference = Math.abs(homeEquityFinal - portfolioFinal);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-medium text-gray-900">Net Worth Over Time</h3>
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={showTable}
          aria-controls="chart-data-table"
        >
          {showTable ? 'Hide Data Table' : 'Show Data Table'}
        </button>
      </div>
      
      {/* Chart subtitle */}
      <p className="text-sm text-gray-600 mb-3">
        Comparison of home equity vs investment portfolio value by year
      </p>
      
      {/* Chart with accessibility attributes */}
      <div 
        role="img" 
        aria-label={`Line chart showing net worth over ${yearlyData.length} years. ${winner} performs better, ending at ${formatCurrencyLocal(winner === 'Home Equity' ? homeEquityFinal : portfolioFinal)} compared to ${formatCurrencyLocal(winner === 'Home Equity' ? portfolioFinal : homeEquityFinal)}, a difference of ${formatCurrencyLocal(difference)}.`}
        className="mb-4"
      >
        <ChartErrorBoundary>
          <ResponsiveContainer width="100%" height={isMobile ? UI_CONSTANTS.CHART_HEIGHTS.MOBILE : UI_CONSTANTS.CHART_HEIGHTS.DESKTOP}>
          <LineChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: 10, bottom: isMobile ? 50 : 10 }}
            aria-hidden="true"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year"
              tick={{ fontSize: isMobile ? 12 : 14 }}
              interval={0}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 40}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrencyCompactLocal(value)}
              tick={{ fontSize: isMobile ? 12 : 14 }}
              tickCount={isMobile ? 5 : 7}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrencyLocal(value)}
              labelStyle={{ fontSize: isMobile ? '12px' : '14px' }}
              contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: isMobile ? '12px' : '14px' }}
            />
            <Line 
              type="monotone" 
              dataKey="Home Equity" 
              stroke={UI_CONSTANTS.CHART_COLORS.BUY} 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Home Equity (Buy Scenario)"
            />
            <Line 
              type="monotone" 
              dataKey="Portfolio Value" 
              stroke={UI_CONSTANTS.CHART_COLORS.RENT} 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Portfolio Value (Rent & Invest)"
            />
          </LineChart>
          </ResponsiveContainer>
        </ChartErrorBoundary>
      </div>

      {/* Accessible data table */}
      {showTable && (
        <div 
          id="chart-data-table"
          className="overflow-x-auto"
          role="region"
          aria-label="Chart data in table format"
        >
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <caption className="sr-only">
              Net worth comparison over {yearlyData.length} years showing home equity vs portfolio value
            </caption>
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b"
                >
                  Year
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b"
                >
                  Home Equity
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b"
                >
                  Portfolio Value
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-2 text-right text-sm font-medium text-gray-900 border-b"
                >
                  Difference
                </th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((year, index) => {
                const homeEquity = year.buyScenario.equity;
                const portfolioValue = year.rentScenario.portfolioValue;
                const difference = homeEquity - portfolioValue;
                
                return (
                  <tr key={year.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">
                      {year.year}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right border-b">
                      {formatCurrencyLocal(homeEquity)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right border-b">
                      {formatCurrencyLocal(portfolioValue)}
                    </td>
                    <td className={`px-4 py-2 text-sm text-right border-b ${difference >= 0 ? 'text-blue-600' : 'text-green-600'}`}>
                      {difference >= 0 ? '+' : ''}{formatCurrencyLocal(difference)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite">
        Chart summary: Over {yearlyData.length} years, {winner.toLowerCase()} performs better with a final value of {formatCurrencyLocal(winner === 'Home Equity' ? homeEquityFinal : portfolioFinal)}, compared to {formatCurrencyLocal(winner === 'Home Equity' ? portfolioFinal : homeEquityFinal)} for the alternative, representing a difference of {formatCurrencyLocal(difference)}.
      </div>
    </div>
  );
}