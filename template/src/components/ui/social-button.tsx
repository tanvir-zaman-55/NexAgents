import * as React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "github"
  | "email";

export interface SocialButtonProps {
  platform: SocialPlatform;
  href: string;
  variant?: "default" | "circle" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const iconMap = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  email: Mail,
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function SocialButton({
  platform,
  href,
  variant = "default",
  size = "md",
  className,
}: SocialButtonProps) {
  const Icon = iconMap[platform];

  const baseClasses = cn(
    "inline-flex items-center justify-center transition-all duration-300",
    sizeClasses[size]
  );

  const variantClasses = {
    default: "bg-gray-100 hover:bg-primary text-gray-600 hover:text-white rounded-lg",
    circle: "bg-gray-100 hover:bg-primary text-gray-600 hover:text-white rounded-full",
    minimal: "text-gray-600 hover:text-primary hover:scale-110",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label={platform}
    >
      <Icon className={iconSizeClasses[size]} />
    </a>
  );
}

export interface SocialButtonGroupProps {
  platforms: Array<{ platform: SocialPlatform; href: string }>;
  variant?: "default" | "circle" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SocialButtonGroup({
  platforms,
  variant = "default",
  size = "md",
  className,
}: SocialButtonGroupProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {platforms.map((item) => (
        <SocialButton
          key={item.platform}
          platform={item.platform}
          href={item.href}
          variant={variant}
          size={size}
        />
      ))}
    </div>
  );
}
