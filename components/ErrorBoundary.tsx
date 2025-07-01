'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '@/lib/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Track the error for analytics
    trackError('react_error_boundary', `${error.name}: ${error.message}`);
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI or default fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200 p-6 m-4">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-700 mb-4">
              We apologize for the inconvenience. A technical error occurred while processing your calculation.
            </p>
            <div className="space-y-2">
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <p className="text-sm text-red-600">
                If the problem persists, please refresh your browser or try again later.
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-red-800 font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for calculator operations
export function CalculatorErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-yellow-900">
                Calculation Error
              </h3>
              <p className="text-yellow-700 mt-1">
                There was an issue with the calculation. Please check your inputs and try again.
              </p>
              <button
                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-1 px-3 rounded"
                onClick={() => window.location.reload()}
              >
                Reset Calculator
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Error boundary for form inputs
export function InputErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2">⚠️</div>
            <p className="text-red-700 text-sm">
              Input form error. Please refresh the page.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}