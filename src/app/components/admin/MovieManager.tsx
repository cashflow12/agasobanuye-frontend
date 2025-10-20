"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MoreVertical, Plus, Trash2, Edit, X } from "lucide-react";
import { authFetch } from "@/app/lib/api";

type Movie = {
  id: number;
  title: string;
  description: string;
  release_year: number;
  translator: string;
  language: string;
  poster_url: string;
};

type MoviePart = {
  id: number;
  movie_id: number;
  part_number: number;
  title: string;
  download_url: string;
  video_url: string;
};

type Genre = {
  id: number;
  name: string;
};

function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-700 to-gray-600 rounded ${className || ""}`}></div>
  );
}


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function MoviesTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
            <TableHead className="text-white">Title</TableHead>
            <TableHead className="hidden sm:table-cell text-white">Year</TableHead>
            <TableHead className="hidden md:table-cell text-white">Language</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index} className="hover:bg-gray-700/50">
              <TableCell><SkeletonLoader className="h-5 w-3/4" /></TableCell>
              <TableCell className="hidden sm:table-cell"><SkeletonLoader className="h-5 w-16" /></TableCell>
              <TableCell className="hidden md:table-cell"><SkeletonLoader className="h-5 w-20" /></TableCell>
              <TableCell><SkeletonLoader className="h-5 w-10" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PartsTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
            <TableHead className="text-white">Part #</TableHead>
            <TableHead className="text-white">Title</TableHead>
            <TableHead className="hidden sm:table-cell text-white">Download</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, index) => (
            <TableRow key={index} className="hover:bg-gray-700/50">
              <TableCell><SkeletonLoader className="h-5 w-12" /></TableCell>
              <TableCell><SkeletonLoader className="h-5 w-3/4" /></TableCell>
              <TableCell className="hidden sm:table-cell"><SkeletonLoader className="h-5 w-20" /></TableCell>
              <TableCell><SkeletonLoader className="h-5 w-10" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function GenresSectionSkeleton() {
  return (
    <div className="space-y-2">
      <h4 className="text-lg font-semibold text-white">Genres</h4>
      <div className="flex flex-wrap gap-2">
        {[...Array(3)].map((_, index) => (
          <SkeletonLoader key={index} className="h-6 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function MovieManager() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [parts, setParts] = useState<MoviePart[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [loading, setLoading] = useState({
    movies: true,
    parts: false,
    genres: false,
    movieGenres: false,
  });
  const [movieFormData, setMovieFormData] = useState({
    id: 0,
    title: "",
    description: "",
    release_year: "",
    translator: "",
    language: "",
    poster_url: "",
  });
  const [editingPart, setEditingPart] = useState<MoviePart | null>(null);
  const [isEditingPart, setIsEditingPart] = useState(false);
  const [partForms, setPartForms] = useState<
    Array<{
      id?: number;
      part_number: string;
      title: string;
      download_url: string;
      video_url: string;
    }>
  >([{ part_number: "", title: "", download_url: "", video_url: "" }]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await authFetch(
  `${BASE_URL}/movies`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      toast.error("Failed to load movies");
    } finally {
      setLoading((prev) => ({ ...prev, movies: false }));
    }
  };

  const fetchGenres = async () => {
    setLoading((prev) => ({ ...prev, genres: true }));
    try {
      const response = await authFetch(`${BASE_URL}/genres`);
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      toast.error("Failed to load genres");
    } finally {
      setLoading((prev) => ({ ...prev, genres: false }));
    }
  };

  const fetchMovieGenres = async (movieId: number) => {
    setLoading((prev) => ({ ...prev, movieGenres: true }));
    try {
      const response = await authFetch(`${BASE_URL}/movies/${movieId}/genres`);
      const data = await response.json();
      setMovieGenres(data);
      setSelectedGenreIds(data.map((genre: Genre) => genre.id));
    } catch (error) {
      toast.error("Failed to load movie genres");
    } finally {
      setLoading((prev) => ({ ...prev, movieGenres: false }));
    }
  };

  const fetchParts = async (movieId: number) => {
    setLoading((prev) => ({ ...prev, parts: true }));
    try {
      const response = await authFetch(`${BASE_URL}/movies/${movieId}/parts`);
      const data = await response.json();
      setParts(data);
    } catch (error) {
      toast.error("Failed to load parts");
    } finally {
      setLoading((prev) => ({ ...prev, parts: false }));
    }
  };

  const handleEditMovie = async (movie: Movie) => {
    setIsEditMode(true);
    setIsEditDialogOpen(true);
    setMovieFormData({
      id: movie.id,
      title: movie.title,
      description: movie.description || "",
      release_year: movie.release_year.toString(),
      translator: movie.translator || "",
      language: movie.language || "",
      poster_url: movie.poster_url || "",
    });

    try {
      const [partsResponse, genresResponse] = await Promise.all([
        authFetch(`${BASE_URL}/movies/${movie.id}/parts`),
        authFetch(`${BASE_URL}/movies/${movie.id}/genres`),
      ]);
      const partsData = await partsResponse.json();
      const genresData = await genresResponse.json();

      const formattedParts = partsData.map((part: any) => ({
        id: part.id,
        part_number: part.part_number.toString(),
        title: part.title || "",
        download_url: part.download_url || "",
        video_url: part.video_url || "",
      }));

      setPartForms(formattedParts.length > 0 ? formattedParts : 
        [{ part_number: "", title: "", download_url: "", video_url: "" }]);
      setParts(partsData);
      setMovieGenres(genresData);
      setSelectedGenreIds(genresData.map((genre: Genre) => genre.id));
    } catch (error) {
      toast.error("Failed to load movie data for editing");
      console.error("Error loading data:", error);
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    try {
      const response = await authFetch(`${BASE_URL}/admin/movies/${movieId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMovies(movies.filter((movie) => movie.id !== movieId));
        if (selectedMovie?.id === movieId) {
          setSelectedMovie(null);
          setParts([]);
          setMovieGenres([]);
          setSelectedGenreIds([]);
        }
        toast.success("Movie deleted successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      toast.error("Failed to delete movie");
      console.error("Deletion error:", error);
    }
  };

  const handleEditPart = async (partId: number) => {
    try {
      const response = await authFetch(`${BASE_URL}/admin/movie-parts/${partId}`);
      const part = await response.json();
      setEditingPart(part);
      setIsEditingPart(true);
      setPartForms([
        {
          id: part.id,
          part_number: part.part_number.toString(),
          title: part.title || "",
          download_url: part.download_url || "",
          video_url: part.video_url || "",
        },
      ]);
    } catch (error) {
      toast.error("Failed to load part for editing");
      console.error("Error loading part:", error);
    }
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart || !selectedMovie) {
      toast.error("No part or movie selected");
      return;
    }
    if (!partForms[0].download_url.trim()) {
      toast.error("Download URL is required");
      return;
    }

    try {
      const payload = {
        part_number: parseInt(partForms[0].part_number),
        title: partForms[0].title,
        download_url: partForms[0].download_url,
        video_url: partForms[0].video_url,
      };
      const response = await authFetch(
        `${BASE_URL}/admin/movies/${selectedMovie.id}/parts/${editingPart.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedPart = await response.json();
        setParts(parts.map((part) => (part.id === updatedPart.id ? updatedPart : part)));
        toast.success("Part updated successfully");
        setIsEditingPart(false);
        setEditingPart(null);
        resetPartForms();
        await fetchParts(selectedMovie.id);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update part: ${errorMessage}`);
      console.error("Update error:", error);
    }
  };

  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const movieResponse = await authFetch(
          `${BASE_URL}/admin/movies/${movieFormData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: movieFormData.title,
              description: movieFormData.description,
              release_year: parseInt(movieFormData.release_year),
              translator: movieFormData.translator,
              language: movieFormData.language,
              poster_url: movieFormData.poster_url,
            }),
          }
        );

        if (!movieResponse.ok) {
          throw new Error(await movieResponse.text());
        }

        const genresResponse = await authFetch(
          `${BASE_URL}/admin/movies/${movieFormData.id}/genres`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedGenreIds),
          }
        );

        if (!genresResponse.ok) {
          throw new Error(await genresResponse.text());
        }

        const partsUpdatePromises = partForms.map(async (partForm) => {
          if (!partForm.part_number || !partForm.download_url.trim()) {
            toast.error(
              `Invalid part ${partForm.part_number || "unknown"}: Part number and download URL are required`
            );
            return Promise.resolve(null);
          }

          const partNumber = parseInt(partForm.part_number);
          const payload = {
            part_number: partNumber,
            title: partForm.title,
            download_url: partForm.download_url,
            video_url: partForm.video_url,
          };

          if (partForm.id) {
            return authFetch(
              `${BASE_URL}/admin/movies/${movieFormData.id}/parts/${partForm.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
          } else {
            return authFetch(
              `${BASE_URL}/admin/movies/${movieFormData.id}/parts`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
          }
        });

        const results = await Promise.all(partsUpdatePromises);
        results.forEach((result, index) => {
          if (result && !result.ok) {
            console.error(`Failed to process part ${index + 1}:`, result.statusText);
            toast.error(`Failed to process part ${index + 1}: ${result.statusText}`);
          }
        });

        await Promise.all([fetchParts(movieFormData.id), fetchMovieGenres(movieFormData.id)]);
        toast.success("Movie, genres, and parts updated successfully");
      } else {
        const partNumbers = new Set();
        const validParts = partForms.filter((part) => {
          if (!part.part_number || !part.download_url.trim()) return false;
          const partNumber = parseInt(part.part_number);
          if (partNumbers.has(partNumber)) {
            toast.error(`Duplicate part number ${partNumber} in form`);
            return false;
          }
          partNumbers.add(partNumber);
          return true;
        });

        const response = await authFetch(`${BASE_URL}/admin/movies/with-genres`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movie: {
              ...movieFormData,
              release_year: parseInt(movieFormData.release_year),
            },
            genre_ids: selectedGenreIds,
            parts: validParts.map((part) => ({
              part_number: parseInt(part.part_number),
              title: part.title,
              download_url: part.download_url,
              video_url: part.video_url,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        toast.success("Movie, genres, and parts added successfully");
      }

      fetchMovies();
      resetMovieForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(
        isEditMode
          ? `Failed to update movie: ${errorMessage}`
          : `Failed to add movie, genres, and parts: ${errorMessage}`
      );
      console.error("Submission error:", error);
    }
  };

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;
    if (!partForms[0].download_url.trim()) {
      toast.error("Download URL is required");
      return;
    }

    try {
      const response = await authFetch(
        `${BASE_URL}/admin/movies/${selectedMovie.id}/parts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            part_number: parseInt(partForms[0].part_number),
            title: partForms[0].title,
            download_url: partForms[0].download_url,
            video_url: partForms[0].video_url,
          }),
        }
      );

      if (response.ok) {
        const newPart = await response.json();
        setParts([...parts, newPart]);
        resetPartForms();
        toast.success("Part added successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add part: ${errorMessage}`);
      console.error("Submission error:", error);
    }
  };

  const handleDeletePart = async (partId: number) => {
    try {
      const response = await authFetch(
        `${BASE_URL}/admin/movie-parts/${partId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setParts(parts.filter((part) => part.id !== partId));
        toast.success("Part deleted successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete part: ${errorMessage}`);
      console.error("Deletion error:", error);
    }
  };

  const handleRemoveGenre = async (genreId: number) => {
    if (!selectedMovie) return;
    try {
      const response = await authFetch(
        `${BASE_URL}/admin/movies/${selectedMovie.id}/genres/${genreId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setMovieGenres(movieGenres.filter((genre) => genre.id !== genreId));
        setSelectedGenreIds(selectedGenreIds.filter((id) => id !== genreId));
        toast.success("Genre removed successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to remove genre: ${errorMessage}`);
      console.error("Deletion error:", error);
    }
  };

  const resetMovieForm = () => {
    setMovieFormData({
      id: 0,
      title: "",
      description: "",
      release_year: "",
      translator: "",
      language: "",
      poster_url: "",
    });
    resetPartForms();
    setSelectedGenreIds([]);
    setIsEditMode(false);
  };

  const resetPartForms = () => {
    setPartForms([{ part_number: "", title: "", download_url: "", video_url: "" }]);
  };

  const addPartForm = () => {
    setPartForms([
      ...partForms,
      { part_number: "", title: "", download_url: "", video_url: "" },
    ]);
  };

  const removePartForm = (index: number) => {
    if (partForms.length <= 1) return;
    setPartForms(partForms.filter((_, i) => i !== index));
  };

  const updatePartForm = (index: number, field: string, value: string) => {
    const updated = [...partForms];
    updated[index] = { ...updated[index], [field]: value };
    setPartForms(updated);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      {/* Header and Add Movie Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Movie Management
        </h2>
        <Dialog onOpenChange={(open) => !open && resetMovieForm()}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Movie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-400">Add New Movie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMovieSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Movie Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder="Title*"
                    value={movieFormData.title}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, title: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Release Year*"
                    type="number"
                    value={movieFormData.release_year}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, release_year: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Translator"
                    value={movieFormData.translator}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, translator: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Language"
                    value={movieFormData.language}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, language: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                </div>
                <Input
                  placeholder="Poster URL"
                  value={movieFormData.poster_url}
                  onChange={(e) =>
                    setMovieFormData({ ...movieFormData, poster_url: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
                <Textarea
                  placeholder="Description"
                  value={movieFormData.description}
                  onChange={(e) =>
                    setMovieFormData({ ...movieFormData, description: e.target.value })
                  }
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Genres</label>
                  <Select
                    onValueChange={(value) => {
                      const genreId = parseInt(value);
                      if (!selectedGenreIds.includes(genreId)) {
                        setSelectedGenreIds([...selectedGenreIds, genreId]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select genres" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      {loading.genres ? (
                        <SelectItem value="loading" disabled>
                          <SkeletonLoader className="h-5 w-full" />
                        </SelectItem>
                      ) : (
                        genres.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id.toString()} className="hover:bg-gray-700">
                            {genre.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGenreIds.map((genreId) => {
                      const genre = genres.find((g) => g.id === genreId);
                      return genre ? (
                        <div
                          key={genreId}
                          className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-sm shadow-sm"
                        >
                          <span>{genre.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-5 w-5 text-white hover:bg-red-500/50"
                            onClick={() =>
                              setSelectedGenreIds(selectedGenreIds.filter((id) => id !== genreId))
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Movie Parts</h3>
                {partForms.map((part, index) => (
                  <div key={index} className="space-y-3 border border-gray-700 p-5 rounded-lg relative bg-gray-700/50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-red-400 hover:bg-red-500/20"
                      onClick={() => removePartForm(index)}
                      disabled={partForms.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Part Number*"
                      type="number"
                      value={part.part_number}
                      onChange={(e) => updatePartForm(index, "part_number", e.target.value)}
                      required
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                    <Input
                      placeholder="Part Title"
                      value={part.title}
                      onChange={(e) => updatePartForm(index, "title", e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                    <Input
                      placeholder="Download URL*"
                      value={part.download_url}
                      onChange={(e) => updatePartForm(index, "download_url", e.target.value)}
                      required
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                    <Input
                      placeholder="Video URL"
                      value={part.video_url}
                      onChange={(e) => updatePartForm(index, "video_url", e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPartForm}
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Part
                </Button>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Save Movie and Parts
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Movie Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetMovieForm();
            setPosition({ x: 0, y: 0 });
          }
        }}
      >
        <DialogContent
  className="max-h-[80vh] overflow-y-auto bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl"
  style={{
    transform: `translate(${position.x}px, ${position.y}px)`,
    position: "fixed", // Changed from absolute to fixed
    top: "50%",
    left: "50%",
    transformOrigin: "center",
    translate: "-50% -50%", // This centers the dialog
  }}
  ref={dialogRef}
>
          <div
            className="cursor-move p-3 bg-gradient-to-r from-blue-900 to-purple-900 rounded-t-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-400">Edit Movie</DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleMovieSubmit} className="space-y-6 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Movie Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Title*</label>
                  <Input
                    value={movieFormData.title}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, title: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Release Year*</label>
                  <Input
                    type="number"
                    value={movieFormData.release_year}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, release_year: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Translator</label>
                  <Input
                    value={movieFormData.translator}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, translator: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Language</label>
                  <Input
                    value={movieFormData.language}
                    onChange={(e) =>
                      setMovieFormData({ ...movieFormData, language: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Poster URL</label>
                <Input
                  value={movieFormData.poster_url}
                  onChange={(e) =>
                    setMovieFormData({ ...movieFormData, poster_url: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <Textarea
                  value={movieFormData.description}
                  onChange={(e) =>
                    setMovieFormData({ ...movieFormData, description: e.target.value })
                  }
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Genres</label>
                <Select
                  onValueChange={(value) => {
                    const genreId = parseInt(value);
                    if (!selectedGenreIds.includes(genreId)) {
                      setSelectedGenreIds([...selectedGenreIds, genreId]);
                    }
                  }}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    {loading.genres ? (
                      <SelectItem value="loading" disabled>
                        <SkeletonLoader className="h-5 w-full" />
                      </SelectItem>
                      ) : (
                        genres.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id.toString()} className="hover:bg-gray-700">
                            {genre.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGenreIds.map((genreId) => {
                      const genre = genres.find((g) => g.id === genreId);
                      return genre ? (
                        <div
                          key={genreId}
                          className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-sm shadow-sm"
                        >
                          <span>{genre.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-5 w-5 text-white hover:bg-red-500/50"
                            onClick={() =>
                              setSelectedGenreIds(selectedGenreIds.filter((id) => id !== genreId))
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Movie Parts</h3>
                {partForms.map((part, index) => (
                  <div key={index} className="space-y-3 border border-gray-700 p-5 rounded-lg relative bg-gray-700/50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-red-400 hover:bg-red-500/20"
                      onClick={() => removePartForm(index)}
                      disabled={partForms.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Part Number*</label>
                      <Input
                        type="number"
                        value={part.part_number}
                        onChange={(e) => updatePartForm(index, "part_number", e.target.value)}
                        required
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Part Title</label>
                      <Input
                        value={part.title}
                        onChange={(e) => updatePartForm(index, "title", e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Download URL*</label>
                      <Input
                        value={part.download_url}
                        onChange={(e) => updatePartForm(index, "download_url", e.target.value)}
                        required
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Video URL</label>
                      <Input
                        value={part.video_url}
                        onChange={(e) => updatePartForm(index, "video_url", e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPartForm}
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Part
                </Button>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Update Movie
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Movies Table */}
        {loading.movies ? (
          <MoviesTableSkeleton />
        ) : (
          <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
                  <TableHead className="text-white font-semibold">Title</TableHead>
                  <TableHead className="hidden sm:table-cell text-white font-semibold">Year</TableHead>
                  <TableHead className="hidden md:table-cell text-white font-semibold">Language</TableHead>
                  <TableHead className="text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movies.map((movie) => (
                  <TableRow key={movie.id} className="hover:bg-gray-700/50 transition-colors">
                    <TableCell className="font-medium">
                      <button
                        onClick={() => {
                          setSelectedMovie(movie);
                          fetchParts(movie.id);
                          fetchMovieGenres(movie.id);
                        }}
                        className="hover:underline text-blue-400 text-left w-full"
                      >
                        {movie.title}
                      </button>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-300">{movie.release_year}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-300">{movie.language || "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                          <DropdownMenuItem onClick={() => handleEditMovie(movie)} className="hover:bg-gray-700">
                            <Edit className="mr-2 h-4 w-4 text-blue-400" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-500/20"
                            onClick={() => handleDeleteMovie(movie.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Parts and Genres Section */}
        {selectedMovie && (
          <div className="space-y-6 mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Details for {selectedMovie.title}
              </h3>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      {isEditingPart ? "Edit Part" : "Add Part"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-blue-400">
                        {isEditingPart ? "Edit Part" : "Add New Part"}
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={isEditingPart ? handleUpdatePart : handlePartSubmit}
                      className="space-y-4"
                    >
                      <Input
                        placeholder="Part Number*"
                        type="number"
                        value={partForms[0].part_number}
                        onChange={(e) => updatePartForm(0, "part_number", e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Title"
                        value={partForms[0].title}
                        onChange={(e) => updatePartForm(0, "title", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Download URL*"
                        value={partForms[0].download_url}
                        onChange={(e) => updatePartForm(0, "download_url", e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Video URL"
                        value={partForms[0].video_url}
                        onChange={(e) => updatePartForm(0, "video_url", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                      />
                      <div className="flex justify-end gap-3">
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditingPart(false);
                              setEditingPart(null);
                              resetPartForms();
                            }}
                            className="border-gray-500 text-gray-300 hover:bg-gray-600"
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          {isEditingPart ? "Update Part" : "Save Part"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto border-blue-500 text-blue-400 hover:bg-blue-500/20" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Genre
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-blue-400">
                        Add Genre to {selectedMovie.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select
                        onValueChange={async (value) => {
                          const genreId = parseInt(value);
                          if (!selectedGenreIds.includes(genreId)) {
                            try {
                              const response = await authFetch(
                                `http://127.0.0.1:8000/admin/movies/${selectedMovie.id}/genres`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify([genreId]),
                                }
                              );
                              if (response.ok) {
                                setSelectedGenreIds([...selectedGenreIds, genreId]);
                                await fetchMovieGenres(selectedMovie.id);
                                toast.success("Genre added successfully");
                              } else {
                                throw new Error(await response.text());
                              }
                            } catch (error) {
                              toast.error("Failed to add genre");
                              console.error("Add genre error:", error);
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {loading.genres ? (
                            <SelectItem value="loading" disabled>
                              <SkeletonLoader className="h-5 w-full" />
                            </SelectItem>
                          ) : (
                            genres
                              .filter((genre) => !selectedGenreIds.includes(genre.id))
                              .map((genre) => (
                                <SelectItem key={genre.id} value={genre.id.toString()} className="hover:bg-gray-700">
                                  {genre.name}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end">
                        <DialogClose asChild>
                          <Button variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                            Close
                          </Button>
                        </DialogClose>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Genres Section */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-400">Genres</h4>
              {loading.movieGenres ? (
                <GenresSectionSkeleton />
              ) : movieGenres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {movieGenres.map((genre) => (
                    <div
                      key={genre.id}
                      className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-sm shadow-sm"
                    >
                      <span>{genre.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-5 w-5 text-white hover:bg-red-500/50"
                        onClick={() => handleRemoveGenre(genre.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No genres assigned</p>
              )}
            </div>

            {/* Parts Section */}
            {loading.parts ? (
              <PartsTableSkeleton />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
                      <TableHead className="text-white font-semibold">Part #</TableHead>
                      <TableHead className="text-white font-semibold">Title</TableHead>
                      <TableHead className="hidden sm:table-cell text-white font-semibold">Download</TableHead>
                      <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.length > 0 ? (
                      parts.map((part) => (
                        <TableRow key={part.id} className="hover:bg-gray-700/50 transition-colors">
                          <TableCell className="text-gray-300">{part.part_number}</TableCell>
                          <TableCell className="text-gray-300">{part.title || "-"}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {part.download_url ? (
                              <a
                                href={part.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                Download
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                                <DropdownMenuItem onClick={() => handleEditPart(part.id)} className="hover:bg-gray-700">
                                  <Edit className="mr-2 h-4 w-4 text-blue-400" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 hover:bg-red-500/20"
                                  onClick={() => handleDeletePart(part.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                          No parts added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }