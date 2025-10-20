import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

export interface MenuCategory {
  icon?: LucideIcon;
  title: string;
  items: MenuItem[];
}

export interface MenuSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  categories: MenuCategory[];
  columns?: 1 | 2;
  variant?: "default" | "elegant" | "minimal";
  background?: "white" | "gray" | "dark";
}

export function MenuSection({
  badge,
  title,
  subtitle,
  categories,
  columns = 2,
  variant = "default",
  background = "white",
}: MenuSectionProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
  };

  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    dark: "bg-charcoal-900",
  };

  const textColorClass =
    background === "dark" ? "text-white" : "text-charcoal-900";
  const subtextColorClass =
    background === "dark" ? "text-white/70" : "text-secondary";

  if (variant === "elegant") {
    return (
      <section className={`py-20 lg:py-32 ${bgClasses[background]}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {badge && <Badge className="mb-4">{badge}</Badge>}
            <h2
              className={`text-4xl lg:text-5xl font-bold ${textColorClass} mb-4`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={`text-lg ${subtextColorClass} max-w-2xl mx-auto`}>
                {subtitle}
              </p>
            )}
          </motion.div>

          <div className={`grid ${gridCols[columns]} gap-8`}>
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    {category.icon && (
                      <category.icon className="w-8 h-8 text-primary" />
                    )}
                    <h3
                      className={`text-3xl font-bold ${textColorClass}`}
                    >
                      {category.title}
                    </h3>
                  </div>
                  <div className="h-px bg-gradient-to-r from-primary via-accent to-transparent mb-6" />
                </div>

                <div className="space-y-6">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200/50 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-lg font-semibold ${textColorClass}`}>
                          {item.name}
                        </h4>
                        <span className="text-lg font-bold text-primary ml-4 flex-shrink-0">
                          {item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className={`text-sm ${subtextColorClass}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default card variant
  return (
    <section className={`py-20 lg:py-32 ${bgClasses[background]}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {badge && <Badge className="mb-4">{badge}</Badge>}
          <h2
            className={`text-4xl lg:text-5xl font-bold ${textColorClass} mb-4`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`text-lg ${subtextColorClass} max-w-2xl mx-auto`}>
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className={`grid ${gridCols[columns]} gap-8`}>
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card
                className={`h-full ${
                  background === "dark"
                    ? "bg-white/5 border-white/10"
                    : "hover:shadow-xl transition-shadow duration-300"
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    {category.icon && (
                      <category.icon className="w-8 h-8 text-primary" />
                    )}
                    <h3 className={`text-2xl font-bold ${textColorClass}`}>
                      {category.title}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {category.items.map((item, index) => (
                      <div
                        key={index}
                        className={`border-b ${
                          background === "dark"
                            ? "border-white/10"
                            : "border-gray-100"
                        } last:border-0 pb-4 last:pb-0`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4
                            className={`font-semibold ${textColorClass} text-lg`}
                          >
                            {item.name}
                          </h4>
                          <span className="text-lg font-bold text-primary ml-4 flex-shrink-0">
                            {item.price}
                          </span>
                        </div>
                        {item.description && (
                          <p className={`text-sm ${subtextColorClass}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
