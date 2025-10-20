"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./navbar";
import FloatingSocial from "./components/FloatingSocial";

export const runtime = 'edge';

// Interfaces remain unchanged
interface Genre {
  id: number;
  name: string;
}

interface ContentItem {
  id: number;
  title: string;
  description?: string;
  release_year?: number;
  translator?: string;
  language?: string;
  poster_url?: string;
  type: "movie" | "series";
  genres?: Genre[];
}

interface LatestUpdate {
  id: number;
  number: number;
  title: string;
  created_at: string | null;
  video_url?: string;
  download_url?: string;
  type: "episode" | "movie_part";
  content: {
    id: number;
    title: string;
    poster_url?: string;
    type: "movie" | "series";
  };
}

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-lg overflow-hidden min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]">
    <div className="relative h-48 sm:h-56 bg-gray-700 animate-pulse"></div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-gray-600 rounded w-1/2 animate-pulse"></div>
    </div>
  </div>
);

// Simple fallback animations for older browsers
const simpleFadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/";

// Feature detection
const supportsTransitions = () => {
  if (typeof window === 'undefined') return true;
  const style = document.documentElement.style;
  return 'transition' in style || 'WebkitTransition' in style || 'MozTransition' in style;
};

const supportsTransforms = () => {
  if (typeof window === 'undefined') return true;
  const style = document.documentElement.style;
  return 'transform' in style || 'WebkitTransform' in style || 'MozTransform' in style;
};

export default function Home() {
  const [heroContent, setHeroContent] = useState<ContentItem[]>([]);
  const [nonHeroMovies, setNonHeroMovies] = useState<ContentItem[]>([]);
  const [nonHeroSeries, setNonHeroSeries] = useState<ContentItem[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeType, setActiveType] = useState<"movie" | "series">("movie");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [browserSupport, setBrowserSupport] = useState({
    transitions: true,
    transforms: true
  });
  
  // New states to control visible cards
  const [visibleUpdates, setVisibleUpdates] = useState(0);
  const [visibleMovies, setVisibleMovies] = useState(0);
  const [visibleSeries, setVisibleSeries] = useState(0);
  const moviesScrollRef = useRef<HTMLDivElement>(null);
  const seriesScrollRef = useRef<HTMLDivElement>(null);
  const updatesScrollRef = useRef<HTMLDivElement>(null);

  // Number of skeleton cards to show initially
  const SKELETON_COUNT = 6;

  useEffect(() => {
    // Detect browser capabilities
    setBrowserSupport({
      transitions: supportsTransitions(),
      transforms: supportsTransforms()
    });
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Simple fetch with timeout for older browsers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(BASE_URL, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error("Failed to fetch content");
        }
        const data = await response.json();

        setHeroContent([...data.hero_movies, ...data.hero_series]);
        setNonHeroMovies(data.non_hero_movies);
        setNonHeroSeries(data.non_hero_series);
        setLatestUpdates(data.latest_updates);

        // Simulate progressive loading by incrementing visible cards
        const totalUpdates = data.latest_updates.length;
        const totalMovies = data.non_hero_movies.length;
        const totalSeries = data.non_hero_series.length;

        let updateCount = 0;
        let movieCount = 0;
        let seriesCount = 0;

        const interval = setInterval(() => {
          if (updateCount < totalUpdates) {
            setVisibleUpdates(++updateCount);
          }
          if (movieCount < totalMovies) {
            setVisibleMovies(++movieCount);
          }
          if (seriesCount < totalSeries) {
            setVisibleSeries(++seriesCount);
          }
          
          if (updateCount >= totalUpdates && movieCount >= totalMovies && seriesCount >= totalSeries) {
            clearInterval(interval);
          }
        }, 200);

      } catch (err) {
        console.error("Failed to fetch content:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    if (heroContent.length === 0) return;

    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentSlide((prev) => (prev + 1) % heroContent.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [heroContent.length, isHovered]);

  const currentItem = heroContent[currentSlide % heroContent.length] || null;

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroContent.length);
  }, [heroContent.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroContent.length) % heroContent.length);
  }, [heroContent.length]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      // Fallback for browsers that don't support smooth scroll
      try {
        ref.current.scrollBy({ left: -150, behavior: "smooth" });
      } catch (e) {
        ref.current.scrollLeft -= 150;
      }
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      // Fallback for browsers that don't support smooth scroll
      try {
        ref.current.scrollBy({ left: 150, behavior: "smooth" });
      } catch (e) {
        ref.current.scrollLeft += 150;
      }
    }
  };

  // Simple card animation variants based on browser support
  const getCardVariants = () => {
    return browserSupport.transitions ? simpleFadeIn : { hidden: {}, visible: {} };
  };

  const cardVariants = getCardVariants();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 p-8 text-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Error loading content</h1>
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 pt-16">
        {/* Hero Section */}
        <section
          className="relative w-full h-[60vh] min-h-[400px] max-h-[800px] overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {currentItem ? (
            <>
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              {currentItem.poster_url ? (
                <div className="absolute inset-0">
                  <Image
                    src={currentItem.poster_url}
                    alt={currentItem.title}
                    fill
                    className="object-cover object-center"
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        currentItem.type === "series" ? "/placeholder-series.png" : "/placeholder.png";
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900"></div>
              )}
              <div className="relative z-20 flex flex-col justify-center h-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
                <div className="max-w-xl relative">
                  <button
                    onClick={() => toggleFavorite(currentItem.id)}
                    className="absolute -top-2 -right-2 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
                    aria-label={favorites.includes(currentItem.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.includes(currentItem.id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-white text-lg" />
                    )}
                  </button>
                  <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-white bg-blue-600 rounded-full">
                    {currentItem.type === "movie" ? "Latest Movie" : "Latest Series"}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">{currentItem.title}</h1>
                  <div className="flex gap-3">
                    <Link
                      href={
                        currentItem.type === "movie"
                          ? `/movies/${encodeURIComponent(currentItem.title)}#watch`
                          : `/series/${encodeURIComponent(currentItem.title)}#watch`
                      }
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                    >
                      Watch Now
                    </Link>
                    <Link
                      href={`/${currentItem.type}s/${encodeURIComponent(currentItem.title)}`}
                      className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all backdrop-blur-sm"
                    >
                      More Info
                    </Link>
                  </div>
                </div>
              </div>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <FaChevronLeft className="text-white text-lg sm:text-xl" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm"
                aria-label="Next slide"
              >
                <FaChevronRight className="text-white text-lg sm:text-xl" />
              </button>
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-1 sm:gap-2">
                {heroContent.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="group relative flex flex-col items-center"
                    aria-label={`Go to ${item.title}`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden transition-all ${
                        index === currentSlide % heroContent.length
                          ? "ring-2 ring-blue-500 scale-110"
                          : "opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{
                        transform: index === currentSlide % heroContent.length && browserSupport.transforms ? 'scale(1.1)' : 'none'
                      }}
                    >
                      {item.poster_url ? (
                        <Image
                          src={item.poster_url}
                          alt={item.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          quality={75}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              item.type === "series" ? "/placeholder-series.png" : "/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-white">{item.title.substring(0, 1)}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-full mb-1 px-1 py-0.5 text-xs text-white bg-black/80 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                        index === currentSlide % heroContent.length ? "opacity-100" : ""
                      }`}
                    >
                      {item.title}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <p className="text-lg text-gray-400">No content available</p>
            </div>
          )}
        </section>

        {/* Latest Updates Section */}
        <section className="py-8 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">Latest Updates</h2>
          <div className="relative">
            <button
              onClick={() => scrollLeft(updatesScrollRef)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="text-white text-lg" />
            </button>
            <button
              onClick={() => scrollRight(updatesScrollRef)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
              aria-label="Scroll right"
            >
              <FaChevronRight className="text-white text-lg" />
            </button>
            <div
              ref={updatesScrollRef}
              className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hidden snap-x snap-mandatory"
              style={{ scrollBehavior: browserSupport.transitions ? 'smooth' : 'auto' }}
            >
              {browserSupport.transitions ? (
                <AnimatePresence>
                  {loading && visibleUpdates === 0
                    ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                        <motion.div
                          key={`skeleton-update-${index}`}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                          className="snap-start"
                        >
                          <SkeletonCard />
                        </motion.div>
                      ))
                    : latestUpdates.slice(0, visibleUpdates).map((update, index) => (
                        <motion.div
                          key={`${update.type}-${update.id}`}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                          className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                          whileHover={browserSupport.transforms ? { y: -4 } : {}}
                        >
                          <Link
                            href={`/${update.content.type === "series" ? "series" : "movies"}/${encodeURIComponent(update.content.title)}`}
                            className="block h-full"
                          >
                            {update.content.poster_url ? (
                              <div className="relative h-48 sm:h-56">
                                <Image
                                  src={update.content.poster_url}
                                  alt={update.content.title}
                                  fill
                                  className="object-cover transition-opacity hover:opacity-90"
                                  sizes="(max-width: 640px) 150px, 180px"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      update.content.type === "series" ? "/placeholder-series.png" : "/placeholder.png";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No Image</span>
                              </div>
                            )}
                            <div className="p-3">
                              <h3 className="text-sm sm:text-base font-semibold text-white truncate">{update.content.title}</h3>
                              <p className="text-xs text-gray-400 truncate">
                                {update.type === "episode" ? `Ep ${update.number}` : `Part ${update.number}`}
                              </p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                </AnimatePresence>
              ) : (
                // Fallback for browsers without animation support
                <>
                  {loading && visibleUpdates === 0
                    ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                        <div key={`skeleton-update-${index}`} className="snap-start">
                          <SkeletonCard />
                        </div>
                      ))
                    : latestUpdates.slice(0, visibleUpdates).map((update, index) => (
                        <div
                          key={`${update.type}-${update.id}`}
                          className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                        >
                          <Link
                            href={`/${update.content.type === "series" ? "series" : "movies"}/${encodeURIComponent(update.content.title)}`}
                            className="block h-full"
                          >
                            {update.content.poster_url ? (
                              <div className="relative h-48 sm:h-56">
                                <Image
                                  src={update.content.poster_url}
                                  alt={update.content.title}
                                  fill
                                  className="object-cover transition-opacity hover:opacity-90"
                                  sizes="(max-width: 640px) 150px, 180px"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      update.content.type === "series" ? "/placeholder-series.png" : "/placeholder.png";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No Image</span>
                              </div>
                            )}
                            <div className="p-3">
                              <h3 className="text-sm sm:text-base font-semibold text-white truncate">{update.content.title}</h3>
                              <p className="text-xs text-gray-400 truncate">
                                {update.type === "episode" ? `Ep ${update.number}` : `Part ${update.number}`}
                              </p>
                            </div>
                          </Link>
                        </div>
                      ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Movies/Series Section */}
        <section className="py-8 px-4 sm:px-6 md:px-8">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveType("movie")}
                className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-l-lg transition-all ${
                  activeType === "movie" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setActiveType("series")}
                className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-r-lg transition-all ${
                  activeType === "series" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Series
              </button>
            </div>
          </div>

          <div className="relative">
            {activeType === "movie" && (
              <>
                <button
                  onClick={() => scrollLeft(moviesScrollRef)}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-white text-lg" />
                </button>
                <button
                  onClick={() => scrollRight(moviesScrollRef)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-white text-lg" />
                </button>
                <div
                  ref={moviesScrollRef}
                  className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hidden snap-x snap-mandatory"
                  style={{ scrollBehavior: browserSupport.transitions ? 'smooth' : 'auto' }}
                >
                  {browserSupport.transitions ? (
                    <AnimatePresence>
                      {loading && visibleMovies === 0
                        ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                            <motion.div
                              key={`skeleton-movie-${index}`}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                              className="snap-start"
                            >
                              <SkeletonCard />
                            </motion.div>
                          ))
                        : nonHeroMovies.slice(0, visibleMovies).map((movie, index) => (
                            <motion.div
                              key={`${movie.type}-${movie.id}`}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                              whileHover={browserSupport.transforms ? { y: -4 } : {}}
                            >
                              <Link href={`/movies/${encodeURIComponent(movie.title)}`} className="block h-full">
                                {movie.poster_url ? (
                                  <div className="relative h-48 sm:h-56">
                                    <Image
                                      src={movie.poster_url}
                                      alt={movie.title}
                                      fill
                                      className="object-cover transition-opacity hover:opacity-90"
                                      sizes="(max-width: 640px) 150px, 180px"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.png";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                  </div>
                                )}
                                <div className="p-3">
                                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">{movie.title}</h3>
                                  {movie.genres && movie.genres.length > 0 && (
                                    <p className="text-xs text-gray-400 truncate">{movie.genres[0].name}</p>
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                    </AnimatePresence>
                  ) : (
                    // Fallback for browsers without animation support
                    <>
                      {loading && visibleMovies === 0
                        ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                            <div key={`skeleton-movie-${index}`} className="snap-start">
                              <SkeletonCard />
                            </div>
                          ))
                        : nonHeroMovies.slice(0, visibleMovies).map((movie, index) => (
                            <div
                              key={`${movie.type}-${movie.id}`}
                              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                            >
                              <Link href={`/movies/${encodeURIComponent(movie.title)}`} className="block h-full">
                                {movie.poster_url ? (
                                  <div className="relative h-48 sm:h-56">
                                    <Image
                                      src={movie.poster_url}
                                      alt={movie.title}
                                      fill
                                      className="object-cover transition-opacity hover:opacity-90"
                                      sizes="(max-width: 640px) 150px, 180px"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.png";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                  </div>
                                )}
                                <div className="p-3">
                                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">{movie.title}</h3>
                                  {movie.genres && movie.genres.length > 0 && (
                                    <p className="text-xs text-gray-400 truncate">{movie.genres[0].name}</p>
                                  )}
                                </div>
                              </Link>
                            </div>
                          ))}
                    </>
                  )}
                </div>
              </>
            )}
            {activeType === "series" && (
              <>
                <button
                  onClick={() => scrollLeft(seriesScrollRef)}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-white text-lg" />
                </button>
                <button
                  onClick={() => scrollRight(seriesScrollRef)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-white text-lg" />
                </button>
                <div
                  ref={seriesScrollRef}
                  className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hidden snap-x snap-mandatory"
                  style={{ scrollBehavior: browserSupport.transitions ? 'smooth' : 'auto' }}
                >
                  {browserSupport.transitions ? (
                    <AnimatePresence>
                      {loading && visibleSeries === 0
                        ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                            <motion.div
                              key={`skeleton-series-${index}`}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                              className="snap-start"
                            >
                              <SkeletonCard />
                            </motion.div>
                          ))
                        : nonHeroSeries.slice(0, visibleSeries).map((series, index) => (
                            <motion.div
                              key={`${series.type}-${series.id}`}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                              whileHover={browserSupport.transforms ? { y: -4 } : {}}
                            >
                              <Link href={`/series/${encodeURIComponent(series.title)}`} className="block h-full">
                                {series.poster_url ? (
                                  <div className="relative h-48 sm:h-56">
                                    <Image
                                      src={series.poster_url}
                                      alt={series.title}
                                      fill
                                      className="object-cover transition-opacity hover:opacity-90"
                                      sizes="(max-width: 640px) 150px, 180px"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder-series.png";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                  </div>
                                )}
                                <div className="p-3">
                                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">{series.title}</h3>
                                  {series.genres && series.genres.length > 0 && (
                                    <p className="text-xs text-gray-400 truncate">{series.genres[0].name}</p>
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                    </AnimatePresence>
                  ) : (
                    // Fallback for browsers without animation support
                    <>
                      {loading && visibleSeries === 0
                        ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                            <div key={`skeleton-series-${index}`} className="snap-start">
                              <SkeletonCard />
                            </div>
                          ))
                        : nonHeroSeries.slice(0, visibleSeries).map((series, index) => (
                            <div
                              key={`${series.type}-${series.id}`}
                              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                            >
                              <Link href={`/series/${encodeURIComponent(series.title)}`} className="block h-full">
                                {series.poster_url ? (
                                  <div className="relative h-48 sm:h-56">
                                    <Image
                                      src={series.poster_url}
                                      alt={series.title}
                                      fill
                                      className="object-cover transition-opacity hover:opacity-90"
                                      sizes="(max-width: 640px) 150px, 180px"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder-series.png";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                  </div>
                                )}
                                <div className="p-3">
                                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">{series.title}</h3>
                                  {series.genres && series.genres.length > 0 && (
                                    <p className="text-xs text-gray-400 truncate">{series.genres[0].name}</p>
                                  )}
                                </div>
                              </Link>
                            </div>
                          ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        <FloatingSocial />
      </main>
    </>
  );
}
