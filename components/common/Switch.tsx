
import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  disabled = false,
  label,
  description
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      {(label || description) && (
        <div className="flex-1 pr-4">
          {label && <div className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{label}</div>}
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
