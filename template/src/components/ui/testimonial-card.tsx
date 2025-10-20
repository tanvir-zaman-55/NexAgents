import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";
import { StarRating } from "./star-rating";
import { motion } from "framer-motion";

export interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
  className?: string;
  variant?: "default" | "minimal" | "bordered";
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
  rating,
  className,
  variant = "default",
}: TestimonialCardProps) {
  const content = (
    <>
      {rating && (
        <div className="mb-6">
          <StarRating rating={rating} />
        </div>
      )}

      <blockquote className="text-base text-charcoal-800 leading-relaxed mb-6 italic">
        "{quote}"
      </blockquote>

      <div className="flex items-center gap-4">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/10"
          />
        )}
        {!avatar && (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-charcoal-900">{author}</div>
          <div className="text-sm text-secondary">
            {role}
            {company && ` • ${company}`}
          </div>
        </div>
      </div>
    </>
  );

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn("p-6", className)}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card
        className={cn(
          "h-full hover:shadow-xl transition-all duration-300",
          variant === "bordered" && "border-2 border-gray-100"
        )}
      >
        <CardContent className="p-8">{content}</CardContent>
      </Card>
    </motion.div>
  );
}
