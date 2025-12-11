import React from "react";
import { Card } from "./ui/Card";

function StatCard({
  icon,
  label,
  value,
  color = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 truncate max-w-[120px]">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}

export default StatCard;
