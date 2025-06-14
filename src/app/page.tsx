/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";
import { useState } from "react";

/**
 * Main page component for the YouTube Video Clipper application.
 * This is a client-side component that handles the video trimming functionality.
 */
export default function Home() {
  // State management for form inputs and UI feedback
  const [url, setUrl] = useState(""); // YouTube video URL
  const [start, setStart] = useState("00:00:00"); // Start time for trimming
  const [end, setEnd] = useState("00:00:10"); // End time for trimming
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [message, setMessage] = useState(""); // User feedback messages
  const [quality, setQuality] = useState("720p"); // Video quality selection

  /**
   * Extracts the YouTube video ID from various URL formats
   * Supports both youtube.com/watch?v= and youtu.be/ formats
   */
  const extractId = (link: string) => {
    const m = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&]|$)/.exec(
      link.replace("youtu.be/", "youtube.com/watch?v=")
    );
    return m ? m[1] : "";
  };
  const videoId = extractId(url);

  /**
   * Converts time string (HH:MM:SS) to seconds
   * Used for validation and API requests
   */
  const toSeconds = (t: string) =>
    t
      .split(":")
      .reverse()
      .reduce((s, v, i) => s + Number(v) * 60 ** i, 0);

  /**
   * Validates the time range for trimming
   * Ensures end time is after start time and clip is not too long
   */
  const validateTimeRange = () => {
    const startSeconds = toSeconds(start);
    const endSeconds = toSeconds(end);
    const duration = endSeconds - startSeconds;

    if (duration <= 0) {
      setMessage("⚠️ End time must be greater than start time");
      return false;
    }
    if (duration > 15 * 60) {
      setMessage("⚠️ Maximum clip duration is 15 minutes");
      return false;
    }
    return true;
  };

  /**
   * Handles the video trimming process
   * Makes API call to trim the video and triggers download
   */
  const trim = async () => {
    if (!videoId) return setMessage("❗ Paste a valid YouTube URL first");
    if (!validateTimeRange()) return;
    setLoading(true);
    setMessage("⏳ Trimming…");
    try {
      const res = await fetch("/api/trim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, start, end, quality }),
      });
      if (!res.ok) {
        const error = await res.text();
        setMessage(`⚠️ ${error}`);
        return;
      }
      // Create a download link for the trimmed video
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "clip.mp4";
      a.click();
      setMessage("✅ Clip downloaded");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background Effect */}
        <AnimatedBackground />
        
        {/* Hero Section with Title and Features */}
        <div className="relative z-10 pt-12 md:pt-20 pb-8 md:pb-16 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 bg-clip-text text-transparent animate-gradient">
              YouTube Video Clipper
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 md:mb-8 px-4">
              Trim your favorite YouTube videos with precision. Create perfect clips in seconds.
            </p>
            {/* Feature Highlights */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-8 md:mb-12 px-4">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No registration required</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Fast and reliable</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>High-quality output</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border border-gray-200/50 dark:border-gray-800/50 transform transition-all duration-300 hover:shadow-orange-500/10">
              <div className="space-y-6 md:space-y-8">
                {/* YouTube URL Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube URL
                  </label>
                  <div className="relative">
                    <input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-200/50 dark:ring-gray-800/50 group-hover:ring-orange-500/50 transition-all duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Time Range Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time (HH:MM:SS)
                    </label>
                    <div className="relative">
                      <input
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        placeholder="00:00:00"
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-200/50 dark:ring-gray-800/50 group-hover:ring-orange-500/50 transition-all duration-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time (HH:MM:SS)
                    </label>
                    <div className="relative">
                      <input
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        placeholder="00:00:10"
                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-200/50 dark:ring-gray-800/50 group-hover:ring-orange-500/50 transition-all duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Video Quality Selector */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                  >
                    <option value="720p">720p (HD)</option>
                    <option value="480p">480p (SD)</option>
                    <option value="360p">360p (Low)</option>
                  </select>
                </div>

                {/* Video Preview */}
                {videoId && (
                  <div className="aspect-video rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02]">
                    <iframe
                      title="preview"
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Loading State Indicator */}
                {loading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Processing your video...
                    </p>
                  </div>
                )}

                {/* Trim & Download Button */}
                <button
                  onClick={trim}
                  disabled={loading}
                  className="w-full py-3 md:py-4 px-4 md:px-6 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 text-white font-medium text-base md:text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-orange-500/25"
                >
                  {loading ? "Processing..." : "Trim & Download"}
                </button>

                {/* Status Message Display */}
                {message && (
                  <div className={`text-center p-3 md:p-4 rounded-xl transition-all duration-300 text-sm md:text-base ${
                    message.includes("✅") ? "bg-green-500/10 text-green-500" :
                    message.includes("⚠️") ? "bg-yellow-500/10 text-yellow-500" :
                    message.includes("❌") ? "bg-red-500/10 text-red-500" :
                    "bg-gray-500/10 text-gray-500"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Info Text */}
                <p className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400">
                  Maximum clip duration: 15 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
