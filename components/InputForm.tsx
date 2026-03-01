'use client';

import { useState, useEffect } from 'react';
import { CalculationInputs } from '@/lib/types';
import { validateInputs, sanitizeInputs, ValidationError } from '@/lib/validation';
import { useFormField } from '@/hooks/useFormField';
import Tooltip, { InfoIcon } from './Tooltip';
import PresetScenarios from './PresetScenarios';

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function AdvancedToggle({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2"
      aria-expanded={isOpen}
    >
      <ChevronIcon isOpen={isOpen} />
      {label}
    </button>
  );
}

function CollapsibleFieldset({
  legend,
  isOpen,
  onToggle,
  children,
}: {
  legend: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-4">
      <legend className="px-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors"
          aria-expanded={isOpen}
        >
          <ChevronIcon isOpen={isOpen} />
          {legend}
        </button>
      </legend>
      {isOpen && children}
    </fieldset>
  );
}

interface InputFormProps {
  inputs: CalculationInputs;
  setInputs: (inputs: CalculationInputs, isPresetChange?: boolean) => void;
  onCalculate: () => void;
  hasCalculated?: boolean;
  resultsStale?: boolean;
  isManualEditing?: boolean;
}

export default function InputForm({ inputs, setInputs, onCalculate, hasCalculated = false, resultsStale = false, isManualEditing = false }: InputFormProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [showAdvancedRealEstate, setShowAdvancedRealEstate] = useState(false);
  const [showAdvancedTax, setShowAdvancedTax] = useState(false);
  const [sectionStockMarket, setSectionStockMarket] = useState(false);
  const [sectionRental, setSectionRental] = useState(false);
  const [sectionTax, setSectionTax] = useState(false);

  // Validate inputs whenever they change
  useEffect(() => {
    const sanitizedInputs = sanitizeInputs(inputs);
    const validation = validateInputs(sanitizedInputs);
    setValidationErrors(validation.errors);
  }, [inputs]);

  const handleInputChange = (
    category: keyof CalculationInputs,
    field: string,
    value: string | number | boolean
  ) => {
    // Sanitize the input value
    let sanitizedValue = value;
    if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) {
      sanitizedValue = Number(value);
    }

    const newInputs = {
      ...inputs,
      [category]: {
        ...inputs[category],
        [field]: sanitizedValue,
      },
    };

    // Auto-update mortgage term when time horizon changes
    if (category === 'general' && field === 'timeHorizon' && typeof sanitizedValue === 'number') {
      newInputs.realEstate.mortgageTerm = sanitizedValue;
    }

    setInputs(newInputs);
    
    // Show validation after first interaction
    if (!showValidation) {
      setShowValidation(true);
    }
  };

  const handleCalculate = () => {
    setShowValidation(true);
    
    if (validationErrors.length === 0) {
      onCalculate();
    }
  };

  // Helper function to create form field utilities
  const createFormField = (category: keyof CalculationInputs, field: string) => {
    return useFormField({
      category,
      field,
      validationErrors,
      showValidation
    });
  };

  // Legacy helper functions for existing code
  const getFieldId = (category: keyof CalculationInputs, field: string) => `${category}-${field}`;
  const getErrorId = (category: keyof CalculationInputs, field: string) => `${category}-${field}-error`;
  const getFieldError = (category: keyof CalculationInputs, field: string) => {
    if (!showValidation) return null;
    const validationError = validationErrors.find(e => e.category === category && e.field === field);
    return validationError ? validationError.message : null;
  };
  const getFieldClasses = (category: keyof CalculationInputs, field: string) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
    const hasError = getFieldError(category, field) !== null;
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-red-500 bg-red-50`;
    }
    return `${baseClasses} border-gray-300 focus:ring-blue-500`;
  };
  const isFieldRequired = (category: keyof CalculationInputs, field: string) => {
    // Most fields are required for calculations
    return true;
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

  return (
    <form 
      role="form" 
      aria-label="Buy vs Rent Calculator Input Form"
      className="space-y-6" 
      suppressHydrationWarning
      onSubmit={(e) => {
        e.preventDefault();
        handleCalculate();
      }}
    >
      <h2 className="text-2xl font-semibold text-gray-900">Input Parameters</h2>

      {/* Preset Scenarios */}
      <PresetScenarios 
        onApplyPreset={setInputs} 
        currency={inputs.general.currency}
        currentInputs={inputs}
        isManualEditing={isManualEditing}
      />

      {/* General Parameters */}
      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">General Parameters</legend>
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
            {(() => {
              const field = createFormField('general', 'timeHorizon');
              return (
                <>
                  <label 
                    htmlFor={field.fieldId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Time Horizon (years)
                  </label>
                  <input
                    id={field.fieldId}
                    type="number"
                    className={field.fieldClasses}
                    value={inputs.general.timeHorizon}
                    onChange={(e) => handleInputChange('general', 'timeHorizon', e.target.value)}
                    min="1"
                    max="50"
                    aria-required={field.isRequired}
                    aria-invalid={field.hasError}
                    aria-describedby={field.hasError ? field.errorId : undefined}
                  />
                  {field.error && (
                    <p 
                      id={field.errorId}
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                      aria-live="polite"
                    >
                      {field.error}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
          <div>
            <label 
              htmlFor={getFieldId('general', 'currentSavings')}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Savings
            </label>
            <input
              id={getFieldId('general', 'currentSavings')}
              type="number"
              className={getFieldClasses('general', 'currentSavings')}
              value={inputs.general.currentSavings}
              onChange={(e) => handleInputChange('general', 'currentSavings', e.target.value)}
              min="0"
              aria-required={isFieldRequired('general', 'currentSavings')}
              aria-invalid={getFieldError('general', 'currentSavings') !== null}
              aria-describedby={getFieldError('general', 'currentSavings') ? getErrorId('general', 'currentSavings') : undefined}
            />
            {getFieldError('general', 'currentSavings') && (
              <p 
                id={getErrorId('general', 'currentSavings')}
                className="mt-1 text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {getFieldError('general', 'currentSavings')}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Real Estate Parameters */}
      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">Real Estate Parameters</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor={getFieldId('realEstate', 'propertyPrice')}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Property Price
            </label>
            <input
              id={getFieldId('realEstate', 'propertyPrice')}
              type="number"
              className={getFieldClasses('realEstate', 'propertyPrice')}
              value={inputs.realEstate.propertyPrice}
              onChange={(e) => handleInputChange('realEstate', 'propertyPrice', e.target.value)}
              min="0"
              aria-required={isFieldRequired('realEstate', 'propertyPrice')}
              aria-invalid={getFieldError('realEstate', 'propertyPrice') !== null}
              aria-describedby={getFieldError('realEstate', 'propertyPrice') ? getErrorId('realEstate', 'propertyPrice') : undefined}
            />
            {getFieldError('realEstate', 'propertyPrice') && (
              <p 
                id={getErrorId('realEstate', 'propertyPrice')}
                className="mt-1 text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {getFieldError('realEstate', 'propertyPrice')}
              </p>
            )}
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

          <AdvancedToggle
            label="Advanced Settings"
            isOpen={showAdvancedRealEstate}
            onToggle={() => setShowAdvancedRealEstate(!showAdvancedRealEstate)}
          />
          {showAdvancedRealEstate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  PMI Rate (%)
                  <Tooltip content="Private Mortgage Insurance rate, charged when down payment is less than 20%. Typically 0.5-1.5% of the loan amount annually. Auto-cancels when equity reaches 20%.">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputs.realEstate.pmiRate}
                  onChange={(e) => handleInputChange('realEstate', 'pmiRate', Number(e.target.value))}
                  min="0"
                  max="3"
                  step="0.1"
                />
                {inputs.realEstate.downPaymentPercent >= 20 && (
                  <p className="mt-1 text-xs text-gray-500">PMI not applicable (down payment &ge; 20%)</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  General Inflation Rate (%)
                  <Tooltip content="Annual inflation rate applied to insurance, HOA fees, and renter's insurance. Typical range: 2-4%. If unsure, use 3%.">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputs.realEstate.generalInflationRate}
                  onChange={(e) => handleInputChange('realEstate', 'generalInflationRate', Number(e.target.value))}
                  min="0"
                  max="15"
                  step="0.1"
                />
              </div>
            </div>
          )}
        </div>
      </fieldset>

      {/* Stock Market Parameters */}
      <CollapsibleFieldset
        legend="Stock Market Parameters"
        isOpen={sectionStockMarket}
        onToggle={() => setSectionStockMarket(!sectionStockMarket)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
      </CollapsibleFieldset>

      {/* Rental Parameters */}
      <CollapsibleFieldset
        legend="Rental Parameters"
        isOpen={sectionRental}
        onToggle={() => setSectionRental(!sectionRental)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
      </CollapsibleFieldset>

      {/* Tax Parameters */}
      <CollapsibleFieldset
        legend="Tax Parameters"
        isOpen={sectionTax}
        onToggle={() => setSectionTax(!sectionTax)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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

          <AdvancedToggle
            label="Advanced Settings"
            isOpen={showAdvancedTax}
            onToggle={() => setShowAdvancedTax(!showAdvancedTax)}
          />
          {showAdvancedTax && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  SALT Deduction Cap
                  <Tooltip content="State and Local Tax deduction cap. Federal law limits property tax deductions to this amount ($10,000 for most filers). If unsure, use $10,000.">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputs.tax.saltCap}
                  onChange={(e) => handleInputChange('tax', 'saltCap', Number(e.target.value))}
                  min="0"
                  max="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Filing Status
                  <Tooltip content="Affects home sale capital gains exclusion. Single filers exclude first $250,000 of gains; married filing jointly excludes $500,000 (Section 121).">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputs.tax.filingStatus}
                  onChange={(e) => handleInputChange('tax', 'filingStatus', e.target.value)}
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </CollapsibleFieldset>

      {/* Inline Calculate button */}
      <div className="space-y-2">
        {resultsStale && hasCalculated && (
          <div className="text-sm text-amber-600 text-center bg-amber-50 px-3 py-2 rounded-md">
            ⚠️ Parameters changed - results may be outdated
          </div>
        )}
        {showValidation && validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              {validationErrors.slice(0, 5).map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
              {validationErrors.length > 5 && (
                <li className="text-red-600">...and {validationErrors.length - 5} more errors</li>
              )}
            </ul>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          disabled={showValidation && validationErrors.length > 0}
          className={`hidden md:block w-full py-3 px-4 font-medium rounded-md transition duration-200 ${
            showValidation && validationErrors.length > 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : resultsStale && hasCalculated
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {showValidation && validationErrors.length > 0
            ? `Fix ${validationErrors.length} error${validationErrors.length === 1 ? '' : 's'} to calculate`
            : resultsStale && hasCalculated
            ? 'Recalculate'
            : 'Calculate'}
        </button>
      </div>

      {/* Sticky mobile Calculate button */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          disabled={showValidation && validationErrors.length > 0}
          className={`w-full py-3 px-4 font-medium rounded-md transition duration-200 ${
            showValidation && validationErrors.length > 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : resultsStale && hasCalculated
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {showValidation && validationErrors.length > 0
            ? `Fix ${validationErrors.length} error${validationErrors.length === 1 ? '' : 's'}`
            : resultsStale && hasCalculated
            ? 'Recalculate'
            : 'Calculate'}
        </button>
      </div>
    </form>
  );
}