import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import SearchBar from "../../components/SearchBar";
import TrackDetail from "../../components/TrackDetail";
import "./styles.scss";
import type { AudioFeatures, Track } from "../../types";
import { getAudioFeatures } from "../../services/audioFeaturesService";
import { refreshToken } from "../../utils/helpers";

const Profile: React.FC = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("spotify_token");

  const searchTracks = async (searchQuery: string) => {
    if (!searchQuery || !token) return;

    try {
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
    }
  };

  const fetchAudioFeatures = async (trackId: string) => {
    if (!trackId) return;
    try {
      const features = await getAudioFeatures(trackId);
      setAudioFeatures(features);
      setError(null);
    } catch (err) {
      setAudioFeatures(null);
      setError(`Error: ${(err as Error).message}`);
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
    setSelectedTrack(null);
  };

  const handleResultsChange = (result: Track & { popularity: number }) => {
    setSelectedTrack(result);
  };

  return (
    <div className="profile__container">
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
      {selectedTrack && (
        <TrackDetail track={selectedTrack} audioFeatures={audioFeatures} />
      )}
    </div>
  );
};
export default Profile;
