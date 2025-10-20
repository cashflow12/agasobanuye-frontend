"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch, FaTimes, FaBars } from "react-icons/fa";
import { useDebounce } from "use-debounce";

interface ContentItem {
  id: number;
  title: string;
  poster_url?: string;
  type: "movie" | "series";
  release_year?: number;
  language?: string;
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length >= 1) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `${BASE_URL}/autocomplete?q=${encodeURIComponent(debouncedQuery)}`
          );
          if (!response.ok) {
            throw new Error("Autocomplete failed");
          }
          const data = await response.json();
          console.log("API Response:", data); // Debug API response
          setSearchResults([...data.movies, ...data.series]);
          setShowSearchResults(true);
        } catch (err) {
          console.error("Autocomplete error:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Click outside handler for desktop and mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node);
      if (isOutsideDesktop && isOutsideMobile) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setIsMobileMenuOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">Agasobanuye</span>
          </Link>
          <button
            className="md:hidden text-white p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/movies" className="text-gray-300 hover:text-white transition-colors">
              Movies
            </Link>
            <Link href="/series" className="text-gray-300 hover:text-white transition-colors">
              Series
            </Link>
            <Link href="/favorites" className="text-gray-300 hover:text-white transition-colors">
              Favorites
            </Link>
          </div>
          <div className="hidden md:block flex-1 max-w-md mx-4 relative" ref={desktopSearchRef}>
            <form onSubmit={handleSearch}>
              <div
                className={`relative flex items-center transition-all duration-200 ${
                  isSearchFocused ? "ring-2 ring-blue-500" : ""
                } bg-gray-800 rounded-full`}
              >
                <FaSearch className="absolute left-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 1) {
                      setShowSearchResults(true);
                    } else {
                      setShowSearchResults(false);
                    }
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.length >= 1 && searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search movies, series..."
                  className="w-full pl-12 pr-10 py-2 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  aria-autocomplete="list"
                  aria-controls="search-results"
                  aria-expanded={showSearchResults}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
                    aria-label="Search"
                  >
                    Search
                  </button>
                )}
              </div>
            </form>
            {showSearchResults && (
              <div
                id="search-results"
                className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-[100] max-h-96 overflow-y-auto border border-gray-700 pointer-events-auto"
              >
                {isSearching ? (
                  <div className="p-4 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-300">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((item) => (
                      <li
                        key={`${item.type}-${item.id}`}
                        className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors pointer-events-auto"
                      >
                        <Link
                          href={`/${item.type === "series" ? "series" : "movies"}/${encodeURIComponent(item.title)}`}
                          className="block p-4 flex items-center pointer-events-auto"
                          onClick={() => {
                            console.log("Clicked item:", item.title, item.id); // Debug click
                            setSearchQuery("");
                            setShowSearchResults(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          {item.poster_url ? (
                            <div className="w-12 h-12 mr-4 relative flex-shrink-0">
                              <img
                                src={item.poster_url}
                                alt={item.title}
                                className="object-cover rounded w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 mr-4 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-300">{item.type === "movie" ? "M" : "S"}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                                {item.type}
                              </span>
                              {item.release_year && (
                                <span className="text-xs text-gray-400">{item.release_year}</span>
                              )}
                              {item.language && (
                                <span className="text-xs text-gray-400 truncate">{item.language}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : debouncedQuery.length >= 1 ? (
                  <div className="p-4 text-gray-400 text-center">
                    No suggestions found for "{debouncedQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <div
          className={`md:hidden fixed top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-y-0 opacity-100 z-[60]" : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="mb-4 relative" ref={mobileSearchRef}>
              <form onSubmit={handleSearch}>
                <div
                  className={`relative flex items-center transition-all duration-200 ${
                    isSearchFocused ? "ring-2 ring-blue-500" : ""
                  } bg-gray-800 rounded-full`}
                >
                  <FaSearch className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length >= 1) {
                        setShowSearchResults(true);
                      } else {
                        setShowSearchResults(false);
                      }
                    }}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      if (searchQuery.length >= 1 && searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search movies, series..."
                    className="w-full pl-12 pr-10 py-2 bg-transparent border-none outline-none text-white placeholder-gray-400"
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-expanded={showSearchResults}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-12 p-2 text-gray-400 hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      type="submit"
                      className="absolute right-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
                      aria-label="Search"
                    >
                      Search
                    </button>
                  )}
                </div>
              </form>
              {showSearchResults && (
                <div
                  id="search-results"
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-[100] max-h-96 overflow-y-auto border border-gray-700 pointer-events-auto"
                >
                  {isSearching ? (
                    <div className="p-4 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-300">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((item) => (
                        <li
                          key={`${item.type}-${item.id}`}
                          className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors pointer-events-auto"
                        >
                          <Link
                            href={`/${item.type === "series" ? "series" : "movies"}/${encodeURIComponent(item.title)}`}
                            className="block p-4 flex items-center pointer-events-auto"
                            onClick={() => {
                              console.log("Clicked item:", item.title, item.id); // Debug click
                              setSearchQuery("");
                              setShowSearchResults(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {item.poster_url ? (
                              <div className="w-12 h-12 mr-4 relative flex-shrink-0">
                                <img
                                  src={item.poster_url}
                                  alt={item.title}
                                  className="object-cover rounded w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 mr-4 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-gray-300">{item.type === "movie" ? "M" : "S"}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white truncate">{item.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                                  {item.type}
                                </span>
                                {item.release_year && (
                                  <span className="text-xs text-gray-400">{item.release_year}</span>
                                )}
                                {item.language && (
                                  <span className="text-xs text-gray-400 truncate">{item.language}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : debouncedQuery.length >= 1 ? (
                    <div className="p-4 text-gray-400 text-center">
                      No suggestions found for "{debouncedQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-4">
              <Link
                href="/movies"
                className="text-gray-300 hover:text-white transition-colors text-lg py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/series"
                className="text-gray-300 hover:text-white transition-colors text-lg py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Series
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}