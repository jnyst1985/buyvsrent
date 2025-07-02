'use client';

import React from 'react';

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; onRetry?: () => void }>;
}

class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultChartFallback;
      return <FallbackComponent error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error?: Error;
  onRetry?: () => void;
}

const DefaultChartFallback: React.FC<FallbackProps> = ({ error, onRetry }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
    <div className="mb-4">
      <svg 
        className="mx-auto h-12 w-12 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Unavailable</h3>
    <p className="text-sm text-gray-600 mb-4">
      We're having trouble displaying the chart. The data table below shows the same information.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        Try Again
      </button>
    )}
    {error && process.env.NODE_ENV === 'development' && (
      <details className="mt-4 text-left">
        <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
        <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
    )}
  </div>
);

export default ChartErrorBoundary;