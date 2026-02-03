import React from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { className = "", containerClassName = "", label, error, ...props },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border border-[var(--input)] bg-[var(--background)]
            focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--ring)] 
            outline-none transition-all resize-none font-medium text-[var(--foreground)] placeholder:font-normal placeholder:text-[var(--muted-foreground)]
            ${error ? "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-red-500/10" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--destructive)]">{error}</p>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
