import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";
import { SocialButton, SocialPlatform } from "./social-button";
import { motion } from "framer-motion";

export interface TeamMemberSocial {
  platform: SocialPlatform;
  href: string;
}

export interface TeamCardProps {
  name: string;
  role: string;
  bio?: string;
  image: string;
  socials?: TeamMemberSocial[];
  className?: string;
  variant?: "default" | "minimal" | "overlay";
}

export function TeamCard({
  name,
  role,
  bio,
  image,
  socials,
  className,
  variant = "default",
}: TeamCardProps) {
  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn("text-center", className)}
      >
        <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-full group">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <h3 className="text-2xl font-bold text-charcoal-900 mb-2">{name}</h3>
        <div className="text-primary font-medium mb-4">{role}</div>
        {bio && <p className="text-secondary mb-6 leading-relaxed">{bio}</p>}

        {socials && socials.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            {socials.map((social) => (
              <SocialButton
                key={social.platform}
                platform={social.platform}
                href={social.href}
                variant="circle"
                size="sm"
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  if (variant === "overlay") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={className}
      >
        <div className="relative overflow-hidden rounded-2xl group cursor-pointer h-96">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/50 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-1">{name}</h3>
            <div className="text-primary-200 font-medium mb-3">{role}</div>
            {bio && (
              <p className="text-sm text-white/80 leading-relaxed mb-4">{bio}</p>
            )}

            {socials && socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <SocialButton
                    key={social.platform}
                    platform={social.platform}
                    href={social.href}
                    variant="minimal"
                    size="sm"
                    className="text-white hover:text-primary"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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
      <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-charcoal-900 mb-1">{name}</h3>
          <div className="text-primary font-medium mb-3">{role}</div>
          {bio && <p className="text-secondary text-sm leading-relaxed mb-4">{bio}</p>}

          {socials && socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <SocialButton
                  key={social.platform}
                  platform={social.platform}
                  href={social.href}
                  variant="circle"
                  size="sm"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
