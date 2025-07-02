'use client';

import { CalculationInputs } from '@/lib/types';
import { formatCurrency } from '@/lib/formatting';
import { calculateMortgagePayment } from '@/lib/calculator';

interface MonthlyPaymentSummaryProps {
  inputs: CalculationInputs;
  currency: string;
}

export default function MonthlyPaymentSummary({ inputs, currency }: MonthlyPaymentSummaryProps) {
  const formatCurrencyLocal = (value: number) => formatCurrency(value, currency);
  
  // Calculate mortgage payment
  const downPayment = inputs.realEstate.propertyPrice * (inputs.realEstate.downPaymentPercent / 100);
  const loanAmount = inputs.realEstate.propertyPrice - downPayment;
  const monthlyMortgagePayment = calculateMortgagePayment(
    loanAmount,
    inputs.realEstate.mortgageInterestRate,
    inputs.realEstate.mortgageTerm
  );
  
  // Calculate monthly housing costs
  const monthlyPropertyTax = (inputs.realEstate.propertyPrice * inputs.realEstate.propertyTaxRate / 100) / 12;
  const monthlyInsurance = inputs.realEstate.homeownersInsurance / 12;
  const monthlyMaintenance = (inputs.realEstate.propertyPrice * inputs.realEstate.maintenanceCostPercent / 100) / 12;
  const totalMonthlyHousingCost = monthlyMortgagePayment + monthlyPropertyTax + 
    monthlyInsurance + inputs.realEstate.hoaFees + monthlyMaintenance;
  
  // Calculate monthly investment amount
  const monthlyInvestmentAmount = Math.max(0, totalMonthlyHousingCost - inputs.rental.monthlyRent);
  
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Payment Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Scenario */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Buy Scenario</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Mortgage Payment (P&I):</span>
              <span className="font-medium text-blue-900">{formatCurrencyLocal(monthlyMortgagePayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Property Tax:</span>
              <span className="font-medium text-blue-900">{formatCurrencyLocal(monthlyPropertyTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Insurance:</span>
              <span className="font-medium text-blue-900">{formatCurrencyLocal(monthlyInsurance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">HOA Fees:</span>
              <span className="font-medium text-blue-900">{formatCurrencyLocal(inputs.realEstate.hoaFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Maintenance:</span>
              <span className="font-medium text-blue-900">{formatCurrencyLocal(monthlyMaintenance)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
              <span className="text-blue-800">Total Monthly Cost:</span>
              <span className="text-blue-900">{formatCurrencyLocal(totalMonthlyHousingCost)}</span>
            </div>
          </div>
        </div>
        
        {/* Rent Scenario */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">Rent & Invest Scenario</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Monthly Rent:</span>
              <span className="font-medium text-green-900">{formatCurrencyLocal(inputs.rental.monthlyRent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Renter's Insurance:</span>
              <span className="font-medium text-green-900">{formatCurrencyLocal(inputs.rental.rentersInsurance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Stock Market Investment:</span>
              <span className="font-medium text-green-900">{formatCurrencyLocal(monthlyInvestmentAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
              <span className="text-green-800">Total Monthly Cost:</span>
              <span className="text-green-900">{formatCurrencyLocal(inputs.rental.monthlyRent + inputs.rental.rentersInsurance + monthlyInvestmentAmount)}</span>
            </div>
          </div>
          
          {monthlyInvestmentAmount === 0 && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
              ⚠️ No monthly investment: Rent costs more than total housing costs
            </div>
          )}
        </div>
      </div>
      
      {/* Investment Calculation Explanation */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Investment calculation:</span> {formatCurrencyLocal(totalMonthlyHousingCost)} (total housing) - {formatCurrencyLocal(inputs.rental.monthlyRent)} (rent) = {formatCurrencyLocal(monthlyInvestmentAmount)} invested monthly
        </p>
      </div>
    </div>
  );
}