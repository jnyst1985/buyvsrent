'use client';

import { useState, useEffect } from 'react';
import { CalculationInputs } from '@/lib/types';
import { trackPresetUsed } from '@/lib/analytics';
import { presetConfigurations, detectActivePreset, getPresetInputs } from '@/lib/presetDetection';

interface PresetScenariosProps {
  onApplyPreset: (inputs: CalculationInputs) => void;
  currency: string;
  currentInputs: CalculationInputs;
}

export default function PresetScenarios({ onApplyPreset, currency, currentInputs }: PresetScenariosProps) {
  const [activePreset, setActivePreset] = useState<string>('custom');

  // Detect active preset whenever inputs change
  useEffect(() => {
    const detectedPreset = detectActivePreset(currentInputs);
    setActivePreset(detectedPreset);
  }, [currentInputs]);

  const handlePresetClick = (presetKey: string) => {
    if (presetKey === 'custom') {
      // Custom doesn't change inputs, just highlights
      setActivePreset('custom');
      return;
    }

    const presetInputs = getPresetInputs(presetKey, currency);
    if (presetInputs) {
      onApplyPreset(presetInputs);
      setActivePreset(presetKey);
      
      const preset = presetConfigurations[presetKey as keyof typeof presetConfigurations];
      trackPresetUsed(preset.name);
    }
  };

  const getPresetButtonClass = (presetKey: string) => {
    const isActive = activePreset === presetKey;
    const isCustom = presetKey === 'custom';
    
    let baseClass = "p-4 text-left border-2 rounded-lg transition-all duration-200 ";
    
    if (isActive) {
      if (isCustom) {
        // Custom preset active styling (orange/amber theme)
        baseClass += "border-amber-400 bg-amber-50 shadow-md ";
      } else {
        // Regular preset active styling (blue theme)
        baseClass += "border-blue-400 bg-blue-50 shadow-md ";
      }
    } else {
      // Inactive styling
      baseClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 ";
    }
    
    return baseClass;
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Start Scenarios</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(presetConfigurations).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => handlePresetClick(key)}
            className={getPresetButtonClass(key)}
            aria-pressed={activePreset === key}
            aria-describedby={`preset-${key}-description`}
          >
            <div className="font-medium text-gray-900 mb-1">
              {preset.name}
              {activePreset === key && (
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div id={`preset-${key}-description`} className="text-sm text-gray-600">
              {preset.description}
            </div>
            {activePreset === key && (
              <div className="mt-2">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  key === 'custom' ? 'bg-amber-400' : 'bg-blue-400'
                }`} aria-hidden="true"></span>
                <span className="sr-only">This preset is currently active</span>
                <span className="text-xs font-medium text-gray-700">Currently selected</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}