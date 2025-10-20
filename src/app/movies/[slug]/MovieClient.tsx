"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaHeart, FaRegHeart, FaArrowLeft, FaDownload, FaStar, FaLanguage, FaCalendarAlt } from "react-icons/fa";

export const runtime = 'edge';

interface MovieDetail {
  id: number;
  title: string;
  description?: string;
  release_year?: number;
  translator?: string;
  language?: string;
  poster_url?: string;
  rating?: number;
  genres?: string[];
}

interface Part {
  part_number: number;
  title: string;
  video_url: string;
  download_url: string;
  duration?: string;
  quality?: string;
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

function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className || ""}`}></div>
  );
}

function HeroSectionSkeleton() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent z-10"></div>
      <SkeletonLoader className="absolute inset-0" />
      <div className="relative z-20 flex flex-col justify-end h-full pb-16 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <SkeletonLoader className="h-12 w-64 rounded" />
            <SkeletonLoader className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <SkeletonLoader className="h-6 w-20 rounded-full" />
            <SkeletonLoader className="h-6 w-24 rounded-full" />
            <SkeletonLoader className="h-6 w-28 rounded-full" />
            <SkeletonLoader className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PartsSectionSkeleton() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-blue-400">All Parts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-700/50 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <SkeletonLoader className="h-6 w-48 rounded" />
                <SkeletonLoader className="h-5 w-12 rounded" />
              </div>
              <SkeletonLoader className="h-4 w-32 rounded mb-4" />
              <div className="flex gap-3">
                <SkeletonLoader className="flex-1 h-10 rounded" />
                <SkeletonLoader className="flex-1 h-10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewSectionSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Synopsis</h2>
        <SkeletonLoader className="h-4 w-full rounded mb-2" />
        <SkeletonLoader className="h-4 w-3/4 rounded" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Translation</h2>
        <SkeletonLoader className="h-4 w-1/2 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Details</h2>
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-40 rounded" />
            <SkeletonLoader className="h-4 w-48 rounded" />
            <SkeletonLoader className="h-4 w-36 rounded" />
            <div className="flex flex-wrap gap-2">
              <SkeletonLoader className="h-6 w-20 rounded" />
              <SkeletonLoader className="h-6 w-24 rounded" />
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <SkeletonLoader className="w-64 h-96 rounded-lg" />
        </div>
      </div>
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
    router.push(`/movies/${encodeURIComponent(recommendation.title)}`);
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
              (e.target as HTMLImageElement).src = "/placeholder.png";
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

export default function MovieClient({ params }: { params: { title: string } }) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [movieLoading, setMovieLoading] = useState(true);
  const [partsLoading, setPartsLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'parts'>('overview');
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

  const fetchMovie = async () => {
    try {
      setError(null);
      setMovieLoading(true);
      setPartsLoading(true);
      setRecommendationsLoading(true);
      setCurrentPage(1);
      setHasMore(true);

      const decodedTitle = decodeURIComponent(params.title);

      // Fetch movie details
      const movieResponse = await safeFetch(
        `${BASE_URL}/movie/${encodeURIComponent(decodedTitle)}`
      );
      
      if (!movieResponse.ok) throw new Error(`HTTP error! status: ${movieResponse.status}`);
      
      const movieData = await movieResponse.json();
      setMovie(movieData.movie);
      setParts(movieData.parts || []);
      setMovieLoading(false);
      setPartsLoading(false);

      // Fetch initial recommendations using the new endpoint
      fetchRecommendations(1, movieData.movie?.id);
      
    } catch (err) {
      console.error("Failed to fetch movie:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setMovieLoading(false);
      setPartsLoading(false);
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

      let url = `${BASE_URL}/recommendations/movies?page=${page}&limit=12`;
      if (excludeId) {
        url += `&exclude_id=${excludeId}`;
      }
      
      console.log(`Fetching recommendations from: ${url}`);
      
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
      fetchRecommendations(currentPage + 1, movie?.id);
    }
  }, [currentPage, hasMore, isLoadingMore, movie]);

  // SIMPLIFIED Intersection Observer - This should work
  useEffect(() => {
    const currentElement = loadMoreRef.current;
    if (!currentElement || !hasMore || isLoadingMore) return;

    console.log('Setting up Intersection Observer...');

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        console.log('Observer triggered:', firstEntry.isIntersecting);
        
        if (firstEntry.isIntersecting && hasMore && !isLoadingMore) {
          console.log('Loading more content!');
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
        console.log('Scroll detected - loading more');
        loadMoreRecommendations();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMoreRecommendations]);

  useEffect(() => {
    fetchMovie();
  }, [params.title]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Manual load more button handler
  const handleManualLoadMore = () => {
    loadMoreRecommendations();
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">Error loading content</h1>
          <p className="text-xl">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movieLoading && !movie) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">Content not found</h1>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 p-3 bg-gray-800/80 hover:bg-gray-700/90 rounded-full backdrop-blur-sm transition-all shadow-lg"
      >
        <FaArrowLeft className="text-white text-xl" />
      </button>

      {movieLoading ? (
        <HeroSectionSkeleton />
      ) : (
        movie && (
          <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent z-10"></div>
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover object-center"
                priority
                quality={100}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900"></div>
            )}
            <div className="relative z-20 flex flex-col justify-end h-full pb-16 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-2xl">
                    {movie.title}
                  </h1>
                  <button
                    onClick={() => toggleFavorite(movie.id)}
                    className="p-3 bg-gray-800/80 hover:bg-gray-700/90 rounded-full backdrop-blur-sm transition-all shadow-lg"
                    aria-label={favorites.includes(movie.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.includes(movie.id) ? (
                      <FaHeart className="text-red-500 text-2xl" />
                    ) : (
                      <FaRegHeart className="text-white text-2xl" />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-8 text-white">
                  {movie.rating && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-yellow-600/80 rounded-full text-sm font-medium">
                      <FaStar className="text-yellow-300" /> {movie.rating}/10
                    </span>
                  )}
                  {movie.release_year && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-700/80 rounded-full text-sm font-medium">
                      <FaCalendarAlt /> {movie.release_year}
                    </span>
                  )}
                  {movie.language && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-700/80 rounded-full text-sm font-medium">
                      <FaLanguage /> {movie.language}
                    </span>
                  )}
                  {movie.genres?.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700/80 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      )}

      <section className="relative z-20 py-12 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 -mt-20">
        <div className="max-w-6xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-lg transition-all ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('parts')}
                className={`px-6 py-4 font-medium text-lg transition-all ${activeTab === 'parts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Parts ({parts.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' ? (
              movieLoading ? (
                <OverviewSectionSkeleton />
              ) : (
                movie && (
                  <div className="space-y-8">
                    {movie.description && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Synopsis</h2>
                        <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                      </div>
                    )}
                    {movie.translator && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Translation</h2>
                        <p className="text-gray-300">Translated by: {movie.translator}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Details</h2>
                        <div className="space-y-2">
                          <p className="text-gray-300"><span className="font-medium">Release Year:</span> {movie.release_year}</p>
                          <p className="text-gray-300"><span className="font-medium">Language:</span> {movie.language}</p>
                          {movie.rating && <p className="text-gray-300"><span className="font-medium">Rating:</span> {movie.rating}/10</p>}
                          {movie.genres && movie.genres.length > 0 && (
                            <div>
                              <p className="font-medium">Genres:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {movie.genres.map((genre, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-700 rounded text-sm">
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {movie.poster_url && (
                        <div className="flex justify-center">
                          <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-xl">
                            <Image
                              src={movie.poster_url}
                              alt={movie.title}
                              fill
                              className="object-cover"
                              quality={100}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.png";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              partsLoading ? (
                <PartsSectionSkeleton />
              ) : (
                <PartsSection parts={parts} browserSupport={browserSupport} />
              )
            )}

            {/* Infinite Scroll Recommendations Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-blue-400">You Might Also Like</h2>
              
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
                            <p className="text-blue-400 text-lg">Loading more recommendations...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="animate-bounce text-blue-400 text-4xl mb-4">↓</div>
                            <p className="text-gray-400 text-lg mb-4">Keep scrolling to discover more movies</p>
                            {/* Manual load button as backup */}
                            <button
                              onClick={handleManualLoadMore}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                            >
                              Load More Movies
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!hasMore && recommendations.length > 0 && (
                    <div className="text-center mt-8 py-12 text-gray-500 border-t border-gray-700">
                      <p className="text-xl">🎉 You've reached the end of recommendations</p>
                      <p className="text-sm mt-2">Found {recommendations.length} amazing movies for you</p>
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
      </section>
    </main>
  );
}

function PartsSection({ parts, browserSupport }: { parts: Part[]; browserSupport: any }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-blue-400">All Parts</h2>
      {parts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts.map((part) => (
            <div 
              key={part.part_number} 
              className={`bg-gray-700/50 hover:bg-gray-700/70 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                browserSupport.transforms ? 'hover:-translate-y-1' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">
                    Part {part.part_number}: <span className="text-blue-400">{part.title}</span>
                  </h3>
                  {part.quality && (
                    <span className="px-2 py-1 bg-blue-600/80 text-xs font-bold rounded">
                      {part.quality}
                    </span>
                  )}
                </div>
                {part.duration && (
                  <p className="text-gray-400 text-sm mb-4">
                    Duration: {part.duration}
                  </p>
                )}
                <div className="flex gap-3">
                  <a
                    href={part.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
                  >
                    <FaPlay size={14} /> Watch
                  </a>
                  <a
                    href={part.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
                  >
                    <FaDownload size={14} /> Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-xl">No parts available for this movie</p>
        </div>
      )}
    </div>
  );
}
