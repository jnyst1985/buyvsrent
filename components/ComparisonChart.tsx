'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { YearlyData } from '@/lib/types';
import { formatCurrency } from '@/lib/formatting';

interface ComparisonChartProps {
  yearlyData: YearlyData[];
  currency: string;
}

export default function ComparisonChart({ yearlyData, currency }: ComparisonChartProps) {
  const chartData = yearlyData.map((year) => ({
    year: year.year,
    'Home Equity': year.buyScenario.equity,
    'Portfolio Value': year.rentScenario.portfolioValue,
  }));

  // Use utility function for consistent formatting
  const formatCurrencyLocal = (value: number) => formatCurrency(value, currency);

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Net Worth Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(value) => formatCurrencyLocal(value)} />
          <Tooltip formatter={(value: number) => formatCurrencyLocal(value)} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Home Equity" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Portfolio Value" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}