'use client';

import { useState } from 'react';
import { CalculationResults, CalculationInputs } from '@/lib/types';
import { trackShareAction } from '@/lib/analytics';
import { UI_CONSTANTS } from '@/lib/constants';

interface EmailResultsProps {
  results: CalculationResults;
  inputs: CalculationInputs;
  currency: string;
}

export default function EmailResults({ results, inputs, currency }: EmailResultsProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    // For now, we'll create a mailto link with the results
    // In production, this would be an API call
    const subject = 'Your Buy vs Rent Calculation Results';
    const buyBetter = results.buyScenarioNetWorth > results.rentScenarioNetWorth;
    const body = `
Buy vs Rent Calculator Results
==============================

Summary: ${buyBetter ? 'Buying' : 'Renting & Investing'} appears to be the better option

Final Net Worth Comparison:
- Buy Scenario: ${formatCurrency(results.buyScenarioNetWorth)}
- Rent & Invest Scenario: ${formatCurrency(results.rentScenarioNetWorth)}
- Difference: ${formatCurrency(Math.abs(results.difference))} ${buyBetter ? 'in favor of buying' : 'in favor of renting'}

Key Parameters:
- Property Price: ${formatCurrency(inputs.realEstate.propertyPrice)}
- Down Payment: ${inputs.realEstate.downPaymentPercent}%
- Mortgage Rate: ${inputs.realEstate.mortgageInterestRate}%
- Monthly Rent: ${formatCurrency(inputs.rental.monthlyRent)}
- Investment Return: ${inputs.stockMarket.expectedAnnualReturn}%
- Time Horizon: ${inputs.general.timeHorizon} years

${results.breakEvenYear ? `Break-even occurs at year ${results.breakEvenYear}` : 'No break-even point found within the analysis period'}

View your full calculation at: ${window.location.href}

---
Powered by buyvsrent.xyz
    `.trim();
    
    // Create mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    // Track the action
    trackShareAction('email');
    
    // Simulate sending for UX
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Email client opened with your results!' });
      setEmail('');
      setTimeout(() => setShowEmailForm(false), UI_CONSTANTS.NOTIFICATION_DURATION);
    }, 1000);
  };

  if (!showEmailForm) {
    return (
      <button
        onClick={() => setShowEmailForm(true)}
        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition duration-200"
      >
        📧 Email Results
      </button>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Send results to your email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        
        {message && (
          <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-2 px-4 font-medium rounded-md transition duration-200 ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Email'}
          </button>
          <button
            type="button"
            onClick={() => setShowEmailForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}