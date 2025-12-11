import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", containerClassName = "", label, ...props }, ref) => {
    return (
      <label
        className={`flex items-center gap-3 cursor-pointer ${containerClassName}`}
      >
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            className="peer sr-only outline-none"
            {...props}
          />
          <div
            className={`
            w-5 h-5 rounded border border-slate-300 bg-white transition-all
            peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:[&_svg]:opacity-100
            ${className}
          `}
          >
            <Check
              size={14}
              className="text-white opacity-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity"
              strokeWidth={3}
            />
          </div>
        </div>
        {label && (
          <span className="text-sm font-medium text-slate-700 select-none">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
