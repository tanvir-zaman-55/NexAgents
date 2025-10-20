import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Brand */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
              Your Brand
            </h3>
            <p className="text-sm text-gray-400">
              Building the future, one project at a time.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Services
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Contact
            </a>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

          {/* Copyright */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              Made with <Heart className="w-4 h-4 text-accent fill-accent" /> by
              Your Company
            </p>
            <p className="text-xs text-gray-500">
              © {currentYear} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
