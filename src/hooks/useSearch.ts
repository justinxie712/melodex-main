import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { cacheService } from "../services/cacheService";
import { getAudioFeatures } from "../services/audioFeaturesService";
import type { AudioFeatures, Track } from "../types";

interface UseSearchProps {
  token: string | null;
  query: string;
  refreshToken: () => Promise<void>;
}

interface UseSearchReturn {
  results: Track[];
  showResults: boolean;
  isLoading: boolean;
  error: string | null;
  searchTracks: (searchQuery: string) => Promise<void>;
  fetchAudioFeatures: (trackId: string) => Promise<AudioFeatures | null>;
  setResults: React.Dispatch<React.SetStateAction<Track[]>>;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useSearch = ({
  token,
  query,
  refreshToken,
}: UseSearchProps): UseSearchReturn => {
  const [results, setResults] = useState<Track[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    results,
    showResults,
    isLoading,
    error,
    searchTracks,
    fetchAudioFeatures,
    setResults,
    setShowResults,
    setError,
    setIsLoading,
  };
};
