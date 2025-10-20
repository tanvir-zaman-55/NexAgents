import { motion } from "framer-motion";
import { ExternalLink, ZoomIn } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export interface GalleryItem {
  title: string;
  category?: string;
  image: string;
  link?: string;
}

export interface GallerySectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  variant?: "default" | "masonry" | "overlay";
  background?: "white" | "gray" | "dark";
}

export function GallerySection({
  badge,
  title,
  subtitle,
  items,
  columns = 3,
  variant = "default",
  background = "white",
}: GallerySectionProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    dark: "bg-charcoal-900",
  };

  const textColorClass =
    background === "dark" ? "text-white" : "text-charcoal-900";
  const subtextColorClass =
    background === "dark" ? "text-white/80" : "text-secondary";

  if (variant === "overlay") {
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

          <div className={`grid grid-cols-2 ${gridCols[columns]} gap-4`}>
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative overflow-hidden group aspect-square rounded-2xl cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    {item.link ? (
                      <ExternalLink className="w-6 h-6 text-charcoal-900" />
                    ) : (
                      <ZoomIn className="w-6 h-6 text-charcoal-900" />
                    )}
                  </div>
                  <div className="text-center px-4">
                    {item.category && (
                      <div className="text-sm text-primary-300 font-medium mb-2">
                        {item.category}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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

        <div className={`grid grid-cols-2 ${gridCols[columns]} gap-8`}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  {item.category && (
                    <div className="text-sm text-primary font-medium mb-2">
                      {item.category}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-charcoal-900">
                    {item.title}
                  </h3>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
