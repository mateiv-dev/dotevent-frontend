import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      containerClassName = "",
      label,
      error,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border border-[var(--input)] bg-[var(--background)]
              focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--ring)] 
              outline-none transition-all font-medium text-[var(--foreground)] placeholder:font-normal placeholder:text-[var(--muted-foreground)]
              ${leftIcon ? "pl-11" : ""}
              ${rightIcon ? "pr-11" : ""}
              ${error ? "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-red-500/10" : ""}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-[var(--destructive)]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
