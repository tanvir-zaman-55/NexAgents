import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { StatCard } from "../ui/stat-card";

export interface Stat {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface StatsSectionProps {
  stats: Stat[];
  variant?: "default" | "bordered" | "gradient";
  columns?: 2 | 3 | 4;
}

export function StatsSection({
  stats,
  variant = "default",
  columns = 4,
}: StatsSectionProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const bgClasses = {
    default: "bg-white border-y border-gray-100",
    bordered: "bg-gray-50",
    gradient: "bg-gradient-to-br from-primary-50 via-white to-accent-50",
  };

  return (
    <section className={`py-16 ${bgClasses[variant]}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className={`grid grid-cols-2 gap-8 ${gridCols[columns]}`}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              {stat.icon && (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              )}
              <h3 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-2">
                {stat.value}
              </h3>
              <p className="text-secondary font-medium uppercase tracking-wide text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
