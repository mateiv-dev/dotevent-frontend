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
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border border-slate-200 
            focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 
            outline-none transition-all resize-none font-medium text-slate-600 placeholder:font-normal
            ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
