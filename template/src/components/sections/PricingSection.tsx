import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { BillingToggle, BillingPeriod } from "../ui/billing-toggle";
import { PricingCard, PricingFeature } from "../ui/pricing-card";

export interface PricingPlan {
  name: string;
  description: string;
  pricing: {
    monthly: number | string;
    quarterly?: number | string;
    annual?: number | string;
  };
  features: (string | PricingFeature)[];
  buttonText?: string;
  popular?: boolean;
  badge?: string;
}

export interface PricingSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
  showBillingToggle?: boolean;
  billingPeriods?: BillingPeriod[];
  savingsBadge?: {
    period: BillingPeriod;
    text: string;
  };
  background?: "white" | "gray" | "gradient";
}

export function PricingSection({
  badge,
  title,
  subtitle,
  plans,
  showBillingToggle = true,
  billingPeriods = ["monthly", "annual"],
  savingsBadge,
  background = "white",
}: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-br from-primary-50 via-white to-accent-50",
  };

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
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-secondary max-w-2xl mx-auto mb-8">
              {subtitle}
            </p>
          )}

          {showBillingToggle && (
            <BillingToggle
              value={billingPeriod}
              onChange={setBillingPeriod}
              periods={billingPeriods}
              savingsBadge={savingsBadge}
              className="mt-8"
            />
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const price = plan.pricing[billingPeriod] || plan.pricing.monthly;
            const period =
              billingPeriod === "monthly"
                ? "/month"
                : billingPeriod === "quarterly"
                ? "/quarter"
                : "/year";

            return (
              <PricingCard
                key={index}
                name={plan.name}
                description={plan.description}
                price={price}
                period={typeof price === "number" ? period : ""}
                features={plan.features}
                buttonText={plan.buttonText}
                popular={plan.popular}
                badge={plan.badge}
              />
            );
          })}
        </div>

        <motion.p
          className="text-center text-sm text-secondary mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
