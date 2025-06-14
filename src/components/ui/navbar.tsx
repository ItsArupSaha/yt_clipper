"use client";
import Link from "next/link";
import { useState } from "react";

/**
 * Navigation Bar Component
 * 
 * A responsive navigation bar that includes:
 * - Logo/brand name
 * - Navigation links (Home, GitHub, Twitter)
 * - Mobile menu button for smaller screens
 * 
 * The navbar uses a dark theme with orange accents and includes
 * hover effects for better interactivity.
 */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 bg-gray-900/95 border-b border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/icon.png"
              alt="YT Clipper Logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 bg-clip-text text-transparent">
              YT Clipper
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              href="https://github.com/ItsArupSaha/yt_clipper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
            >
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/arup-saha99/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
            >
              Linkedin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-orange-400 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-300 hover:text-orange-400 transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              href="https://github.com/ItsArupSaha/yt_clipper"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-orange-400 transition-colors text-sm"
            >
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/arup-saha99/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-orange-400 transition-colors text-sm"
            >
              Linkedin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 