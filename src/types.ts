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
  disableClearSelections: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;
  onClearInput: () => void;
  onClearSelections: () => void;
  closeResults: () => void;
  onResultsChange: (result: any) => void;
}

export interface NavbarProps {
  isLoggedIn: boolean;
  title: string;
  profile: { display_name: string } | null;
  onLogout: () => void;
}

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  className?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  popularity: number;
}

export interface TrackDetailProps {
  track: Track;
  audioFeatures: any;
}

export interface CompareTrack extends Track {
  audioFeatures: AudioFeatures | null;
  color: string;
}
