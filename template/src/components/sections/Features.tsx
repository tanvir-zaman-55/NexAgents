import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  Clock,
  HeartHandshake,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Experience blazing-fast performance with our optimized platform built for speed.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security to keep your data safe and protected at all times.",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Modern Design",
    description:
      "Beautiful, intuitive interfaces that users love and enjoy working with.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Scalable Growth",
    description:
      "Scale seamlessly as your business grows with our flexible infrastructure.",
    gradient: "from-green-400 to-emerald-600",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Round-the-clock customer support to help you whenever you need assistance.",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    icon: HeartHandshake,
    title: "Easy Integration",
    description:
      "Seamlessly integrate with your existing tools and workflows in minutes.",
    gradient: "from-rose-400 to-red-500",
  },
];

export function Features() {
  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
            Powerful{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Everything you need to succeed, all in one comprehensive platform
            designed for modern businesses.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="space-y-6">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <CardTitle className="text-xl">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
