import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import "./styles.scss";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

const Profile: React.FC = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
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
        throw new Error("Failed to fetch. Token may have expired.");
      }

      const data = await res.json();
      setResults(data.tracks?.items || []);
      setShowResults(true);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
      setShowResults(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      searchTracks(searchQuery);
    }, 500),
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
  }, [query, debouncedSearch, results]);

  const handleButtonClick = () => {
    searchTracks(query);
  };

  return (
    <div className="profile__container">
      <div className="profile__search-container">
        <input
          type="text"
          placeholder="Search for a song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="profile__search-input"
        />
        <button onClick={handleButtonClick} className="profile__search-button">
          Search
        </button>
      </div>
      {error && <p className="profile__error">{error}</p>}
      <div className="profile__results-wrapper">
        {showResults && results.length > 0 && (
          <ul className="profile__results-list">
            {results.map((track) => (
              <li key={track.id} className="profile__track-item">
                <img
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  className="profile__track-image"
                />
                <div>
                  <p className="profile__track-name">{track.name}</p>
                  <p className="profile__track-artists">
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;
