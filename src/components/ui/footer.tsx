"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div className="space-y-2 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center space-x-2">
              <img
                src="/icon.png"
                alt="YT Clipper Logo"
                className="w-6 h-6"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 bg-clip-text text-transparent">
                YT Clipper
              </span>
            </Link>
            <p className="text-gray-400 text-xs">
              Trim your favorite YouTube videos with precision.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="font-medium text-gray-300 text-sm mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-block text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/ItsArupSaha/yt_clipper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-block text-sm"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/in/arup-saha99/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-block text-sm"
                >
                  Linkedin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h3 className="font-medium text-gray-300 text-sm mb-2">Contact</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="mailto:your.email@example.com"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-block text-sm"
                >
                  Email Us
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/your-server"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-block text-sm"
                >
                  Join Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <p className="text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} YT Clipper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 