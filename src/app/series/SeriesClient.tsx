"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
export const runtime = 'edge';
interface Series {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  release_year: number;
  translator: string;
  language: string;
}

interface Genre {
  id: number;
  name: string;
  series: Series[];
}

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-48 md:w-56 bg-gray-800 rounded-lg overflow-hidden">
    <div className="relative h-64 md:h-72 bg-gray-700 animate-pulse"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-gray-600 rounded w-1/2 animate-pulse"></div>
      <div className="h-3 bg-gray-600 rounded w-1/3 animate-pulse"></div>
    </div>
  </div>
);

// Animation Variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // Stagger effect
      duration: 0.3,
    },
  }),
};

export default function SeriesListClient({ genres }: { genres: Genre[] }) {
  // State to track visible cards per genre
  const [visibleCardsByGenre, setVisibleCardsByGenre] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);

  // Number of skeleton cards to show per genre initially
  const SKELETON_COUNT = 4;

  useEffect(() => {
    // Initialize visible cards for each genre
    const initialVisible = genres.reduce((acc, genre) => {
      acc[genre.id] = 0;
      return acc;
    }, {} as { [key: number]: number });

    setVisibleCardsByGenre(initialVisible);
    setLoading(true);

    // Simulate progressive loading for each genre
    const interval = setInterval(() => {
      setVisibleCardsByGenre((prev) => {
        const updated = { ...prev };
        let allLoaded = true;

        genres.forEach((genre) => {
          if (updated[genre.id] < genre.series.length) {
            updated[genre.id] += 1;
            allLoaded = false;
          }
        });

        if (allLoaded) {
          clearInterval(interval);
          setLoading(false);
        }

        return updated;
      });
    }, 200); // Add one card every 200ms

    return () => clearInterval(interval);
  }, [genres]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            TV Series by Genre
          </motion.h1>

          {genres.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center text-gray-400 text-lg"
            >
              No series found.
            </motion.p>
          ) : (
            genres.map((genre) => (
              <motion.div
                key={genre.id}
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * genre.id }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-100 border-l-4 border-purple-500 pl-4">
                  {genre.name}
                </h2>
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                  <AnimatePresence>
                    {loading && visibleCardsByGenre[genre.id] === 0
                      ? // Show skeleton cards initially
                        Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                          <motion.div
                            key={`skeleton-${genre.id}-${index}`}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                          >
                            <SkeletonCard />
                          </motion.div>
                        ))
                      : // Show actual cards up to visibleCardsByGenre
                        genre.series.slice(0, visibleCardsByGenre[genre.id] || 0).map((series, index) => (
                          <motion.div
                            key={`${series.id}`}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            className="flex-shrink-0 w-48 md:w-56"
                          >
                            <Link href={`/series/${encodeURIComponent(series.title)}`} className="block">
                              <motion.div
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="relative h-64 md:h-72">
                                  <img
                                    src={series.poster_url || "/placeholder-series.png"}
                                    alt={series.title}
                                    className="w-full h-full object-cover rounded-t-lg"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder-series.png";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <p className="text-sm text-white font-medium truncate">{series.description}</p>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-semibold text-white truncate">{series.title}</h3>
                                  <p className="text-sm text-gray-400">{series.release_year}</p>
                                  <p className="text-xs text-gray-500 truncate">{series.language}</p>
                                </div>
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
