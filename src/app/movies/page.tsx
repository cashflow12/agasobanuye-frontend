import type { Metadata } from 'next';
import MovieListClient from './MovieListClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


export const metadata: Metadata = {
  title: 'Movies | Agasobanuye - Browser Movies By Genre',
  description: 'Browse our collection of Agasobanuye movies by genre',
};

async function getMoviesByGenre() {
  try {
    const genresRes = await fetch(`${BASE_URL}/genres`);
    const allGenres = await genresRes.json();

    const genresWithMovies = await Promise.all(
      allGenres.map(async (genre: { id: number; name: string }) => {
        try {
          const moviesRes = await fetch(`${BASE_URL}/movies-by-genre/${genre.id}`);
          const movies = await moviesRes.json();
          return {
            id: genre.id,
            name: formatGenreName(genre.name),
            movies: Array.isArray(movies.movies) ? movies.movies : [],
          };
        } catch (err) {
          return { id: genre.id, name: formatGenreName(genre.name), movies: [] };
        }
      })
    );

    return genresWithMovies.filter((genre) => genre.movies.length > 0);
  } catch (err) {
    console.error('Error fetching movies:', err);
    return [];
  }
}

function formatGenreName(name: string) {
  const genreMap: Record<string, string> = {
    Action: "Action Films",
    Drama: "Drama Films",
    "Sci-Fi": "Sci-Fi Films",
    Adventure: "Adventure Films",
    Thriller: "Thriller Films",
    Comedy: "Comedy Films",
    Fantasy: "Fantasy Films",
    Horror: "Horror Films",
    Romance: "Romantic Films",
    Mystery: "Mystery Films",
  };
  return genreMap[name] || `${name} Films`;
}

export default async function MoviesPage() {
  const genres = await getMoviesByGenre();

  return <MovieListClient genres={genres} />;
}