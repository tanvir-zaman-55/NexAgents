import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface HeroWithBackgroundProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
  backgroundImage: string;
  overlayOpacity?: number;
  showScrollIndicator?: boolean;
}

export function HeroWithBackground({
  badge,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  overlayOpacity = 70,
  showScrollIndicator = true,
}: HeroWithBackgroundProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-charcoal-800"
          style={{ opacity: overlayOpacity / 100 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {badge && (
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2">
              {badge}
            </Badge>
          )}
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            size="xl"
            onClick={primaryCTA.onClick}
            className="group"
          >
            {primaryCTA.label}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          {secondaryCTA && (
            <Button
              size="xl"
              variant="outline"
              onClick={secondaryCTA.onClick}
              className="border-white/30 text-white hover:bg-white/10"
            >
              {secondaryCTA.label}
            </Button>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/60 flex flex-col items-center gap-2"
          >
            <span className="text-sm uppercase tracking-wider">Scroll</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
