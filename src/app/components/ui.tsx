"use client";

import { FaArrowLeft, FaHeart, FaRegHeart, FaPlay } from "react-icons/fa";
import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-red-500">
      <h1 className="text-2xl font-bold">Error loading content</h1>
      <p>{message}</p>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Content not found</h1>
    </div>
  );
}

export function BackButton({ router }: { router: any }) {
  return (
    <button 
      onClick={() => router.back()}
      className="fixed top-4 left-4 z-50 p-3 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
    >
      <FaArrowLeft className="text-white text-xl" />
    </button>
  );
}

interface HeroProps {
  title: string;
  posterUrl?: string;
  releaseYear?: number;
  language?: string;
  onFavoriteToggle: () => void;
  isFavorite: boolean;
}

export function HeroSection({ title, posterUrl, releaseYear, language, onFavoriteToggle, isFavorite }: HeroProps) {
  return (
    <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900"></div>
      )}
      
      <div className="relative z-20 flex flex-col justify-end h-full pb-12 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              {title}
            </h1>
            <button
              onClick={onFavoriteToggle}
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-white text-xl" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-white">
            {releaseYear && <span>{releaseYear}</span>}
            {language && (
              <span className="px-2 py-1 text-xs bg-white/20 rounded">
                {language}
              </span>
            )}
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
            <FaPlay /> Watch Now
          </button>
        </div>
      </div>
    </section>
  );
}

export function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-700">{content}</p>
    </div>
  );
}