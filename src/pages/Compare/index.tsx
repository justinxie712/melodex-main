import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import SearchBar from "../../components/SearchBar";
import { cacheService } from "../../services/cacheService";
import { getAudioFeatures } from "../../services/audioFeaturesService";
import { refreshToken } from "../../utils/helpers";
import type { AudioFeatures, Track } from "../../types";
import "./styles.scss";
import SpinnerWidget from "../../components/Spinner";
import { useMediaQuery } from "react-responsive";

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CompareTrack extends Track {
  audioFeatures: AudioFeatures | null;
  color: string;
}

const AUDIO_FEATURE_CATEGORIES = [
  { key: "danceability", label: "Danceability", color: "#1DB954" },
  { key: "energy", label: "Energy", color: "#1ED760" },
  { key: "speechiness", label: "Speechiness", color: "#1AA34A" },
  { key: "acousticness", label: "Acousticness", color: "#168B3A" },
  { key: "instrumentalness", label: "Instrumentalness", color: "#14A085" },
  { key: "liveness", label: "Liveness", color: "#1B9A59" },
  { key: "valence", label: "Valence", color: "#1F8B4C" },
] as const;

const TRACK_COLORS = ["#1DB954", "#E22134", "#FF6B35", "#9B59B6"];

const Compare: React.FC = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [compareTracks, setCompareTracks] = useState<CompareTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("spotify_token");
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Function to get the next available color
  const getNextAvailableColor = (): string => {
    const usedColors = compareTracks.map((track) => track.color);
    return (
      TRACK_COLORS.find((color) => !usedColors.includes(color)) ||
      TRACK_COLORS[0]
    );
  };

  // Function to reassign colors to ensure all tracks have different colors
  const reassignColors = (tracks: CompareTrack[]): CompareTrack[] => {
    return tracks.map((track, index) => ({
      ...track,
      color: TRACK_COLORS[index] || TRACK_COLORS[index % TRACK_COLORS.length],
    }));
  };

  const searchTracks = async (searchQuery: string) => {
    if (!searchQuery || !token) return;

    const cacheKey = `search_${searchQuery}`;
    const cachedResults = cacheService.get<Track[]>(cacheKey);

    if (cachedResults) {
      setResults(cachedResults);
      setShowResults(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=track,artist&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          await refreshToken();
          return;
        }
        throw new Error("Failed to fetch. Token may have expired.");
      }

      const data = await res.json();
      const trackResults: Track[] = data.tracks?.items || [];

      cacheService.set(cacheKey, trackResults);
      setResults(trackResults);
      setShowResults(true);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudioFeatures = async (
    trackId: string
  ): Promise<AudioFeatures | null> => {
    const cacheKey = `audio_features_${trackId}`;
    const cachedFeatures = cacheService.get<AudioFeatures>(cacheKey);

    if (cachedFeatures) {
      return cachedFeatures;
    }

    try {
      const features = await getAudioFeatures(trackId);
      cacheService.set(cacheKey, features);
      return features;
    } catch (err) {
      console.error(`Error fetching audio features for ${trackId}:`, err);
      return null;
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      searchTracks(searchQuery);
    }, 300),
    [token]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleClear = () => {
    setQuery("");
  };

  const handleResultsChange = async (
    result: Track & { popularity: number }
  ) => {
    if (compareTracks.length >= 4) {
      setError("Maximum 4 tracks can be compared");
      return;
    }

    if (compareTracks.some((track) => track.id === result.id)) {
      setError("Track already added to comparison");
      return;
    }

    setIsLoading(true);
    const audioFeatures = await fetchAudioFeatures(result.id);

    const newTrack: CompareTrack = {
      ...result,
      audioFeatures,
      color: getNextAvailableColor(),
    };

    setCompareTracks((prev) => {
      const updatedTracks = [...prev, newTrack];
      return reassignColors(updatedTracks);
    });
    setQuery("");
    setShowResults(false);
    setError(null);
    setIsLoading(false);
  };

  const removeTrack = (trackId: string) => {
    setCompareTracks((prev) => {
      const filteredTracks = prev.filter((track) => track.id !== trackId);
      return reassignColors(filteredTracks);
    });
  };

  const getChartData = () => {
    if (selectedCategory === "all") {
      const labels = AUDIO_FEATURE_CATEGORIES.map((cat) => cat.label);
      const datasets = compareTracks
        .filter((track) => track.audioFeatures)
        .map((track) => ({
          label: `${track.name} - ${track.artists[0]?.name}`,
          data: AUDIO_FEATURE_CATEGORIES.map(
            (cat) => track.audioFeatures?.[cat.key as keyof AudioFeatures] || 0
          ),
          backgroundColor: `${track.color}20`,
          borderColor: track.color,
          borderWidth: 2,
          pointBackgroundColor: track.color,
          pointBorderColor: track.color,
          pointRadius: 4,
        }));

      return { labels, datasets };
    } else {
      const selectedFeature = AUDIO_FEATURE_CATEGORIES.find(
        (cat) => cat.key === selectedCategory
      );
      if (!selectedFeature) return { labels: [], datasets: [] };

      const labels = compareTracks.map(
        (track) =>
          `${track.name.substring(0, 20)}${track.name.length > 20 ? "..." : ""}`
      );
      const data = compareTracks.map(
        (track) =>
          track.audioFeatures?.[selectedCategory as keyof AudioFeatures] || 0
      );

      return {
        labels,
        datasets: [
          {
            label: selectedFeature.label,
            data,
            backgroundColor: compareTracks.map((track) => `${track.color}80`),
            borderColor: compareTracks.map((track) => track.color),
            borderWidth: 2,
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      };
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#282828",
        titleColor: "#ffffff",
        bodyColor: "#b3b3b3",
        borderColor: "#404040",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.raw;
            const rounded =
              typeof value === "number" ? value.toFixed(2) : value;
            return `${label}: ${rounded}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#b3b3b3",
          font: {
            family: "'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          color: "#404040",
          drawBorder: false,
        },
        ticks: {
          color: "#b3b3b3",
          font: {
            family: "'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
          },
        },
      },
    },
  };

  const chartOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        labels: {
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#282828",
        titleColor: "#ffffff",
        bodyColor: "#b3b3b3",
        borderColor: "#404040",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.raw;
            const rounded =
              typeof value === "number" ? value.toFixed(2) : value;
            return `${label}: ${rounded}`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          color: "#535353",
          backdropColor: "transparent",
        },
        grid: {
          color: "#404040",
        },
        angleLines: {
          color: "#404040",
        },
        pointLabels: {
          color: "#b3b3b3",
          font: {
            size: 11,
            family: "'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="compare">
      <div className="compare__container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="compare__header"
        >
          <h1>Compare Tracks</h1>
          <p>Add up to 4 tracks to compare their audio features</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="compare__search"
        >
          <SearchBar
            query={query}
            results={results}
            showResults={showResults}
            closeResults={() => setShowResults(false)}
            error={error}
            onQueryChange={handleQueryChange}
            onClear={handleClear}
            onResultsChange={handleResultsChange}
          />
        </motion.div>
        {isLoading && compareTracks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="compare__loading"
          >
            <SpinnerWidget />
          </motion.div>
        )}
        <div className="compare__content">
          {compareTracks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="compare__main"
            >
              <div className="compare__sidebar">
                <div className="compare__tracks">
                  <h3>Selected Tracks ({compareTracks.length}/4)</h3>
                  <div className="tracks__list">
                    <AnimatePresence>
                      {compareTracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="track__item"
                        >
                          <div
                            className="track__color-indicator"
                            style={{ backgroundColor: track.color }}
                          />
                          <div className="track__info">
                            <img
                              src={
                                track.album.images[2]?.url ||
                                track.album.images[0]?.url
                              }
                              alt={`Album artwork for ${track.name}`}
                              className="track__image"
                            />
                            <div className="track__details">
                              <h4>{track.name}</h4>
                              <p>
                                {track.artists
                                  .map((artist) => artist.name)
                                  .join(", ")}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeTrack(track.id)}
                            className="track__remove"
                          >
                            ×
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="compare__filters">
                  <h3>Audio Feature Filter</h3>
                  <div className="filter__buttons">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`filter__button ${
                        selectedCategory === "all" ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      All Features
                    </motion.button>
                    {AUDIO_FEATURE_CATEGORIES.map((category) => (
                      <motion.button
                        key={category.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`filter__button ${
                          selectedCategory === category.key ? "active" : ""
                        }`}
                        onClick={() => setSelectedCategory(category.key)}
                        style={{
                          backgroundColor:
                            selectedCategory === category.key
                              ? category.color
                              : "transparent",
                          borderColor: category.color,
                        }}
                      >
                        {category.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="compare__chart"
              >
                <div className="chart__container">
                  {selectedCategory === "all" ? (
                    <Radar data={getChartData()} options={chartOptions} />
                  ) : (
                    <Bar data={getChartData()} options={barChartOptions} />
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="compare__empty"
            >
              <div className="empty__content">
                <div className="empty__icon">🎵</div>
                <h3>No tracks selected</h3>
                <p>
                  Search and add tracks to start comparing their audio features
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compare;
