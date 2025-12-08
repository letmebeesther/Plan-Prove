import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && <label className="block text-body-s font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-xl border-gray-300 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:border-primary-500 focus:ring-primary-500 text-body-m py-2.5 ${icon ? 'pl-10' : 'pl-3'} pr-3 border bg-white`}
          {...props}
        />
      </div>
    </div>
  );
};