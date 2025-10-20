import * as React from "react";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";

export type BillingPeriod = "monthly" | "quarterly" | "annual";

export interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  periods?: BillingPeriod[];
  labels?: Partial<Record<BillingPeriod, string>>;
  savingsBadge?: {
    period: BillingPeriod;
    text: string;
  };
  className?: string;
}

const defaultLabels: Record<BillingPeriod, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

export function BillingToggle({
  value,
  onChange,
  periods = ["monthly", "annual"],
  labels = {},
  savingsBadge,
  className,
}: BillingToggleProps) {
  const mergedLabels = { ...defaultLabels, ...labels };

  return (
    <div
      className={cn(
        "inline-flex bg-gray-100 rounded-full p-1.5 shadow-inner",
        className
      )}
    >
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            "relative px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300",
            value === period
              ? "bg-white text-charcoal-900 shadow-lg"
              : "text-secondary hover:text-charcoal-900"
          )}
        >
          {mergedLabels[period]}
          {savingsBadge && savingsBadge.period === period && (
            <Badge className="ml-2 bg-success text-white text-xs px-2 py-0.5">
              {savingsBadge.text}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
