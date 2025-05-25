import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../../components/SearchBar";
import TrackDetail from "../../components/TrackDetail";
import "./styles.scss";
import type { AudioFeatures, Track } from "../../types";
import { getAudioFeatures } from "../../services/audioFeaturesService";
import { refreshToken } from "../../utils/helpers";
import SpinnerWidget from "../../components/Spinner";
import { X } from "lucide-react";

const Profile: React.FC = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("spotify_token");

  const searchTracks = async (searchQuery: string) => {
    if (!searchQuery || !token) return;

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

  const fetchAudioFeatures = async (trackId: string) => {
    if (!trackId) return;
    try {
      setIsLoading(true);
      const features = await getAudioFeatures(trackId);
      setAudioFeatures(features);
      setError(null);
    } catch (err) {
      setAudioFeatures(null);
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Clear results when query is empty
      setResults([]);
      setShowResults(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  useEffect(() => {
    if (selectedTrack) {
      fetchAudioFeatures(selectedTrack.id);
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
          onClear={handleClear}
          onResultsChange={handleResultsChange}
        />
        <button
          style={{ visibility: selectedTrack ? "visible" : "hidden" }}
          className="profile__close-button"
          onClick={() => setSelectedTrack(null)}
          aria-label="Close track details"
        >
          <X size={20} />
        </button>
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
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="profile__empty"
            >
              <div className="empty__content">
                <div className="empty__icon">🎵</div>
                <h3>No track selected</h3>
                <p>
                  Search for a track above to view its detailed audio analysis
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Profile;
