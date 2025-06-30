'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg bottom-full mb-2 left-0">
          <div className="absolute w-3 h-3 bg-white border-l border-b border-gray-200 transform rotate-45 -bottom-1.5 left-6"></div>
          {content}
        </div>
      )}
    </div>
  );
}

export function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}