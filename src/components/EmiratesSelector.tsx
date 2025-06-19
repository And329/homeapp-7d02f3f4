
import React from 'react';

interface EmiratesSelectorProps {
  value: string;
  onChange: (emirate: string) => void;
  required?: boolean;
  className?: string;
}

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al-Quwain',
  'Ras Al Khaimah',
  'Fujairah'
];

const EmiratesSelector: React.FC<EmiratesSelectorProps> = ({ 
  value, 
  onChange, 
  required = false, 
  className = "" 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Emirate {required && '*'}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        required={required}
      >
        <option value="">Select Emirate</option>
        {EMIRATES.map((emirate) => (
          <option key={emirate} value={emirate}>
            {emirate}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmiratesSelector;
