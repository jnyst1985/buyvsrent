// Analytics utility for tracking user behavior
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

type EventCategory = 
  | 'calculation'
  | 'engagement'
  | 'form_interaction'
  | 'navigation'
  | 'error';

interface EventParams {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const trackEvent = ({ category, action, label, value, ...additionalParams }: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams,
    });
  }
};

// Specific event tracking functions
export const trackCalculation = (params: {
  buyNetWorth: number;
  rentNetWorth: number;
  timeHorizon: number;
  breakEvenYear: number | null;
  currency: string;
}) => {
  trackEvent({
    category: 'calculation',
    action: 'calculate_complete',
    label: params.breakEvenYear ? `break_even_${params.breakEvenYear}` : 'no_break_even',
    value: params.timeHorizon,
    buy_net_worth: Math.round(params.buyNetWorth),
    rent_net_worth: Math.round(params.rentNetWorth),
    currency: params.currency,
    buy_better: params.buyNetWorth > params.rentNetWorth,
  });
};

export const trackParameterChange = (fieldName: string, value: any) => {
  trackEvent({
    category: 'form_interaction',
    action: 'parameter_change',
    label: fieldName,
    value: typeof value === 'number' ? value : undefined,
  });
};

export const trackPresetUsed = (presetName: string) => {
  trackEvent({
    category: 'form_interaction',
    action: 'preset_used',
    label: presetName,
  });
};

export const trackResultsViewed = (viewType: 'milestone' | 'all_years') => {
  trackEvent({
    category: 'engagement',
    action: 'results_viewed',
    label: viewType,
  });
};

export const trackShareAction = (method: 'email' | 'link' | 'pdf' | 'twitter' | 'linkedin' | 'whatsapp') => {
  trackEvent({
    category: 'engagement',
    action: 'share_results',
    label: method,
  });
};

export const trackError = (errorType: string, errorMessage?: string) => {
  trackEvent({
    category: 'error',
    action: 'error_occurred',
    label: errorType,
    error_message: errorMessage,
  });
};