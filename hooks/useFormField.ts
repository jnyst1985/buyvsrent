import { useMemo } from 'react';
import { CalculationInputs } from '@/lib/types';
import { ValidationError } from '@/lib/validation';

export interface FormFieldHelpers {
  fieldId: string;
  errorId: string;
  fieldClasses: string;
  error: string | null;
  isRequired: boolean;
  hasError: boolean;
}

interface UseFormFieldProps {
  category: keyof CalculationInputs;
  field: string;
  validationErrors: ValidationError[];
  showValidation: boolean;
}

export function useFormField({
  category,
  field,
  validationErrors,
  showValidation
}: UseFormFieldProps): FormFieldHelpers {
  
  const fieldId = `${category}-${field}`;
  const errorId = `${category}-${field}-error`;
  
  const error = useMemo(() => {
    if (!showValidation) return null;
    const validationError = validationErrors.find(e => e.category === category && e.field === field);
    return validationError ? validationError.message : null;
  }, [validationErrors, showValidation, category, field]);
  
  const hasError = error !== null;
  
  const fieldClasses = useMemo(() => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-red-500 bg-red-50`;
    }
    return `${baseClasses} border-gray-300 focus:ring-blue-500`;
  }, [hasError]);
  
  const isRequired = useMemo(() => {
    // Most fields are required for calculations
    // Could be made more specific based on business rules
    return true;
  }, []);
  
  return {
    fieldId,
    errorId,
    fieldClasses,
    error,
    isRequired,
    hasError
  };
}