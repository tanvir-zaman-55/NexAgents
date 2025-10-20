import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Card, CardContent, CardHeader } from "./card";
import { Badge } from "./badge";
import { motion } from "framer-motion";

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps {
  name: string;
  description: string;
  price: string | number;
  period?: string;
  features: (string | PricingFeature)[];
  buttonText?: string;
  buttonVariant?: "primary" | "outline";
  popular?: boolean;
  highlighted?: boolean;
  onButtonClick?: () => void;
  className?: string;
  badge?: string;
}

export function PricingCard({
  name,
  description,
  price,
  period = "/month",
  features,
  buttonText = "Get Started",
  buttonVariant,
  popular = false,
  highlighted = false,
  onButtonClick,
  className,
  badge,
}: PricingCardProps) {
  const normalizedFeatures: PricingFeature[] = features.map((f) =>
    typeof f === "string" ? { text: f, included: true } : f
  );

  const isHighlighted = popular || highlighted;
  const defaultButtonVariant = isHighlighted ? "primary" : "outline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(isHighlighted && "md:-mt-8", className)}
    >
      <Card
        className={cn(
          "relative h-full transition-all duration-300 hover:shadow-2xl",
          isHighlighted &&
            "border-2 border-primary shadow-xl shadow-primary/20 scale-105"
        )}
      >
        {popular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Badge
              variant="default"
              className="shadow-lg px-4 py-1.5 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Most Popular
            </Badge>
          </div>
        )}

        {badge && !popular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Badge className="shadow-lg px-4 py-1.5">{badge}</Badge>
          </div>
        )}

        <CardHeader className="text-center pb-8">
          <h3 className="text-2xl font-bold text-charcoal-900 mb-2">{name}</h3>
          <p className="text-sm text-secondary">{description}</p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              {typeof price === "number" && (
                <span className="text-2xl text-charcoal-700">$</span>
              )}
              <span className="text-5xl font-bold text-charcoal-900">
                {price}
              </span>
              {typeof price === "number" && (
                <span className="text-lg text-secondary">{period}</span>
              )}
            </div>
          </div>

          <ul className="space-y-3">
            {normalizedFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                    feature.included
                      ? "bg-success/10"
                      : "bg-gray-100"
                  )}
                >
                  <Check
                    className={cn(
                      "w-3 h-3",
                      feature.included ? "text-success" : "text-gray-400"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm",
                    feature.included
                      ? "text-charcoal-900"
                      : "text-gray-400 line-through"
                  )}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <Button
            onClick={onButtonClick}
            variant={buttonVariant || defaultButtonVariant}
            size="lg"
            className="w-full"
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
