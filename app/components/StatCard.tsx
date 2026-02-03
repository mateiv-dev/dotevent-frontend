import React from "react";
import { Card } from "./ui/Card";

function StatCard({
  icon,
  label,
  value,
  iconClassName = "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClassName?: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--muted-foreground)] truncate max-w-[120px]">
          {label}
        </p>
        <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      </div>
    </Card>
  );
}

export default StatCard;
