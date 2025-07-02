'use client';

import { CalculationInputs } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/formatting';

interface InputSummaryProps {
  inputs: CalculationInputs;
  onEditInputs: () => void;
}

export default function InputSummary({ inputs, onEditInputs }: InputSummaryProps) {
  const formatCurrencyLocal = (value: number) => formatCurrency(value, inputs.general.currency);
  
  const downPaymentAmount = inputs.realEstate.propertyPrice * (inputs.realEstate.downPaymentPercent / 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Calculation Parameters</h3>
        <button
          onClick={onEditInputs}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit Inputs
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Property Details */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Property</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-blue-700">Price:</span>
              <span className="ml-1 font-medium text-blue-900">{formatCurrencyLocal(inputs.realEstate.propertyPrice)}</span>
            </div>
            <div>
              <span className="text-blue-700">Down Payment:</span>
              <span className="ml-1 font-medium text-blue-900">{inputs.realEstate.downPaymentPercent}% ({formatCurrencyLocal(downPaymentAmount)})</span>
            </div>
            <div>
              <span className="text-blue-700">Interest Rate:</span>
              <span className="ml-1 font-medium text-blue-900">{inputs.realEstate.mortgageInterestRate}%</span>
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">Rental</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-green-700">Monthly Rent:</span>
              <span className="ml-1 font-medium text-green-900">{formatCurrencyLocal(inputs.rental.monthlyRent)}</span>
            </div>
            <div>
              <span className="text-green-700">Annual Increase:</span>
              <span className="ml-1 font-medium text-green-900">{inputs.rental.annualRentIncrease}%</span>
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Investment</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-purple-700">Expected Return:</span>
              <span className="ml-1 font-medium text-purple-900">{inputs.stockMarket.expectedAnnualReturn}%</span>
            </div>
            <div>
              <span className="text-purple-700">Dividend Yield:</span>
              <span className="ml-1 font-medium text-purple-900">{inputs.stockMarket.dividendYield}%</span>
            </div>
          </div>
        </div>

        {/* Timeline & Savings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">General</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-700">Time Horizon:</span>
              <span className="ml-1 font-medium text-gray-900">{inputs.general.timeHorizon} years</span>
            </div>
            <div>
              <span className="text-gray-700">Current Savings:</span>
              <span className="ml-1 font-medium text-gray-900">{formatCurrencyLocal(inputs.general.currentSavings)}</span>
            </div>
            <div>
              <span className="text-gray-700">Income Tax:</span>
              <span className="ml-1 font-medium text-gray-900">{inputs.tax.incomeTaxBracket}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}