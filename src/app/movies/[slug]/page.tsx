import type { Metadata } from 'next';
import MovieClient from './MovieClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function generateMetadata({ params }: { 
  params: { slug: string } 
}): Promise<Metadata> {
  if (!params?.slug) {
    return {
      title: "Movie | Agasobanuye",
      description: "Explore movies on Agasobanuye",
    };
  }

  try {
    const title = decodeURIComponent(params.slug);
    
    // Add timeout for older servers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${BASE_URL}/movie/${encodeURIComponent(title)}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        title: "Movie Not Found | Agasobanuye",
        description: "The requested movie could not be found.",
      };
    }

    const data = await response.json();
    const movie = data.movie;

    return {
      title: `${movie.title} | Agasobanuye`,
      description: movie.description || `Watch ${movie.title}`,
      openGraph: {
        title: `${movie.title}`,
        description: movie.description || `Watch ${movie.title}`,
        images: movie.poster_url ? [{ url: movie.poster_url }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${movie.title}`,
        description: movie.description || `Watch ${movie.title}`,
        images: movie.poster_url ? [movie.poster_url] : [],
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: "Movie | Agasobanuye",
      description: "Explore movies on Agasobanuye",
    };
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  // Ensure proper decoding and error handling
  let title = params.slug;
  try {
    title = decodeURIComponent(params.slug);
  } catch (error) {
    console.error('Error decoding title:', error);
    // Fallback to original slug if decoding fails
  }
  
  return <MovieClient params={{ title }} />;
}