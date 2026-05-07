  "use client";

  import { useEffect, useState, useCallback, useRef } from "react";
  import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
  import Link from "next/link";
  import { motion, AnimatePresence } from "framer-motion";
  import Navbar from "./navbar";
  import FloatingSocial from "./components/FloatingSocial";
  import Script from "next/script";
  import WhatsAppCard from "./components/WhatsAppCard";
  import OptimizedImage from "./components/OptimizedImage";
  import { imageQueue, useImagePreloader } from "./components/ImageLoader";


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
    translator?: string;
    content: {
      id: number;
      title: string;
      poster_url?: string;
      type: "movie" | "series";
    };
  }

  interface TrendingItem {
    id: number;
    type: "movie" | "series";
    title: string;
    description?: string;
    release_year?: number;
    translator?: string;
    language?: string;
    poster_url?: string;
    genres?: Genre[];
    pinned: boolean;
    position: number | null;
    created_at: string;
  }

  interface InfiniteContentItem {
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

  interface InfiniteContentResponse {
    data: InfiniteContentItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      has_more: boolean;
      next_page: number | null;
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

  const BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://127.0.0.1:8000' 
    : 'https://agasobanuye.fly.dev';

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
    
    const [visibleUpdates, setVisibleUpdates] = useState(0);
    const [visibleMovies, setVisibleMovies] = useState(0);
    const [visibleSeries, setVisibleSeries] = useState(0);
    const moviesScrollRef = useRef<HTMLDivElement>(null);
    const seriesScrollRef = useRef<HTMLDivElement>(null);
    const updatesScrollRef = useRef<HTMLDivElement>(null);
    const [trendingContent, setTrendingContent] = useState<TrendingItem[]>([]);
    const trendingScrollRef = useRef<HTMLDivElement>(null);
    const [infiniteContent, setInfiniteContent] = useState<InfiniteContentItem[]>([]);
    const [infinitePage, setInfinitePage] = useState(1);
    const [hasMoreContent, setHasMoreContent] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [contentType, setContentType] = useState<"all" | "movie" | "series">("all");
    const { preloadImages } = useImagePreloader();
    const initialLoadDone = useRef(false);

    const SKELETON_COUNT = 6;

    useEffect(() => {
      setBrowserSupport({
        transitions: supportsTransitions(),
        transforms: supportsTransforms()
      });
    }, []);

    // Add this useEffect to control global image loading
  useEffect(() => {
    // Set max concurrent loads to 2 for better performance
    imageQueue.setMaxConcurrent(2);
    
    // Clear queue on unmount
    return () => {
      imageQueue.clearQueue();
    };
  }, []);

    const fetchWithRetry = useCallback(async (url: string, retries = 3): Promise<Response> => {
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) return response;
        } catch (err) {
          console.log(`Fetch attempt ${i + 1} failed:`, err);
          if (i === retries - 1) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      throw new Error('Failed to fetch after retries');
    }, []);

    const fetchTrendingContent = useCallback(async () => {
      try {
        const response = await fetchWithRetry(`${BASE_URL}/trending`);
        const data = await response.json();
        setTrendingContent(data);
        
        // Preload trending images
        const imageUrls = data
          .slice(0, 6)
          .map((item: TrendingItem) => item.poster_url)
          .filter(Boolean);
        
        if (imageUrls.length > 0) {
          setTimeout(() => preloadImages(imageUrls, 2), 2000);
        }
      } catch (err) {
        console.error("Failed to fetch trending content:", err);
      }
    }, [fetchWithRetry, preloadImages]);

    const fetchAllData = useCallback(async () => {
      if (initialLoadDone.current) return;
      
      try {
        setLoading(true);
        
        const response = await fetchWithRetry(BASE_URL);
        const data = await response.json();

        setHeroContent([...data.hero_movies, ...data.hero_series]);
        setNonHeroMovies(data.non_hero_movies);
        setNonHeroSeries(data.non_hero_series);
        setLatestUpdates(data.latest_updates);

        // Progressive loading
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
            initialLoadDone.current = true;
          }
        }, 100); // Faster loading

        await fetchTrendingContent();

      } catch (err) {
        console.error("Failed to fetch content:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }, [fetchWithRetry, fetchTrendingContent]);

    useEffect(() => {
      fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
      const fetchInitialInfiniteContent = async () => {
        try {
          const response = await fetchWithRetry(
            `${BASE_URL}/home/infinite-content?page=1&limit=20&content_type=${contentType === "all" ? "" : contentType}`
          );
          const data: InfiniteContentResponse = await response.json();
          setInfiniteContent(data.data);
          setHasMoreContent(data.pagination.has_more);
          
          // Preload first batch of infinite content images
          const imageUrls = data.data
            .slice(0, 12)
            .map(item => item.poster_url)
            .filter(Boolean);
          
          if (imageUrls.length > 0) {
            preloadImages(imageUrls, 3);
          }
        } catch (err) {
          console.error("Failed to fetch infinite content:", err);
        }
      };

      if (!loading) {
        fetchInitialInfiniteContent();
      }
    }, [loading, contentType, fetchWithRetry, preloadImages]);

    const loadMoreContent = useCallback(async () => {
      if (isLoadingMore || !hasMoreContent) return;
      
      setIsLoadingMore(true);
      try {
        const nextPage = infinitePage + 1;
        const response = await fetchWithRetry(
          `${BASE_URL}/home/infinite-content?page=${nextPage}&limit=20&content_type=${contentType === "all" ? "" : contentType}`
        );
        
        const data: InfiniteContentResponse = await response.json();
        
        setInfiniteContent(prev => [...prev, ...data.data]);
        setInfinitePage(nextPage);
        setHasMoreContent(data.pagination.has_more);
        
        // Preload next batch of images
        const imageUrls = data.data
          .slice(0, 8)
          .map(item => item.poster_url)
          .filter(Boolean);
        
        if (imageUrls.length > 0) {
          preloadImages(imageUrls, 2);
        }
      } catch (err) {
        console.error("Failed to load more content:", err);
      } finally {
        setIsLoadingMore(false);
      }
    }, [infinitePage, hasMoreContent, isLoadingMore, contentType, fetchWithRetry, preloadImages]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreContent && !isLoadingMore) {
            loadMoreContent();
          }
        },
        { threshold: 0.1 }
      );

      const sentinel = document.getElementById('infinite-scroll-sentinel');
      if (sentinel) {
        observer.observe(sentinel);
      }

      return () => {
        if (sentinel) observer.unobserve(sentinel);
      };
    }, [hasMoreContent, isLoadingMore, loadMoreContent]);

    const handleContentTypeFilter = (type: "all" | "movie" | "series") => {
      setContentType(type);
      setInfinitePage(1);
      setInfiniteContent([]);
      setHasMoreContent(true);
    };

    useEffect(() => {
      if (heroContent.length === 0) return;

      const interval = setInterval(() => {
        if (!isHovered) {
          setCurrentSlide((prev) => (prev + 1) % heroContent.length);
        }
      }, 5000); // Slower auto-advance

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
        try {
          ref.current.scrollBy({ left: -300, behavior: "smooth" });
        } catch (e) {
          ref.current.scrollLeft -= 300;
        }
      }
    };

    const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        try {
          ref.current.scrollBy({ left: 300, behavior: "smooth" });
        } catch (e) {
          ref.current.scrollLeft += 300;
        }
      }
    };

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
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <Script
          src="https://3nbf4.com/act/files/tag.min.js?z=10481483"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <Script
          id="monetag-10481481"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s){
              s.dataset.zone='10481481',
              s.src='https://al5sm.com/tag.min.js'
            })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
        
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
                    <OptimizedImage
                      src={currentItem.poster_url}
                      alt={currentItem.title}
                      fill
                      priority
                      type={currentItem.type}
                      className="object-cover object-center"
                      sizes="100vw"
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
                      >
                        {item.poster_url ? (
                          <OptimizedImage
                            src={item.poster_url}
                            alt={item.title}
                            width={48}
                            height={48}
                            type={item.type}
                            className="object-cover w-full h-full"
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
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-400">Loading content...</p>
                </div>
              </div>
            )}
          </section>
        
          <WhatsAppCard />

          {/* Trending Section */}
          <section className="py-8 px-4 sm:px-6 md:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">🔥 Trending Now</h2>
            <div className="relative">
              <button
                onClick={() => scrollLeft(trendingScrollRef)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-white text-lg" />
              </button>
              <button
                onClick={() => scrollRight(trendingScrollRef)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all backdrop-blur-sm hidden sm:block"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-white text-lg" />
              </button>
              <div
                ref={trendingScrollRef}
                className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hidden snap-x snap-mandatory"
                style={{ scrollBehavior: browserSupport.transitions ? 'smooth' : 'auto' }}
              >
                {loading ? (
                  Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <div key={`skeleton-trending-${index}`} className="snap-start">
                      <SkeletonCard />
                    </div>
                  ))
                ) : trendingContent.length > 0 ? (
                  trendingContent.map((item, index) => (
                    <div
                      key={`trending-${item.id}-${item.type}`}
                      className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px] relative"
                    >
                      <Link
                        href={`/${item.type === "series" ? "series" : "movies"}/${encodeURIComponent(item.title)}`}
                        className="block h-full"
                      >
                        {item.pinned && item.position && (
                          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            #{item.position}
                          </div>
                        )}
                        
                        {item.pinned && (
                          <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            ⭐
                          </div>
                        )}
                        
                        {item.poster_url ? (
                          <div className="relative h-48 sm:h-56">
                            <OptimizedImage
                              src={item.poster_url}
                              alt={item.title}
                              fill
                              type={item.type}
                              sizes="(max-width: 640px) 150px, 180px"
                            />
                          </div>
                        ) : (
                          <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{item.title}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {item.type === 'movie' ? 'Movie' : 'Series'}
                            </span>
                            {item.release_year && (
                              <span className="text-xs text-gray-400">{item.release_year}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-8">
                    <p className="text-gray-400">No trending content available</p>
                  </div>
                )}
              </div>
            </div>
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
                {loading && visibleUpdates === 0
                  ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                      <div key={`skeleton-update-${index}`} className="snap-start">
                        <SkeletonCard />
                      </div>
                    ))
                  : latestUpdates.slice(0, visibleUpdates).map((update) => (
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
                              <OptimizedImage
                                src={update.content.poster_url}
                                alt={update.content.title}
                                fill
                                type={update.content.type}
                                sizes="(max-width: 640px) 150px, 180px"
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
    {update.type === "episode" 
      ? `Ep ${update.number}`  // For series: show episode number
      : update.translator       // For movies: show translator name
        ? `By ${update.translator}` 
        : `Part ${update.number}`} 
  </p>
</div>
                        </Link>
                      </div>
                    ))}
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
                    {loading && visibleMovies === 0
                      ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                          <div key={`skeleton-movie-${index}`} className="snap-start">
                            <SkeletonCard />
                          </div>
                        ))
                      : nonHeroMovies.slice(0, visibleMovies).map((movie) => (
                          <div
                            key={`${movie.type}-${movie.id}`}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                          >
                            <Link href={`/movies/${encodeURIComponent(movie.title)}`} className="block h-full">
                              {movie.poster_url ? (
                                <div className="relative h-48 sm:h-56">
                                  <OptimizedImage
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    fill
                                    type="movie"
                                    sizes="(max-width: 640px) 150px, 180px"
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
                    {loading && visibleSeries === 0
                      ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                          <div key={`skeleton-series-${index}`} className="snap-start">
                            <SkeletonCard />
                          </div>
                        ))
                      : nonHeroSeries.slice(0, visibleSeries).map((series) => (
                          <div
                            key={`${series.type}-${series.id}`}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all snap-start min-w-[150px] sm:min-w-[180px] max-w-[150px] sm:max-w-[180px]"
                          >
                            <Link href={`/series/${encodeURIComponent(series.title)}`} className="block h-full">
                              {series.poster_url ? (
                                <div className="relative h-48 sm:h-56">
                                  <OptimizedImage
                                    src={series.poster_url}
                                    alt={series.title}
                                    fill
                                    type="series"
                                    sizes="(max-width: 640px) 150px, 180px"
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
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Infinite Scroll Section */}
          <section className="py-8 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
                Browse All Content
              </h2>
            
              {/* Content Type Filter */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => handleContentTypeFilter("all")}
                    className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-l-lg transition-all ${
                      contentType === "all" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleContentTypeFilter("movie")}
                    className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium transition-all ${
                      contentType === "movie" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => handleContentTypeFilter("series")}
                    className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-r-lg transition-all ${
                      contentType === "series" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Series
                  </button>
                </div>
              </div>

              {/* Infinite Scroll Content Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {infiniteContent.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}-${index}`}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-blue-500/20 transition-all"
                  >
                    <Link 
                      href={`/${item.type === "series" ? "series" : "movies"}/${encodeURIComponent(item.title)}`}
                      className="block h-full"
                    >
                      {item.poster_url ? (
                        <div className="relative aspect-[2/3]">
                          <OptimizedImage
                            src={item.poster_url}
                            alt={item.title}
                            fill
                            type={item.type}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[2/3] bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                        {item.release_year && (
                          <p className="text-xs text-gray-400 mt-1">{item.release_year}</p>
                        )}
                        {item.genres && item.genres.length > 0 && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {item.genres.map(g => g.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              
                {/* Loading skeletons */}
                {(loading || isLoadingMore) && Array.from({ length: 6 }).map((_, index) => (
                  <div key={`skeleton-infinite-${index}`} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="aspect-[2/3] bg-gray-700 animate-pulse"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-600 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Sentinel */}
              <div id="infinite-scroll-sentinel" className="h-10 w-full flex items-center justify-center mt-8">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading more content...
                  </div>
                ) : hasMoreContent ? (
                  <div className="text-gray-400">Scroll down to load more</div>
                ) : (
                  <div className="text-gray-500">No more content to load</div>
                )}
              </div>
            </div>
          </section>
          <FloatingSocial />
        </main>
      </>
    );
  }
