import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className = '',
    containerClassName = '',
    label,
    error,
    leftIcon,
    children,
    ...props
  }, ref) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border border-slate-200 
              focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 
              outline-none transition-all bg-white appearance-none cursor-pointer font-medium text-slate-600
              ${leftIcon ? 'pl-11' : ''}
              pr-10
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";