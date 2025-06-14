"use client";
import Link from "next/link";

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
  return (
    <nav className="relative z-10 bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 bg-clip-text text-transparent">
              YT Clipper
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="https://github.com/yourusername/yt-clipper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Twitter
            </Link>
          </div>

          {/* Mobile Menu Button - Only visible on small screens */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
} 