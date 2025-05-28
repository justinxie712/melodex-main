import React, { useRef, useEffect, useState } from "react";
import "./styles.scss";
import type { SearchBarProps } from "../../types";
import { X } from "lucide-react";

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  results,
  showResults: propShowResults,
  closeResults,
  error,
  onQueryChange,
  onClearInput,
  onClearSelections,
  onResultsChange,
  disableClearSelections,
}) => {
  const [localShowResults, setLocalShowResults] = useState(propShowResults);
  const resultsWrapperRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputInteraction = () => {
    if (results.length > 0 && query.trim() !== "") {
      setLocalShowResults(true);
    }
  };

  useEffect(() => {
    setLocalShowResults(propShowResults);
  }, [propShowResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideResults =
        resultsWrapperRef.current &&
        !resultsWrapperRef.current.contains(target);
      const isOutsideSearch =
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target);

      if (isOutsideResults && isOutsideSearch) {
        setLocalShowResults(false);
        if (closeResults) closeResults();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeResults]);

  return (
    <div className="search-bar">
      <div className="search-bar__container" ref={searchContainerRef}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a song..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onClick={handleInputInteraction}
          onFocus={handleInputInteraction}
          className="search-bar__input"
        />
        <button onClick={onClearInput} className="search-bar__button">
          Clear
        </button>
        <button
          disabled={disableClearSelections}
          className="profile__close-button"
          onClick={onClearSelections}
          aria-label="Close track details"
        >
          <X size={20} />
        </button>
      </div>
      {error && <p className="search-bar__error">{error}</p>}
      <div className="search-bar__results-wrapper" ref={resultsWrapperRef}>
        {localShowResults && results.length > 0 && (
          <ul className="search-bar__results-list">
            {results.map((track) => (
              <li
                key={track.id}
                className="search-bar__track-item"
                onClick={() => {
                  onResultsChange(track);
                  setLocalShowResults(false);
                }}
              >
                <img
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  className="search-bar__track-image"
                />
                <div className="search-bar__track-info">
                  <p className="search-bar__track-name">{track.name}</p>
                  <p className="search-bar__track-artists">
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

export default SearchBar;
