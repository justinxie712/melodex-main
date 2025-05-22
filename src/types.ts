export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  popularity: number;
}

export interface AudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
  id?: string;
}

export interface SearchBarProps {
  query: string;
  results: Track[];
  showResults: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  closeResults: () => void;
  onResultsChange: (result: any) => void;
}
