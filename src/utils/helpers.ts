import type { AudioFeatures } from "../types";

export const getRandomNumber = (
  min: number,
  max: number,
  decimals = 2
): number => {
  const random = Math.random() * (max - min) + min;
  return Number(random.toFixed(decimals));
};

export const generateMockAudioFeatures = (): AudioFeatures => {
  return {
    danceability: getRandomNumber(0, 1),
    energy: getRandomNumber(0, 1),
    key: Math.floor(getRandomNumber(0, 11, 0)),
    loudness: getRandomNumber(-60, 0),
    mode: Math.round(getRandomNumber(0, 1, 0)),
    speechiness: getRandomNumber(0, 1),
    acousticness: getRandomNumber(0, 1),
    instrumentalness: getRandomNumber(0, 1),
    liveness: getRandomNumber(0, 1),
    valence: getRandomNumber(0, 1),
    tempo: getRandomNumber(50, 200),
    duration_ms: Math.floor(getRandomNumber(60000, 420000, 0)),
    time_signature: Math.floor(getRandomNumber(3, 7, 0)),
  };
};

export const refreshToken = async () => {
  // Redirect to login page to get a fresh token
  window.location.href = "/"; // Adjust this to your login page URL
};
