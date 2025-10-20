import type { Metadata } from 'next';
import SeriesDetailClient from './SeriesDetailClient';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper function to construct absolute URL for paths
const getAbsoluteUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export async function generateMetadata({ params }: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const defaultMetadata = {
    title: "Series | Agasobanuye",
    description: "Explore series on Agasobanuye"
  };

  // Return default metadata during build to avoid API calls
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    const title = decodeURIComponent(params.slug || '');
    return {
      title: `${title} | Agasobanuye`,
      description: `Watch ${title} on Agasobanuye`,
    };
  }

  if (!params?.slug) {
    return defaultMetadata;
  }

  try {
    const title = decodeURIComponent(params.slug);
    
    // Add timeout for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${BASE_URL}/series/${encodeURIComponent(title)}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ...defaultMetadata,
        title: "Series Not Found | Agasobanuye"
      };
    }

    const data = await response.json();
    const series = data.series;

    // Use the original image URL directly
    const posterUrl = series.poster_url;
    const description = series.description || `Watch ${series.title} on Agasobanuye`;

    // For TMDB images, we can extract the higher resolution version
    const highResPosterUrl = posterUrl?.includes('/w600_and_h900_bestv2') 
      ? posterUrl.replace('/w600_and_h900_bestv2', '/original')
      : posterUrl;

    const images = posterUrl ? [
      {
        url: highResPosterUrl || posterUrl,
        width: 800,
        height: 1200,
        alt: `${series.title} poster`,
      }
    ] : [];

    const metadata: Metadata = {
      title: `${series.title} | Agasobanuye`,
      description,
      openGraph: {
        title: `${series.title}`,
        description,
        url: getAbsoluteUrl(`/series/${params.slug}`),
        type: 'video.tv_show',
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: `${series.title}`,
        description,
        images: images.map(img => img.url),
      },
      alternates: {
        canonical: getAbsoluteUrl(`/series/${params.slug}`),
      },
    };

    // Add additional metadata if available
    if (series.release_year) {
      metadata.keywords = [...(series.genres || []), series.title, 'TV series', 'streaming'];
    }

    return metadata;
  } catch (error) {
    console.error('Metadata generation error:', error);
    return defaultMetadata;
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const title = decodeURIComponent(params.slug || '');
  return <SeriesDetailClient params={{ title }} />;
}
