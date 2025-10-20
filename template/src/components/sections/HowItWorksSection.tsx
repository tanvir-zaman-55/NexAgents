import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface HowItWorksSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  steps: Step[];
  variant?: "cards" | "timeline" | "minimal";
}

export function HowItWorksSection({
  badge,
  title,
  subtitle,
  steps,
  variant = "cards",
}: HowItWorksSectionProps) {
  if (variant === "timeline") {
    return (
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
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

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary hidden md:block" />

            <div className="space-y-16">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 text-right md:text-left">
                    <Card className="hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                            <step.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-charcoal-900 mb-3">
                              {step.title}
                            </h3>
                            <p className="text-secondary leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="hidden md:flex w-12 h-12 bg-primary rounded-full items-center justify-center text-white font-bold text-lg shadow-lg relative z-10">
                    {index + 1}
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
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

          <div className="grid md:grid-cols-3 gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-6xl font-light text-primary/20 mb-4">
                  {(index + 1).toString().padStart(2, "0")}
                </div>
                <h3 className="text-2xl font-bold text-charcoal-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default: cards variant
  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
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

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="relative h-full hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="p-8 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-6xl font-light text-charcoal-900/10">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl font-bold text-charcoal-900">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
