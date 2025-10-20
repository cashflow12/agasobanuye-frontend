"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaHeart, FaRegHeart, FaArrowLeft, FaDownload, FaStar } from "react-icons/fa";
import { MdHighQuality } from "react-icons/md";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface SeriesDetail {
  id: number;
  title: string;
  description?: string;
  release_year?: number;
  translator?: string;
  language?: string;
  poster_url?: string;
  genres?: string[];
}

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  video_url: string;
  download_url?: string;
}

interface Recommendation {
  id: number;
  title: string;
  poster_url?: string;
  type: string;
}

interface RecommendationsResponse {
  data: Recommendation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

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

function BackButton({ router, browserSupport }: { router: any; browserSupport: any }) {
  return (
    <button
      onClick={() => router.back()}
      className="fixed top-4 left-4 z-50 p-3 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all group"
      aria-label="Go back"
    >
      <FaArrowLeft className="text-white text-xl group-hover:scale-110 transition-transform" />
    </button>
  );
}

function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className || ""}`}></div>
  );
}

function HeroSectionSkeleton() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/0 z-10"></div>
      <SkeletonLoader className="absolute inset-0" />
      <div className="relative z-20 flex flex-col justify-end h-full pb-12 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <SkeletonLoader className="h-12 w-64 rounded" />
            <div className="flex items-center gap-4 ml-auto">
              <SkeletonLoader className="h-8 w-16 rounded-full" />
              <SkeletonLoader className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <SkeletonLoader className="h-6 w-16 rounded-full" />
            <SkeletonLoader className="h-6 w-20 rounded-full" />
            <SkeletonLoader className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection({
  title,
  posterUrl,
  releaseYear,
  language,
  onFavoriteToggle,
  isFavorite,
  genres,
  browserSupport
}: {
  title: string;
  posterUrl?: string;
  releaseYear?: number;
  language?: string;
  onFavoriteToggle: () => void;
  isFavorite: boolean;
  genres?: string[];
  browserSupport: any;
}) {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/0 z-10"></div>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover object-center"
          priority
          quality={100}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-series.png";
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900"></div>
      )}
      <div className="relative z-20 flex flex-col justify-end h-full pb-12 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-2xl">
              {title}
            </h1>
            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={onFavoriteToggle}
                className="p-3 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all group"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
                ) : (
                  <FaRegHeart className="text-white text-xl group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {releaseYear && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm">
                {releaseYear}
              </span>
            )}
            {language && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm">
                {language}
              </span>
            )}
            {genres?.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EpisodeCardSkeleton() {
  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      <SkeletonLoader className="h-40 w-full" />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <SkeletonLoader className="h-6 w-32 rounded" />
          <SkeletonLoader className="h-5 w-12 rounded" />
        </div>
        <SkeletonLoader className="h-4 w-full rounded mb-4" />
        <div className="flex flex-wrap gap-2">
          <SkeletonLoader className="flex-1 h-10 rounded-lg" />
          <SkeletonLoader className="flex-1 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function EpisodeCard({ episode, browserSupport }: { episode: Episode; browserSupport: any }) {
  return (
    <div className={`group relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all ${
      browserSupport.transforms ? 'hover:-translate-y-1' : ''
    }`}>
      <div className="h-40 w-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <FaPlay className="text-white/30 text-4xl" />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">
            Episode {episode.episode_number}
          </h3>
          <span className="flex items-center gap-1 text-yellow-400 text-sm">
            <MdHighQuality /> HD
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {episode.title}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={episode.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all group"
          >
            <FaPlay className="text-xs group-hover:scale-110 transition-transform" />
            Watch
          </a>
          {episode.download_url && (
            <a
              href={episode.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg transition-all group"
            >
              <FaDownload className="text-xs group-hover:scale-110 transition-transform" />
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-6 text-white">{title}</h2>
      <p className="text-gray-300 leading-relaxed">{content}</p>
    </div>
  );
}

function DetailSectionSkeleton({ title }: { title: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-6 text-white">{title}</h2>
      <SkeletonLoader className="h-4 w-full rounded mb-2" />
      <SkeletonLoader className="h-4 w-3/4 rounded" />
    </div>
  );
}

function RecommendationCardSkeleton() {
  return (
    <div className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <SkeletonLoader className="h-48 w-full" />
      <div className="p-4">
        <SkeletonLoader className="h-6 w-3/4 rounded" />
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, browserSupport }: { recommendation: Recommendation; browserSupport: any }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/${recommendation.type}/${encodeURIComponent(recommendation.title)}`);
  };
  
  return (
    <div
      onClick={handleClick}
      className={`group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer ${
        browserSupport.transforms ? 'hover:-translate-y-1' : ''
      }`}
    >
      {recommendation.poster_url ? (
        <div className="relative h-48 w-full">
          <Image
            src={recommendation.poster_url}
            alt={recommendation.title}
            fill
            className="object-cover group-hover:opacity-80 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-series.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <FaPlay className="text-white/30 text-4xl" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white truncate">
          {recommendation.title}
        </h3>
      </div>
    </div>
  );
}

function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Error loading content</h1>
        <p className="text-xl mb-6">{message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
          >
            Go Back
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Content not found</h1>
      <button
        onClick={() => router.back()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mt-6"
      >
        Go Back
      </button>
    </div>
  );
}

// Simple fetch function without timeout for now
const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
};

export default function SeriesDetailClient({ params }: { params: { title: string } }) {
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [browserSupport, setBrowserSupport] = useState({
    transitions: true,
    transforms: true
  });
  
  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Detect browser capabilities
    setBrowserSupport({
      transitions: supportsTransitions(),
      transforms: supportsTransforms()
    });
  }, []);

  const fetchSeries = async () => {
    try {
      setError(null);
      setSeriesLoading(true);
      setEpisodesLoading(true);
      setRecommendationsLoading(true);
      setCurrentPage(1);
      setHasMore(true);

      if (!params?.title) {
        throw new Error("Title parameter is missing");
      }

      const cleanTitle = decodeURIComponent(params.title).replace(/%20/g, ' ').replace(/%2F/g, '/');
      console.log(`Fetching series: ${cleanTitle}`);

      try {
        const seriesResponse = await safeFetch(
          `${BASE_URL}/series/${encodeURIComponent(cleanTitle)}`
        );
        
        if (!seriesResponse.ok) {
          if (seriesResponse.status === 404) {
            throw new Error('Series not found');
          } else if (seriesResponse.status === 500) {
            throw new Error('Server error: Failed to load series');
          } else {
            throw new Error(`HTTP error! status: ${seriesResponse.status}`);
          }
        }
        
        const seriesData = await seriesResponse.json();
        setSeries(seriesData.series);
        setEpisodes(seriesData.episodes || []);
        setSeriesLoading(false);
        setEpisodesLoading(false);

        // Fetch initial recommendations (non-blocking)
        fetchRecommendations(1, seriesData.series?.id);
        
      } catch (fetchErr) {
        console.error('Fetch error:', fetchErr);
        
        // Create a fallback series object if the backend fails
        const fallbackSeries: SeriesDetail = {
          id: 0,
          title: cleanTitle,
          description: "Unable to load series details from server.",
          release_year: new Date().getFullYear(),
          language: "Unknown"
        };
        
        setSeries(fallbackSeries);
        setEpisodes([]);
        setSeriesLoading(false);
        setEpisodesLoading(false);
        
        // Still try to load recommendations
        fetchRecommendations(1);
        
        // Don't throw error for fallback case
        return;
      }
      
    } catch (err) {
      console.error("Failed to fetch series:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setSeriesLoading(false);
      setEpisodesLoading(false);
      setRecommendationsLoading(false);
    }
  };

  const fetchRecommendations = async (page: number, excludeId?: number) => {
    try {
      if (page === 1) {
        setRecommendationsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let url = `${BASE_URL}/recommendations/series?page=${page}&limit=12`;
      if (excludeId) {
        url += `&exclude_id=${excludeId}`;
      }
      
      console.log(`Fetching series recommendations from: ${url}`);
      
      const recommendationsResponse = await safeFetch(url);
      
      if (recommendationsResponse.ok) {
        const data: RecommendationsResponse = await recommendationsResponse.json();
        
        if (page === 1) {
          setRecommendations(data.data);
        } else {
          setRecommendations(prev => [...prev, ...data.data]);
        }
        
        setCurrentPage(data.pagination.page);
        setHasMore(data.pagination.has_more);
        console.log(`Loaded page ${page}, has more: ${data.pagination.has_more}, total items: ${data.data.length}`);
      } else {
        console.warn('Failed to fetch recommendations, using empty list');
        setRecommendations([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
      setHasMore(false);
    } finally {
      if (page === 1) {
        setRecommendationsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Load more function - defined BEFORE useEffect
  const loadMoreRecommendations = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      console.log(`Loading page ${currentPage + 1}`);
      fetchRecommendations(currentPage + 1, series?.id);
    }
  }, [currentPage, hasMore, isLoadingMore, series]);

  // SIMPLIFIED Intersection Observer - This should work
  useEffect(() => {
    const currentElement = loadMoreRef.current;
    if (!currentElement || !hasMore || isLoadingMore) return;

    console.log('Setting up Intersection Observer for series...');

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        console.log('Series observer triggered:', firstEntry.isIntersecting);
        
        if (firstEntry.isIntersecting && hasMore && !isLoadingMore) {
          console.log('Loading more series content!');
          loadMoreRecommendations();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Load when 200px away from viewport
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [hasMore, isLoadingMore, loadMoreRecommendations]);

  // Alternative: Scroll event listener as backup
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoadingMore) return;

      const loadMoreElement = loadMoreRef.current;
      if (!loadMoreElement) return;

      const rect = loadMoreElement.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight + 500; // 500px before viewport

      if (isVisible && hasMore && !isLoadingMore) {
        console.log('Scroll detected - loading more series');
        loadMoreRecommendations();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMoreRecommendations]);

  useEffect(() => {
    fetchSeries();
  }, [params.title]);

  // Manual load more button handler
  const handleManualLoadMore = () => {
    loadMoreRecommendations();
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (error && !series) {
    return <ErrorDisplay message={error} onRetry={fetchSeries} />;
  }

  if (!seriesLoading && !series) {
    return <NotFound />;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <BackButton router={router} browserSupport={browserSupport} />

      {seriesLoading ? (
        <HeroSectionSkeleton />
      ) : (
        series && (
          <HeroSection
            title={series.title}
            posterUrl={series.poster_url}
            releaseYear={series.release_year}
            language={series.language}
            onFavoriteToggle={() => toggleFavorite(series.id)}
            isFavorite={favorites.includes(series.id)}
            genres={series.genres}
            browserSupport={browserSupport}
          />
        )
      )}

      <div className="py-12 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <div className="max-w-6xl mx-auto">
          {seriesLoading ? (
            <>
              <DetailSectionSkeleton title="Overview" />
              <DetailSectionSkeleton title="Translation" />
            </>
          ) : (
            series && (
              <>
                {series.description && (
                  <DetailSection title="Overview" content={series.description} />
                )}
                {series.translator && (
                  <DetailSection
                    title="Translation"
                    content={`Translated by: ${series.translator}`}
                  />
                )}
              </>
            )
          )}

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-white">Episodes</h2>
            {episodesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <EpisodeCardSkeleton key={index} />
                ))}
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {episodes.map((episode) => (
                  <EpisodeCard 
                    key={episode.id} 
                    episode={episode} 
                    browserSupport={browserSupport}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">
                {series && series.id === 0 ? "Server unavailable - episodes cannot be loaded" : "No episodes available yet"}
              </p>
            )}
          </div>

          {/* Infinite Scroll Recommendations Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-white">You Might Also Like</h2>
            
            {recommendationsLoading && currentPage === 1 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, index) => (
                  <RecommendationCardSkeleton key={index} />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {recommendations.map((rec, index) => (
                    <RecommendationCard 
                      key={`${rec.id}-${rec.title}-${index}`} 
                      recommendation={rec} 
                      browserSupport={browserSupport}
                    />
                  ))}
                </div>
                
                {/* Load more section - ALWAYS RENDER THIS WHEN hasMore is true */}
                {hasMore && (
                  <div className="mt-8 border-t border-gray-700">
                    <div 
                      ref={loadMoreRef} 
                      className="flex flex-col items-center justify-center py-12 min-h-[200px]"
                    >
                      {isLoadingMore ? (
                        <div className="text-center">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full mb-6">
                            {[...Array(6)].map((_, index) => (
                              <RecommendationCardSkeleton key={index} />
                            ))}
                          </div>
                          <p className="text-blue-400 text-lg">Loading more series...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="animate-bounce text-blue-400 text-4xl mb-4">↓</div>
                          <p className="text-gray-400 text-lg mb-4">Keep scrolling to discover more series</p>
                          {/* Manual load button as backup */}
                          <button
                            onClick={handleManualLoadMore}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                          >
                            Load More Series
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {!hasMore && recommendations.length > 0 && (
                  <div className="text-center mt-8 py-12 text-gray-500 border-t border-gray-700">
                    <p className="text-xl">🎉 You've reached the end of recommendations</p>
                    <p className="text-sm mt-2">Found {recommendations.length} amazing series for you</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-12">
                {recommendationsLoading ? "Loading recommendations..." : "No recommendations available"}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
