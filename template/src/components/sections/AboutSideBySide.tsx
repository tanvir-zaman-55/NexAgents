import { motion } from "framer-motion";
import { Check, LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface AboutSideBySideProps {
  badge?: string;
  title: string | React.ReactNode;
  description: string[];
  features?: string[];
  stats?: Array<{
    icon: LucideIcon;
    value: string;
    label: string;
  }>;
  image: string;
  imagePosition?: "left" | "right";
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export function AboutSideBySide({
  badge,
  title,
  description,
  features,
  stats,
  image,
  imagePosition = "right",
  cta,
}: AboutSideBySideProps) {
  const ContentSection = () => (
    <motion.div
      initial={{ opacity: 0, x: imagePosition === "left" ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="space-y-6"
    >
      {badge && (
        <Badge variant="default" className="mb-2">
          {badge}
        </Badge>
      )}

      <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
        {title}
      </h2>

      <div className="space-y-4">
        {description.map((paragraph, index) => (
          <p key={index} className="text-lg text-secondary leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {features && features.length > 0 && (
        <div className="space-y-3 pt-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-charcoal-800 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      )}

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-6 pt-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-secondary uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {cta && (
        <div className="pt-4">
          <Button size="lg" onClick={cta.onClick}>
            {cta.label}
          </Button>
        </div>
      )}
    </motion.div>
  );

  const ImageSection = () => (
    <motion.div
      initial={{ opacity: 0, x: imagePosition === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={image}
          alt="About"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Decorative element */}
      <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-full -z-10 blur-3xl" />
    </motion.div>
  );

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {imagePosition === "left" ? (
            <>
              <ImageSection />
              <ContentSection />
            </>
          ) : (
            <>
              <ContentSection />
              <ImageSection />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
