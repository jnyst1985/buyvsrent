'use client';

import { useState } from 'react';
import { CalculationInputs, CalculationResults } from '@/lib/types';
import { performCalculations } from '@/lib/calculator';
import InputForm from '@/components/InputForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { AdUnit } from '@/components/GoogleAdsense';
import NoSSR from '@/components/NoSSR';
import FormSkeleton from '@/components/FormSkeleton';

const defaultInputs: CalculationInputs = {
  general: {
    currency: 'USD',
    timeHorizon: 30,
    currentSavings: 100000,
  },
  realEstate: {
    propertyPrice: 500000,
    downPaymentPercent: 20,
    mortgageInterestRate: 6.5,
    mortgageTerm: 30,
    propertyTaxRate: 1.2,
    homeownersInsurance: 1500,
    hoaFees: 200,
    maintenanceCostPercent: 1,
    closingCostPercent: 2.5,
    sellingCostPercent: 6,
    propertyAppreciationRate: 3.5,
    propertyTaxIncreaseRate: 2,
  },
  stockMarket: {
    expectedAnnualReturn: 8,
    dividendYield: 1.5,
    expenseRatio: 0.1,
    monthlyInvestment: 0, // calculated
  },
  rental: {
    monthlyRent: 2500,
    annualRentIncrease: 3,
    rentersInsurance: 20,
    securityDeposit: 2,
  },
  tax: {
    incomeTaxBracket: 24,
    capitalGainsTaxRate: 15,
    mortgageInterestDeduction: true,
    propertyTaxDeduction: true,
    standardDeduction: 27700,
  },
};

export default function Home() {
  const [inputs, setInputs] = useState<CalculationInputs>(defaultInputs);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    try {
      const calculationResults = performCalculations(inputs);
      setResults(calculationResults);
      setShowResults(true);
    } catch (error) {
      console.error('Calculation error:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Buy vs Rent Calculator: Real Estate vs Stock Market Investment
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Make informed financial decisions by comparing buying a house vs renting and investing in the stock market
          </p>
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            Our free calculator analyzes mortgage costs, property appreciation, investment returns, taxes, and all associated costs to help you determine the best path to build long-term wealth.
          </p>
        </header>

        {/* Top Banner Ad */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <div className="mb-8 flex justify-center">
            <AdUnit 
              adSlot="YOUR_AD_SLOT_ID_1" 
              style={{ display: 'block', width: '728px', height: '90px' }}
              className="max-w-full"
            />
          </div>
        )}

        <div className={`grid grid-cols-1 ${showResults ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'} gap-8`}>
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <NoSSR fallback={<FormSkeleton />}>
              <InputForm 
                inputs={inputs} 
                setInputs={setInputs} 
                onCalculate={handleCalculate}
              />
            </NoSSR>
          </div>

          {showResults && results && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <ResultsDisplay 
                results={results} 
                currency={inputs.general.currency}
                sellingCostPercent={inputs.realEstate.sellingCostPercent}
              />
            </div>
          )}
        </div>

        {/* Middle Ad - Between Calculator and Content */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <div className="mt-12 mb-8 flex justify-center">
            <AdUnit 
              adSlot="YOUR_AD_SLOT_ID_2" 
              style={{ display: 'block', width: '300px', height: '250px' }}
            />
          </div>
        )}

        {/* SEO Content */}
        <section className="mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Buy vs Rent: Making the Right Financial Decision
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Deciding whether to buy a home or continue renting while investing in the stock market is one of the most important financial decisions you'll make. Our comprehensive calculator helps you analyze all factors including:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Mortgage payments, interest rates, and loan terms</li>
              <li>Property taxes, insurance, and maintenance costs</li>
              <li>Down payment requirements and closing costs</li>
              <li>Property appreciation and rental cost increases</li>
              <li>Investment returns and compound growth</li>
              <li>Tax benefits and capital gains implications</li>
            </ul>
            <p className="mb-4">
              The calculator provides a detailed year-by-year analysis showing how your net worth grows under each scenario, helping you make an informed decision based on your specific financial situation and market conditions.
            </p>
          </div>
        </section>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Buy vs Rent Calculator",
            "description": "Free calculator to compare buying a house vs renting and investing in stocks. Analyze mortgage costs, property appreciation, and investment returns.",
            "url": "https://buyvsrent.vercel.app", // Will update to custom domain later
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Mortgage calculation with amortization",
              "Property appreciation analysis",
              "Investment portfolio growth projection",
              "Tax benefit calculations",
              "Year-by-year comparison charts",
              "Multiple currency support"
            ]
          })
        }}
      />
    </main>
  );
}