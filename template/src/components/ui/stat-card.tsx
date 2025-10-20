import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

export interface StatCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  animate?: boolean;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  trend,
  className,
  animate = true,
}: StatCardProps) {
  const content = (
    <div className="text-center">
      {Icon && (
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <div className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-2">
        {value}
      </div>
      <div className="text-sm text-secondary font-medium uppercase tracking-wide">
        {label}
      </div>
      {trend && (
        <div
          className={cn(
            "text-sm font-medium mt-2",
            trend.isPositive ? "text-success" : "text-danger"
          )}
        >
          {trend.isPositive ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </div>
  );

  if (!animate) {
    return <div className={className}>{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {content}
    </motion.div>
  );
}

export interface StatsGridProps {
  stats: Array<Omit<StatCardProps, "className" | "animate">>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({
  stats,
  columns = 4,
  className,
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid grid-cols-2 gap-8", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
