'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalculationInputs, CalculationResults } from '@/lib/types';
import { performCalculations } from '@/lib/calculator';
import { trackCalculation } from '@/lib/analytics';
import { decodeUrlToInputs } from '@/lib/urlSharing';
import { DEFAULT_INPUTS, TIMING, APP_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatting';
import InputForm from '@/components/InputForm';
import InputSummary from '@/components/InputSummary';
import ResultsDisplay from '@/components/ResultsDisplay';
import { AdUnit } from '@/components/GoogleAdsense';
import NoSSR from '@/components/NoSSR';
import FormSkeleton from '@/components/FormSkeleton';
import StructuredData from '@/components/StructuredData';
import ErrorBoundary, { CalculatorErrorBoundary, InputErrorBoundary } from '@/components/ErrorBoundary';
import SkipLink from '@/components/SkipLink';

// Using shared constants for default values
const defaultInputs = DEFAULT_INPUTS;

export default function Home() {
  const [inputs, setInputs] = useState<CalculationInputs>(defaultInputs);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [resultsStale, setResultsStale] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isManualEditing, setIsManualEditing] = useState(false);

  // Check for URL parameters on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      
      // If there are URL parameters, decode them and set inputs
      if (searchParams.toString()) {
        const decodedInputs = decodeUrlToInputs(searchParams, defaultInputs);
        setInputs(decodedInputs);
        
        // Auto-calculate if we have shared parameters
        setTimeout(() => {
          const calculationResults = performCalculations(decodedInputs);
          setResults(calculationResults);
          setHasCalculated(true);
          setResultsStale(false);
          setIsInputCollapsed(true);
          
          // Track that someone viewed a shared calculation
          trackCalculation({
            buyNetWorth: calculationResults.buyScenarioNetWorth,
            rentNetWorth: calculationResults.rentScenarioNetWorth,
            timeHorizon: decodedInputs.general.timeHorizon,
            breakEvenYear: calculationResults.breakEvenYear,
            currency: decodedInputs.general.currency,
          });
        }, TIMING.SHARED_CALC_DELAY); // Small delay to ensure form is rendered
      }
    }
  }, []);

  // Optimized memoization - only recalculate when specific input values change
  const memoizedCalculation = useMemo(() => {
    if (!hasCalculated) return null;
    
    try {
      return performCalculations(inputs);
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [
    hasCalculated,
    // General
    inputs.general.timeHorizon,
    inputs.general.currentSavings,
    inputs.general.currency,
    // Real Estate
    inputs.realEstate.propertyPrice,
    inputs.realEstate.downPaymentPercent,
    inputs.realEstate.mortgageInterestRate,
    inputs.realEstate.mortgageTerm,
    inputs.realEstate.propertyTaxRate,
    inputs.realEstate.homeownersInsurance,
    inputs.realEstate.hoaFees,
    inputs.realEstate.maintenanceCostPercent,
    inputs.realEstate.closingCostPercent,
    inputs.realEstate.sellingCostPercent,
    inputs.realEstate.propertyAppreciationRate,
    inputs.realEstate.propertyTaxIncreaseRate,
    // Stock Market
    inputs.stockMarket.expectedAnnualReturn,
    inputs.stockMarket.dividendYield,
    inputs.stockMarket.expenseRatio,
    // Rental
    inputs.rental.monthlyRent,
    inputs.rental.annualRentIncrease,
    inputs.rental.rentersInsurance,
    inputs.rental.securityDeposit,
    // Tax
    inputs.tax.incomeTaxBracket,
    inputs.tax.capitalGainsTaxRate,
    inputs.tax.mortgageInterestDeduction,
    inputs.tax.propertyTaxDeduction,
    inputs.tax.standardDeduction
  ]);

  // Handle input changes and mark results as stale if calculation was performed
  const handleInputChange = useCallback((newInputs: CalculationInputs, isPresetChange = false) => {
    setInputs(newInputs);
    if (hasCalculated) {
      setResultsStale(true);
    }
    
    // Set manual editing mode for manual changes (not preset changes)
    if (!isPresetChange) {
      setIsManualEditing(true);
    }
  }, [hasCalculated]);

  const handleCalculate = useCallback(() => {
    try {
      const calculationResults = performCalculations(inputs);
      setResults(calculationResults);
      setHasCalculated(true);
      setResultsStale(false);
      setIsInputCollapsed(true);
      setIsManualEditing(false);
      
      // Track calculation event
      trackCalculation({
        buyNetWorth: calculationResults.buyScenarioNetWorth,
        rentNetWorth: calculationResults.rentScenarioNetWorth,
        timeHorizon: inputs.general.timeHorizon,
        breakEvenYear: calculationResults.breakEvenYear,
        currency: inputs.general.currency,
      });

      // Smooth scroll to results after state update
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, TIMING.SCROLL_DELAY);
    } catch (error) {
      console.error('Calculation error:', error);
      // Optionally show an error message to the user
    }
  }, [inputs]);

  const handleEditInputs = useCallback(() => {
    setIsInputCollapsed(false);
    setIsManualEditing(true);
    // Smooth scroll to inputs
    setTimeout(() => {
      const inputsElement = document.getElementById('inputs-section');
      if (inputsElement) {
        inputsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, TIMING.SCROLL_DELAY);
  }, []);

  return (
    <>
      <SkipLink />
      <main id="main-content" className="min-h-screen bg-gray-50" role="main">
        <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8" role="banner">
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

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Input Section */}
          <div id="inputs-section" className="transition-all duration-300 ease-in-out">
            {isInputCollapsed && results ? (
              <InputSummary 
                inputs={inputs}
                onEditInputs={handleEditInputs}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transition-all duration-300 ease-in-out">
                <InputErrorBoundary>
                  <NoSSR fallback={<FormSkeleton />}>
                    <InputForm 
                      inputs={inputs} 
                      setInputs={handleInputChange} 
                      onCalculate={handleCalculate}
                      hasCalculated={hasCalculated}
                      resultsStale={resultsStale}
                      isManualEditing={isManualEditing}
                    />
                  </NoSSR>
                </InputErrorBoundary>
              </div>
            )}
          </div>

          {/* Results Section */}
          {results && (
            <div id="results-section" className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-4">
              <CalculatorErrorBoundary>
                <ResultsDisplay 
                  results={results} 
                  currency={inputs.general.currency}
                  sellingCostPercent={inputs.realEstate.sellingCostPercent}
                  inputs={inputs}
                  resultsStale={resultsStale}
                />
              </CalculatorErrorBoundary>
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

      {/* Live region for dynamic updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {results && (
          `Calculation completed. ${results.buyScenarioNetWorth > results.rentScenarioNetWorth ? 'Buying' : 'Renting and investing'} is better by ${formatCurrency(Math.abs(results.difference), inputs.general.currency)}.`
        )}
      </div>

      {/* Structured Data */}
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": APP_CONFIG.NAME,
        "description": APP_CONFIG.DESCRIPTION,
        "url": APP_CONFIG.URL,
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
      }} />
      </main>
    </>
  );
}