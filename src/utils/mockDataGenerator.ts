import type { AudioFeatures } from "../types";

export const generateMockAudioFeatures = (): AudioFeatures => {
  return {
    acousticness: Math.random(),
    danceability: Math.random(),
    energy: Math.random(),
    instrumentalness: Math.random(),
    liveness: Math.random(),
    loudness: -Math.random() * 20,
    speechiness: Math.random(),
    tempo: 60 + Math.random() * 120, // Between 60-180 BPM
    valence: Math.random(),
    key: Math.floor(Math.random() * 12), // 0-11 representing musical keys
    mode: Math.random() > 0.5 ? 1 : 0, // 0 for minor, 1 for major
    time_signature: [3, 4, 5][Math.floor(Math.random() * 3)], // Common time signatures
    id: "",
    duration_ms: 120000 + Math.random() * 240000,
  };
};
