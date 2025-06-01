import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../../components/SearchBar";
import TrackDetail from "../../components/TrackDetail";
import "./styles.scss";
import type { AudioFeatures, Track } from "../../types";
import { refreshToken } from "../../utils/helpers";
import SpinnerWidget from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import { useSearch } from "../../hooks/useSearch";

const Profile: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(
    null
  );
  const token = localStorage.getItem("spotify_token");

  const {
    results,
    showResults,
    isLoading,
    error,
    fetchAudioFeatures,
    setShowResults,
    setError,
  } = useSearch({ token, query, refreshToken });

  const fetchTrackAudioFeatures = async (trackId: string) => {
    if (!trackId) return;
    try {
      const features = await fetchAudioFeatures(trackId);
      setAudioFeatures(features);
      setError(null);
    } catch (err) {
      setAudioFeatures(null);
      setError(`Error: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    if (selectedTrack) {
      fetchTrackAudioFeatures(selectedTrack.id);
    } else {
      setAudioFeatures(null);
    }
  }, [selectedTrack]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleClear = () => {
    setQuery("");
  };

  const handleResultsChange = (result: Track & { popularity: number }) => {
    setSelectedTrack(result);
  };

  return (
    <div className="profile">
      <div className="profile__container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="profile__header"
        >
          <h1>Track Analysis</h1>
          <p>Search for a track to explore its audio features</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="profile__search"
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
              setSelectedTrack(null);
              setShowResults(false);
            }}
            disableClearSelections={!selectedTrack}
            onResultsChange={handleResultsChange}
          />
        </motion.div>
        {isLoading && !selectedTrack ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="profile__loading"
          >
            <SpinnerWidget />
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedTrack ? (
              <motion.div
                key="track-detail"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5 }}
                className="profile__track-detail"
              >
                <TrackDetail
                  track={selectedTrack}
                  audioFeatures={audioFeatures}
                />
              </motion.div>
            ) : (
              <EmptyState
                title={"No track selected"}
                description={
                  "Search for a track above to view its detailed audio analysis"
                }
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Profile;
