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
import { toast } from "sonner";
import { MoreVertical, Plus, Trash2, Edit, X } from "lucide-react";
import { authFetch } from "@/app/lib/api";

type Series = {
  id: number;
  title: string;
  description: string;
  release_year: number;
  translator: string;
  language: string;
  poster_url: string;
};

type Episode = {
  id: number;
  series_id: number;
  episode_number: number;
  title: string;
  download_url: string;
  video_url: string;
};

type Genre = {
  id: number;
  name: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-700 to-gray-600 rounded ${className || ""}`}></div>
  );
}

function SeriesTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
            <TableHead className="text-white">Title</TableHead>
            <TableHead className="hidden sm:table-cell text-white">Year</TableHead>
            <TableHead className="hidden md:table-cell text-white">Genres</TableHead>
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

function EpisodesTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
            <TableHead className="text-white">Episode #</TableHead>
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

export default function SeriesManager() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState({
    series: true,
    episodes: false,
    genres: false,
  });
  const [seriesFormData, setSeriesFormData] = useState({
    id: 0,
    title: "",
    description: "",
    release_year: "",
    translator: "",
    language: "",
    poster_url: "",
  });
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isEditingEpisode, setIsEditingEpisode] = useState(false);
  const [episodeForms, setEpisodeForms] = useState<
    Array<{
      id?: number;
      episode_number: string;
      title: string;
      download_url: string;
      video_url: string;
    }>
  >([{ episode_number: "", title: "", download_url: "", video_url: "" }]);
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
    fetchSeries();
    fetchAllGenres();
  }, []);

  const fetchSeries = async () => {
    try {
      const response = await authFetch(`${BASE_URL}/series`);
      const data = await response.json();
      setSeriesList(data);
    } catch (error) {
      toast.error("Failed to load series");
    } finally {
      setLoading((prev) => ({ ...prev, series: false }));
    }
  };

  const fetchEpisodes = async (seriesId: number) => {
    setLoading((prev) => ({ ...prev, episodes: true }));
    try {
      const response = await authFetch(`${BASE_URL}/series/${seriesId}/episodes`);
      const data = await response.json();
      setEpisodes(data);
    } catch (error) {
      toast.error("Failed to load episodes");
    } finally {
      setLoading((prev) => ({ ...prev, episodes: false }));
    }
  };

  const fetchAllGenres = async () => {
    setLoading((prev) => ({ ...prev, genres: true }));
    try {
      const response = await authFetch(`${BASE_URL}/genres`);

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid genres data format");
      }
      setAllGenres(data);
    } catch (error) {
      console.error("Fetch genres error:", error);
      toast.error("Failed to load genres");
      setAllGenres([]);
    } finally {
      setLoading((prev) => ({ ...prev, genres: false }));
    }
  };

  const fetchSeriesGenres = async (seriesId: number) => {
    setLoading((prev) => ({ ...prev, genres: true }));
    try {
      const response = await authFetch(`${BASE_URL}/series/${seriesId}/genres`);

      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setGenres(data);
      setSelectedGenreIds(data.map((g: Genre) => g.id));
    } catch (error) {
      toast.error("Failed to load series genres");
      console.error("Fetch series genres error:", error);
      setGenres([]);
      setSelectedGenreIds([]);
    } finally {
      setLoading((prev) => ({ ...prev, genres: false }));
    }
  };

  const handleEditSeries = async (series: Series) => {
    setIsEditMode(true);
    setIsEditDialogOpen(true);
    setSeriesFormData({
      id: series.id,
      title: series.title,
      description: series.description || "",
      release_year: series.release_year.toString(),
      translator: series.translator || "",
      language: series.language || "",
      poster_url: series.poster_url || "",
    });

    try {
      const [episodesResponse, genresResponse] = await Promise.all([
        authFetch(`${BASE_URL}/series/${series.id}/episodes`),
        authFetch(`${BASE_URL}/series/${series.id}/genres`),
      ]);

      const episodesData = await episodesResponse.json();
      const genresData = await genresResponse.json();

      const formattedEpisodes = episodesData.map((episode: any) => ({
        id: episode.id,
        episode_number: episode.episode_number.toString(),
        title: episode.title || "",
        download_url: episode.download_url || "",
        video_url: episode.video_url || "",
      }));

      setEpisodeForms(
        formattedEpisodes.length > 0
          ? formattedEpisodes
          : [{ episode_number: "", title: "", download_url: "", video_url: "" }]
      );
      setEpisodes(episodesData);
      setGenres(genresData);
      setSelectedGenreIds(genresData.map((g: Genre) => g.id));
    } catch (error) {
      toast.error("Failed to load series data for editing");
      console.error("Error loading series data:", error);
    }
  };

  const handleDeleteSeries = async (seriesId: number) => {
    try {
      const response = await authFetch(`${BASE_URL}/admin/series/${seriesId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSeriesList(seriesList.filter((series) => series.id !== seriesId));
        if (selectedSeries?.id === seriesId) {
          setSelectedSeries(null);
          setEpisodes([]);
          setGenres([]);
          setSelectedGenreIds([]);
        }
        toast.success("Series deleted successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      toast.error("Failed to delete series");
      console.error("Deletion error:", error);
    }
  };

  const handleEditEpisode = async (episodeId: number) => {
    try {
      const response = await authFetch(`${BASE_URL}/admin/episodes/${episodeId}`);
      const episode = await response.json();
      setEditingEpisode(episode);
      setIsEditingEpisode(true);
      setEpisodeForms([
        {
          id: episode.id,
          episode_number: episode.episode_number.toString(),
          title: episode.title || "",
          download_url: episode.download_url || "",
          video_url: episode.video_url || "",
        },
      ]);
    } catch (error) {
      toast.error("Failed to load episode for editing");
      console.error("Error loading episode:", error);
    }
  };

  const handleUpdateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode || !selectedSeries) {
      toast.error("No episode or series selected");
      return;
    }
    if (!episodeForms[0].download_url.trim()) {
      toast.error("Download URL is required");
      return;
    }

    try {
      const payload = {
        episode_number: parseInt(episodeForms[0].episode_number),
        title: episodeForms[0].title,
        download_url: episodeForms[0].download_url,
        video_url: episodeForms[0].video_url,
      };

      const response = await authFetch(
        `${BASE_URL}/admin/series/${selectedSeries.id}/episodes/${editingEpisode.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedEpisode = await response.json();
        setEpisodes(episodes.map((episode) => (episode.id === updatedEpisode.id ? updatedEpisode : episode)));
        toast.success("Episode updated successfully");
        setIsEditingEpisode(false);
        setEditingEpisode(null);
        resetEpisodeForms();
        await fetchEpisodes(selectedSeries.id);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update episode: ${errorMessage}`);
      console.error("Update error:", error);
    }
  };

  const handleSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const seriesResponse = await authFetch(
          `${BASE_URL}/admin/series/${seriesFormData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: seriesFormData.title,
              description: seriesFormData.description,
              release_year: parseInt(seriesFormData.release_year),
              translator: seriesFormData.translator,
              language: seriesFormData.language,
              poster_url: seriesFormData.poster_url,
            }),
          }
        );

        if (!seriesResponse.ok) {
          throw new Error(await seriesResponse.text());
        }

        const genreResponse = await authFetch(
          `${BASE_URL}/admin/series/${seriesFormData.id}/genres`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedGenreIds),
          }
        );

        if (!genreResponse.ok) {
          throw new Error(await genreResponse.text());
        }

        const episodesUpdatePromises = episodeForms.map(async (episodeForm) => {
          if (!episodeForm.episode_number || !episodeForm.download_url.trim()) {
            toast.error(
              `Invalid episode ${episodeForm.episode_number || "unknown"}: Episode number and download URL are required`
            );
            return Promise.resolve(null);
          }

          const episodeNumber = parseInt(episodeForm.episode_number);
          const payload = {
            episode_number: episodeNumber,
            title: episodeForm.title.trim() || null,
            download_url: episodeForm.download_url,
            video_url: episodeForm.video_url,
          };

          if (episodeForm.id) {
            return authFetch(
              `${BASE_URL}/admin/series/${seriesFormData.id}/episodes/${episodeForm.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
          } else {
            return authFetch(
              `${BASE_URL}/admin/series/${seriesFormData.id}/episodes`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
          }
        });

        const results = await Promise.all(episodesUpdatePromises);
        results.forEach((result, index) => {
          if (result && !result.ok) {
            console.error(`Failed to process episode ${index + 1}:`, result.statusText);
            toast.error(`Failed to process episode ${index + 1}: ${result.statusText}`);
          }
        });

        await fetchEpisodes(seriesFormData.id);
        await fetchSeriesGenres(seriesFormData.id);
        toast.success("Series, genres, and episodes updated successfully");
      } else {
        const episodeNumbers = new Set();
        const validEpisodes = episodeForms.filter((episode) => {
          if (!episode.episode_number || !episode.download_url.trim()) return false;
          const episodeNumber = parseInt(episode.episode_number);
          if (episodeNumbers.has(episodeNumber)) {
            toast.error(`Duplicate episode number ${episodeNumber} in form`);
            return false;
          }
          episodeNumbers.add(episodeNumber);
          return true;
        });

        const response = await authFetch(
          `${BASE_URL}/admin/series/with-genres`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              series: {
                ...seriesFormData,
                release_year: parseInt(seriesFormData.release_year),
              },
              genre_ids: selectedGenreIds,
              episodes: validEpisodes.map((episode) => ({
                episode_number: parseInt(episode.episode_number),
                title: episode.title,
                download_url: episode.download_url,
                video_url: episode.video_url,
              })),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }
        toast.success("Series, genres, and episodes added successfully");
      }

      fetchSeries();
      resetSeriesForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(
        isEditMode
          ? `Failed to update series: ${errorMessage}`
          : `Failed to add series, genres, and episodes: ${errorMessage}`
      );
      console.error("Submission error:", error);
    }
  };

  const handleEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    if (!episodeForms[0].download_url.trim()) {
      toast.error("Download URL is required");
      return;
    }

    try {
      const response = await authFetch(
        `${BASE_URL}/admin/series/${selectedSeries.id}/episodes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episode_number: parseInt(episodeForms[0].episode_number),
            title: episodeForms[0].title,
            download_url: episodeForms[0].download_url,
            video_url: episodeForms[0].video_url,
          }),
        }
      );

      if (response.ok) {
        const newEpisode = await response.json();
        setEpisodes([...episodes, newEpisode]);
        resetEpisodeForms();
        toast.success("Episode added successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add episode: ${errorMessage}`);
      console.error("Submission error:", error);
    }
  };

  const handleDeleteEpisode = async (episodeId: number) => {
    try {
      const response = await authFetch(
        `${BASE_URL}/admin/episodes/${episodeId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setEpisodes(episodes.filter((episode) => episode.id !== episodeId));
        toast.success("Episode deleted successfully");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete episode: ${errorMessage}`);
      console.error("Deletion error:", error);
    }
  };

  const resetSeriesForm = () => {
    setSeriesFormData({
      id: 0,
      title: "",
      description: "",
      release_year: "",
      translator: "",
      language: "",
      poster_url: "",
    });
    setSelectedGenreIds([]);
    resetEpisodeForms();
    setIsEditMode(false);
  };

  const resetEpisodeForms = () => {
    setEpisodeForms([{ episode_number: "", title: "", download_url: "", video_url: "" }]);
  };

  const addEpisodeForm = () => {
    setEpisodeForms([
      ...episodeForms,
      { episode_number: "", title: "", download_url: "", video_url: "" },
    ]);
  };

  const removeEpisodeForm = (index: number) => {
    if (episodeForms.length <= 1) return;
    setEpisodeForms(episodeForms.filter((_, i) => i !== index));
  };

  const updateEpisodeForm = (index: number, field: string, value: string) => {
    const updated = [...episodeForms];
    updated[index] = { ...updated[index], [field]: value };
    setEpisodeForms(updated);
  };

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleManageGenreToggle = async (genreId: number) => {
    if (!selectedSeries) return;
    try {
      if (selectedGenreIds.includes(genreId)) {
        const response = await authFetch(
          `${BASE_URL}/admin/series/${selectedSeries.id}/genres/${genreId}`,
          { method: "DELETE" }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        setSelectedGenreIds(selectedGenreIds.filter((id) => id !== genreId));
        setGenres(genres.filter((genre) => genre.id !== genreId));
        toast.success("Genre removed from series");
      } else {
        const response = await authFetch(
          `${BASE_URL}/admin/series/${selectedSeries.id}/genres`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([genreId]),
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const genre = allGenres.find((g) => g.id === genreId);
        if (genre) {
          setSelectedGenreIds([...selectedGenreIds, genreId]);
          setGenres([...genres, genre]);
          toast.success("Genre added to series");
        } else {
          throw new Error("Genre not found in allGenres");
        }
      }
      await fetchSeriesGenres(selectedSeries.id);
    } catch (error) {
      toast.error("Failed to update genres");
      console.error("Genre update error:", error);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      {/* Header and Add Series Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Series Management
        </h2>
        <Dialog onOpenChange={(open) => !open && resetSeriesForm()}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Series
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-400">Add New Series</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSeriesSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Series Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder="Title*"
                    value={seriesFormData.title}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, title: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Release Year*"
                    type="number"
                    value={seriesFormData.release_year}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, release_year: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Translator"
                    value={seriesFormData.translator}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, translator: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Language"
                    value={seriesFormData.language}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, language: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                  />
                </div>
                <Input
                  placeholder="Poster URL"
                  value={seriesFormData.poster_url}
                  onChange={(e) =>
                    setSeriesFormData({ ...seriesFormData, poster_url: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
                <Textarea
                  placeholder="Description"
                  value={seriesFormData.description}
                  onChange={(e) =>
                    setSeriesFormData({ ...seriesFormData, description: e.target.value })
                  }
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Genres</h3>
                {loading.genres ? (
                  <SkeletonLoader className="h-8 w-full rounded" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allGenres.length > 0 ? (
                      allGenres.map((genre) => (
                        <Button
                          key={genre.id}
                          type="button"
                          variant={selectedGenreIds.includes(genre.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleGenreToggle(genre.id)}
                          className={
                            selectedGenreIds.includes(genre.id)
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600"
                              : "border-gray-500 text-gray-300 hover:bg-gray-600"
                          }
                        >
                          {genre.name}
                        </Button>
                      ))
                    ) : (
                      <p className="text-gray-400">No genres available</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Episodes</h3>
                {episodeForms.map((episode, index) => (
                  <div key={index} className="space-y-3 border border-gray-700 p-5 rounded-lg relative bg-gray-700/50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-red-400 hover:bg-red-500/20"
                      onClick={() => removeEpisodeForm(index)}
                      disabled={episodeForms.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Episode Number*"
                      type="number"
                      value={episode.episode_number}
                      onChange={(e) => updateEpisodeForm(index, "episode_number", e.target.value)}
                      required
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                    <Input
                      placeholder="Episode Title"
                      value={episode.title}
                      onChange={(e) => updateEpisodeForm(index, "title", e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                    <Input
                      placeholder="Download URL*"
                      value={episode.download_url}
                      onChange={(e) => updateEpisodeForm(index, "download_url", e.target.value)}
                      required
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                    <Input
                      placeholder="Video URL"
                      value={episode.video_url}
                      onChange={(e) => updateEpisodeForm(index, "video_url", e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEpisodeForm}
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Episode
                </Button>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Save Series and Episodes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Series Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetSeriesForm();
            setPosition({ x: 0, y: 0 });
          }
        }}
      >
        <DialogContent
  className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl rounded-lg"
  style={{
    transform: `translate(${position.x}px, ${position.y}px)`,
    position: "fixed",
    top: "50%",
    left: "50%",
    margin: 0,
    transformOrigin: "center",
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
              <DialogTitle className="text-2xl font-bold text-blue-400">Edit Series</DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleSeriesSubmit} className="space-y-6 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Series Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Title*</label>
                  <Input
                    value={seriesFormData.title}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, title: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 h-10 px-4 py-2 text-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Release Year*</label>
                  <Input
                    type="number"
                    value={seriesFormData.release_year}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, release_year: e.target.value })
                    }
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 h-10 px-4 py-2 text-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Translator</label>
                  <Input
                    value={seriesFormData.translator}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, translator: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 h-10 px-4 py-2 text-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Language</label>
                  <Input
                    value={seriesFormData.language}
                    onChange={(e) =>
                      setSeriesFormData({ ...seriesFormData, language: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 h-10 px-4 py-2 text-base"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Poster URL</label>
                <Input
                  value={seriesFormData.poster_url}
                  onChange={(e) =>
                    setSeriesFormData({ ...seriesFormData, poster_url: e.target.value })
                  }
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 h-10 px-4 py-2 text-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <Textarea
                  value={seriesFormData.description}
                  onChange={(e) =>
                    setSeriesFormData({ ...seriesFormData, description: e.target.value })
                  }
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Genres</h3>
              {loading.genres ? (
                <SkeletonLoader className="h-8 w-full rounded" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allGenres.length > 0 ? (
                    allGenres.map((genre) => (
                      <Button
                        key={genre.id}
                        type="button"
                        variant={selectedGenreIds.includes(genre.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGenreToggle(genre.id)}
                        className={
                          selectedGenreIds.includes(genre.id)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600"
                            : "border-gray-500 text-gray-300 hover:bg-gray-600"
                        }
                      >
                        {genre.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-400">No genres available</p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Episodes</h3>
              {episodeForms.map((episode, index) => (
                <div key={index} className="space-y-3 border border-gray-700 p-5 rounded-lg relative bg-gray-700/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-red-400 hover:bg-red-500/20"
                    onClick={() => removeEpisodeForm(index)}
                    disabled={episodeForms.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Episode Number*</label>
                    <Input
                      type="number"
                      value={episode.episode_number}
                      onChange={(e) => updateEpisodeForm(index, "episode_number", e.target.value)}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 h-10 px-4 py-2 text-base"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Episode Title</label>
                    <Input
                      value={episode.title}
                      onChange={(e) => updateEpisodeForm(index, "title", e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Download URL*</label>
                    <Input
                      value={episode.download_url}
                      onChange={(e) => updateEpisodeForm(index, "download_url", e.target.value)}
                      required
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Video URL</label>
                    <Input
                      value={episode.video_url}
                      onChange={(e) => updateEpisodeForm(index, "video_url", e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEpisodeForm}
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Episode
              </Button>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Update Series
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Series Table */}
      {loading.series ? (
        <SeriesTableSkeleton />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
                <TableHead className="text-white font-semibold">Title</TableHead>
                <TableHead className="hidden sm:table-cell text-white font-semibold">Year</TableHead>
                <TableHead className="hidden md:table-cell text-white font-semibold">Genres</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seriesList.map((series) => (
                <TableRow key={series.id} className="hover:bg-gray-700/50 transition-colors">
                  <TableCell className="font-medium">
                    <button
                      onClick={() => {
                        setSelectedSeries(series);
                        fetchEpisodes(series.id);
                        fetchSeriesGenres(series.id);
                      }}
                      className="hover:underline text-blue-400 text-left w-full"
                    >
                      {series.title}
                    </button>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-gray-300">{series.release_year}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-1 rounded-full text-white shadow-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                        <DropdownMenuItem onClick={() => handleEditSeries(series)} className="hover:bg-gray-700">
                          <Edit className="mr-2 h-4 w-4 text-blue-400" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-500/20"
                          onClick={() => handleDeleteSeries(series.id)}
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

      {/* Episodes and Genres Section */}
      {selectedSeries && (
        <div className="space-y-6 mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Details for {selectedSeries.title}
            </h3>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    {isEditingEpisode ? "Edit Episode" : "Add Episode"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-400">
                      {isEditingEpisode ? "Edit Episode" : "Add New Episode"}
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={isEditingEpisode ? handleUpdateEpisode : handleEpisodeSubmit}
                    className="space-y-4"
                  >
                    <Input
                      placeholder="Episode Number*"
                      type="number"
                      value={episodeForms[0].episode_number}
                      onChange={(e) => updateEpisodeForm(0, "episode_number", e.target.value)}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                    <Input
                      placeholder="Title"
                      value={episodeForms[0].title}
                      onChange={(e) => updateEpisodeForm(0, "title", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                    <Input
                      placeholder="Download URL*"
                      value={episodeForms[0].download_url}
                      onChange={(e) => updateEpisodeForm(0, "download_url", e.target.value)}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                    <Input
                      placeholder="Video URL"
                      value={episodeForms[0].video_url}
                      onChange={(e) => updateEpisodeForm(0, "video_url", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-3">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditingEpisode(false);
                            setEditingEpisode(null);
                            resetEpisodeForms();
                          }}
                          className="border-gray-500 text-gray-300 hover:bg-gray-600"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        {isEditingEpisode ? "Update Episode" : "Save Episode"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto border-blue-500 text-blue-500 hover:bg-blue-500/20" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Genres
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800/90 backdrop-blur-md text-white border border-gray-700 shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-400">
                      Manage Genres for {selectedSeries.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {loading.genres ? (
                      <SkeletonLoader className="h-8 w-full rounded" />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allGenres.length > 0 ? (
                          allGenres.map((genre) => (
                            <Button
                              key={genre.id}
                              type="button"
                              variant={selectedGenreIds.includes(genre.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleManageGenreToggle(genre.id)}
                              className={
                                selectedGenreIds.includes(genre.id)
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600"
                                  : "border-gray-600 text-gray-300 hover:bg-gray-600"
                              }
                            >
                              {genre.name}
                            </Button>
                          ))
                        ) : (
                          <p className="text-gray-400">No genres available</p>
                        )}
                      </div>
                    )}
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
            <h4 className="text-lg font-semibold text-white">Genres</h4>
            {loading.genres ? (
              <GenresSectionSkeleton />
            ) : genres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <div
                    key={genre.id}
                    className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-sm shadow-sm"
                  >
                    <span>{genre.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-5 w-5 text-white hover:bg-red-500/50"
                      onClick={() => handleManageGenreToggle(genre.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No genres added yet.</p>
            )}
          </div>

          {/* Episodes Section */}
          {loading.episodes ? (
            <EpisodesTableSkeleton />
          ) : (
            <div className="border rounded-lg overflow-hidden bg-gray-800/80 shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-900 to-purple-900">
                    <TableHead className="text-white font-semibold">Episode #</TableHead>
                    <TableHead className="text-white font-semibold">Title</TableHead>
                    <TableHead className="hidden sm:table-cell text-white font-semibold">Download</TableHead>
                    <TableHead className="text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {episodes.length > 0 ? (
                    episodes.map((episode) => (
                      <TableRow key={episode.id} className="hover:bg-gray-700/50 transition-colors">
                        <TableCell className="text-gray-300">{episode.episode_number}</TableCell>
                        <TableCell className="text-gray-300">{episode.title || "-"}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {episode.download_url ? (
                            <a
                              href={episode.download_url}
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
                              <DropdownMenuItem onClick={() => handleEditEpisode(episode.id)} className="hover:bg-gray-700">
                                <Edit className="mr-2 h-4 w-4 text-blue-400" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-500/20"
                                onClick={() => handleDeleteEpisode(episode.id)}
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
                        No episodes added yet
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