import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { TestimonialCard } from "../ui/testimonial-card";
import { StatsGrid } from "../ui/stat-card";

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  testimonials: Testimonial[];
  variant?: "grid" | "slider" | "featured";
  showStats?: boolean;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  background?: "white" | "gray" | "gradient";
}

export function TestimonialsSection({
  badge,
  title,
  subtitle,
  testimonials,
  variant = "grid",
  showStats = false,
  stats,
  background = "white",
}: TestimonialsSectionProps) {
  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-br from-primary-50 via-white to-accent-50",
  };

  return (
    <section className={`py-20 lg:py-32 ${bgClasses[background]}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {badge && <Badge className="mb-4">{badge}</Badge>}
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        {variant === "grid" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        )}

        {variant === "featured" && (
          <div className="max-w-4xl mx-auto mb-16">
            <TestimonialCard
              {...testimonials[0]}
              variant="minimal"
              className="text-center"
            />
          </div>
        )}

        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16"
          >
            <div className="inline-flex flex-wrap justify-center items-center gap-12 px-8 py-6 bg-white rounded-2xl shadow-xl mx-auto">
              {stats.map((stat, index) => (
                <React.Fragment key={index}>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-secondary">{stat.label}</div>
                  </div>
                  {index < stats.length - 1 && (
                    <div className="w-px h-12 bg-gray-200" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
