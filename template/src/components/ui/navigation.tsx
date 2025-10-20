import * as React from "react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationProps {
  brand: React.ReactNode;
  links: NavigationLink[];
  ctaButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  sticky?: boolean;
  transparent?: boolean;
}

export function Navigation({
  brand,
  links,
  ctaButton,
  className,
  sticky = true,
  transparent = false,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <nav
      className={cn(
        "w-full z-50 transition-all duration-500",
        sticky && "fixed top-0 left-0 right-0",
        isScrolled || !transparent
          ? "bg-white/95 backdrop-blur-xl shadow-sm"
          : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <div className="flex items-center">{brand}</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  isScrolled || !transparent
                    ? "text-gray-700 hover:text-primary"
                    : "text-white hover:text-primary-200"
                )}
              >
                {link.label}
              </button>
            ))}
            {ctaButton && (
              <Button onClick={ctaButton.onClick} size="default">
                {ctaButton.label}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "md:hidden transition-colors duration-200",
              isScrolled || !transparent
                ? "text-gray-900 hover:text-primary"
                : "text-white hover:text-primary-200"
            )}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-t border-gray-100">
            <div className="px-6 py-6 space-y-4">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left text-gray-700 hover:text-primary transition-colors font-medium py-2"
                >
                  {link.label}
                </button>
              ))}
              {ctaButton && (
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    ctaButton.onClick();
                  }}
                  className="w-full"
                >
                  {ctaButton.label}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
