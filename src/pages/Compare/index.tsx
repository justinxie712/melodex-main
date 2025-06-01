import React, { useState } from "react";
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
import { Bar, Radar } from "react-chartjs-2";
import SearchBar from "../../components/SearchBar";
import { refreshToken } from "../../utils/helpers";
import type { AudioFeatures, CompareTrack, Track } from "../../types";
import "./styles.scss";
import SpinnerWidget from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import {
  AUDIO_FEATURE_CATEGORIES,
  barChartOptions,
  chartOptions,
} from "../../utils/constants";
import { TrackItem } from "../../components/TrackItem";
import { useSearch } from "../../hooks/useSearch";

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

const TRACK_COLORS = ["#1DB954", "#E22134", "#FF6B35", "#9B59B6"];

const Compare: React.FC = () => {
  const [query, setQuery] = useState("");
  const [compareTracks, setCompareTracks] = useState<CompareTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const token = localStorage.getItem("spotify_token");

  const {
    results,
    showResults,
    isLoading,
    error,
    fetchAudioFeatures,
    setShowResults,
    setError,
    setIsLoading,
  } = useSearch({ token, query, refreshToken });

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
            onClearInput={handleClear}
            onClearSelections={() => {
              setCompareTracks([]);
              setShowResults(false);
            }}
            disableClearSelections={!compareTracks.length}
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
                        <TrackItem
                          key={track.id}
                          track={track}
                          index={index}
                          onRemove={removeTrack}
                        />
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
            <EmptyState
              title={"No track selected"}
              description={
                "Search and add tracks to start comparing their audio features"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Compare;
