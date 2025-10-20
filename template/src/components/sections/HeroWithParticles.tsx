import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface HeroWithParticlesProps {
  badge?: string;
  title: string | React.ReactNode;
  subtitle: string;
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
  particleCount?: number;
}

export function HeroWithParticles({
  badge,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  particleCount = 20,
}: HeroWithParticlesProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: -20,
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {badge && (
            <Badge className="mb-6 shadow-lg animate-pulse-slow">
              {badge}
            </Badge>
          )}
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal-900 mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button size="xl" onClick={primaryCTA.onClick} className="group">
            {primaryCTA.label}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          {secondaryCTA && (
            <Button
              size="xl"
              variant="outline"
              onClick={secondaryCTA.onClick}
            >
              {secondaryCTA.label}
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
