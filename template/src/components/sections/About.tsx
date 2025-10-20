import { motion } from "framer-motion";
import { Check, Award, Users, Target } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const achievements = [
  "Industry-leading solutions",
  "Award-winning team",
  "10,000+ satisfied customers",
  "99.9% uptime guarantee",
];

const stats = [
  { icon: Award, value: "50+", label: "Awards Won" },
  { icon: Users, value: "10K+", label: "Happy Clients" },
  { icon: Target, value: "99%", label: "Success Rate" },
];

export function About() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
                  >
                    <Award className="w-16 h-16 text-white" />
                  </motion.div>
                  <p className="text-2xl font-bold text-charcoal-900">
                    Excellence
                    <br />
                    in Every Detail
                  </p>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-accent shadow-glow rotate-12"
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
                About{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Our Company
                </span>
              </h2>
              <p className="text-lg text-secondary leading-relaxed">
                We're passionate about delivering exceptional solutions that
                drive real results. With years of experience and a dedicated
                team, we've helped thousands of businesses achieve their goals.
              </p>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-base text-charcoal-800 font-medium">
                    {achievement}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-glow">
                    <CardContent className="p-6 space-y-2">
                      <stat.icon className="w-8 h-8 mx-auto text-primary" />
                      <p className="text-2xl font-bold text-charcoal-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-secondary font-medium">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
