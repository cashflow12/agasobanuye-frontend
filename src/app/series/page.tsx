import type { Metadata } from 'next';
import SeriesListClient from './SeriesClient';

export const dynamic = 'force-dynamic'; // Add this line



export const metadata: Metadata = {
  title: 'TV Series | Agasobanuye by Genre',
  description: 'Browse our collection of Agasobanuye TV series by genre',
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


async function getSeriesByGenre() {
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const genresRes = await fetch(`${BASE_URL}/genres${cacheBuster}`);
    const allGenres = await genresRes.json();

    const genresWithSeries = await Promise.all(
      allGenres.map(async (genre: { id: number; name: string }) => {
        try {
          const seriesRes = await fetch(`${BASE_URL}/series-by-genre/${genre.id}${cacheBuster}`);
          const series = await seriesRes.json();
          return {
            id: genre.id,
            name: formatGenreName(genre.name),
            series: Array.isArray(series.series) ? series.series : [],
          };
        } catch (err) {
          return { id: genre.id, name: formatGenreName(genre.name), series: [] };
        }
      })
    );

    return genresWithSeries.filter((genre) => genre.series.length > 0);
  } catch (err) {
    console.error('Error fetching series:', err);
    return [];
  }
}

function formatGenreName(name: string) {
  const genreMap: Record<string, string> = {
    Action: "Action Series",
    Drama: "Drama Series",
    "Sci-Fi": "Sci-Fi Series",
    Adventure: "Adventure Series",
    Thriller: "Thriller Series",
    Comedy: "Comedy Series",
    Fantasy: "Fantasy Series",
    Horror: "Horror Series",
    Romance: "Romantic Series",
    Mystery: "Mystery Series",
  };
  return genreMap[name] || `${name} Series`;
}

export default async function SeriesPage() {
  const genres = await getSeriesByGenre();
  return <SeriesListClient genres={genres} />;
}