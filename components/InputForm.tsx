'use client';

import { CalculationInputs } from '@/lib/types';
import Tooltip, { InfoIcon } from './Tooltip';

interface InputFormProps {
  inputs: CalculationInputs;
  setInputs: (inputs: CalculationInputs) => void;
  onCalculate: () => void;
}

export default function InputForm({ inputs, setInputs, onCalculate }: InputFormProps) {
  const handleInputChange = (
    category: keyof CalculationInputs,
    field: string,
    value: string | number | boolean
  ) => {
    setInputs({
      ...inputs,
      [category]: {
        ...inputs[category],
        [field]: value,
      },
    });
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <h2 className="text-2xl font-semibold text-gray-900">Input Parameters</h2>

      {/* General Parameters */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.general.currency}
              onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Horizon (years)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.general.timeHorizon}
              onChange={(e) => handleInputChange('general', 'timeHorizon', Number(e.target.value))}
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Savings
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.general.currentSavings}
              onChange={(e) => handleInputChange('general', 'currentSavings', Number(e.target.value))}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Real Estate Parameters */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Real Estate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Price
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.propertyPrice}
              onChange={(e) => handleInputChange('realEstate', 'propertyPrice', Number(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Down Payment (%)
              <Tooltip content="The percentage of the property price you'll pay upfront. Common amounts are 20% (avoids PMI), 10%, or 5% for first-time buyers. If unsure, use 20%.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.downPaymentPercent}
              onChange={(e) => handleInputChange('realEstate', 'downPaymentPercent', Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Interest Rate (%)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.mortgageInterestRate}
              onChange={(e) => handleInputChange('realEstate', 'mortgageInterestRate', Number(e.target.value))}
              min="0"
              max="20"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Term (years)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.mortgageTerm}
              onChange={(e) => handleInputChange('realEstate', 'mortgageTerm', Number(e.target.value))}
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Property Tax Rate (%)
              <Tooltip content="Annual property tax as a percentage of home value. Varies by location (0.5-2.5%). Check your local tax assessor's website. If unsure, use 1.2%.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.propertyTaxRate}
              onChange={(e) => handleInputChange('realEstate', 'propertyTaxRate', Number(e.target.value))}
              min="0"
              max="10"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Insurance
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.homeownersInsurance}
              onChange={(e) => handleInputChange('realEstate', 'homeownersInsurance', Number(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Monthly HOA Fees
              <Tooltip content="Homeowners Association fees for condos/communities. Covers maintenance, amenities. $0 for single-family homes without HOA. If unsure, use $0-200.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.hoaFees}
              onChange={(e) => handleInputChange('realEstate', 'hoaFees', Number(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Maintenance Cost (% of value)
              <Tooltip content="Annual maintenance/repair costs as % of home value. Includes repairs, appliances, landscaping. Newer homes: 0.5-1%, older homes: 1-2%. If unsure, use 1%.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.maintenanceCostPercent}
              onChange={(e) => handleInputChange('realEstate', 'maintenanceCostPercent', Number(e.target.value))}
              min="0"
              max="10"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Appreciation Rate (%)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.realEstate.propertyAppreciationRate}
              onChange={(e) => handleInputChange('realEstate', 'propertyAppreciationRate', Number(e.target.value))}
              min="-10"
              max="20"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Stock Market Parameters */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Stock Market</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Annual Return (%)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.stockMarket.expectedAnnualReturn}
              onChange={(e) => handleInputChange('stockMarket', 'expectedAnnualReturn', Number(e.target.value))}
              min="-20"
              max="30"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Dividend Yield (%)
              <Tooltip content="Annual dividends as % of investment. S&P 500 average: 1.5-2%. Growth stocks: 0-1%, dividend stocks: 3-5%. If unsure, use 1.5%.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.stockMarket.dividendYield}
              onChange={(e) => handleInputChange('stockMarket', 'dividendYield', Number(e.target.value))}
              min="0"
              max="10"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Expense Ratio (%)
              <Tooltip content="Annual fee charged by mutual funds/ETFs. Low-cost index funds: 0.03-0.20%, actively managed: 0.5-2%. If unsure, use 0.1% for index funds.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.stockMarket.expenseRatio}
              onChange={(e) => handleInputChange('stockMarket', 'expenseRatio', Number(e.target.value))}
              min="0"
              max="5"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Rental Parameters */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Rental</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.rental.monthlyRent}
              onChange={(e) => handleInputChange('rental', 'monthlyRent', Number(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Rent Increase (%)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.rental.annualRentIncrease}
              onChange={(e) => handleInputChange('rental', 'annualRentIncrease', Number(e.target.value))}
              min="0"
              max="20"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Renter's Insurance
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.rental.rentersInsurance}
              onChange={(e) => handleInputChange('rental', 'rentersInsurance', Number(e.target.value))}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Tax Parameters */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Tax</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Income Tax Bracket (%)
              <Tooltip content="Your federal tax rate. Common brackets: 12% ($11k-44k), 22% ($44k-95k), 24% ($95k-182k), 32% ($182k-231k). If unsure, use 22-24%.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.tax.incomeTaxBracket}
              onChange={(e) => handleInputChange('tax', 'incomeTaxBracket', Number(e.target.value))}
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Capital Gains Tax Rate (%)
              <Tooltip content="Tax on investment profits when sold. Long-term (>1 year): 0% (low income), 15% (most people), 20% (high income). If unsure, use 15%.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.tax.capitalGainsTaxRate}
              onChange={(e) => handleInputChange('tax', 'capitalGainsTaxRate', Number(e.target.value))}
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Standard Deduction
              <Tooltip content="Amount you can deduct without itemizing. 2024: $14,600 (single), $29,200 (married). Only itemize if mortgage interest + property tax exceed this. If unsure, use $14,600 or $29,200.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputs.tax.standardDeduction}
              onChange={(e) => handleInputChange('tax', 'standardDeduction', Number(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Deductions
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={inputs.tax.mortgageInterestDeduction}
                  onChange={(e) => handleInputChange('tax', 'mortgageInterestDeduction', e.target.checked)}
                />
                <span className="text-sm text-gray-700">Mortgage Interest Deduction</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={inputs.tax.propertyTaxDeduction}
                  onChange={(e) => handleInputChange('tax', 'propertyTaxDeduction', e.target.checked)}
                />
                <span className="text-sm text-gray-700">Property Tax Deduction</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          onCalculate();
        }}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
      >
        Calculate
      </button>
    </div>
  );
}