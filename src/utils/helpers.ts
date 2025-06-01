import type { AudioFeatures } from "../types";
import { featureConfig, keyNames } from "./constants";

export const getRandomNumber = (
  min: number,
  max: number,
  decimals = 2
): number => {
  const random = Math.random() * (max - min) + min;
  return Number(random.toFixed(decimals));
};

export const refreshToken = async () => {
  // Redirect to login page to get a fresh token
  window.location.href = "/"; // Adjust this to your login page URL
};

export const createKeyChartData = (audioFeatures: AudioFeatures | null) => {
  const keyColor = "#E91E63";
  const normalizedValue = (((audioFeatures?.key ?? 0) + 1) / 12) * 100;

  return {
    labels: ["Key"],
    datasets: [
      {
        data: [normalizedValue, 100 - normalizedValue],
        backgroundColor: [keyColor, "#282828"],
        borderColor: [keyColor, "#282828"],
        borderWidth: 1,
        cutout: "75%",
        circumference: 360,
        rotation: 270,
      },
    ],
  };
};

export const createChartData = (
  featureKey: string,
  value: number,
  maxValue: number,
  color: string
) => {
  const normalizedValue =
    featureKey === "tempo"
      ? Math.min(value / maxValue, 1) * 100
      : (value / maxValue) * 100;

  return {
    labels: [
      featureKey === "popularity"
        ? "Popularity"
        : featureConfig[featureKey]?.label,
    ],
    datasets: [
      {
        data: [normalizedValue, 100 - normalizedValue],
        backgroundColor: [color, "#282828"],
        borderColor: [color, "#282828"],
        borderWidth: 1,
        cutout: "75%",
        circumference: 360,
        rotation: 270,
      },
    ],
  };
};

export const createPopularityChartData = (popularity: number) => {
  const popularityColor = "#1DB954"; // Spotify green

  return createChartData("popularity", popularity, 100, popularityColor);
};

export const formatFeatureValue = (key: string, value: number) => {
  if (key === "tempo") {
    return Math.round(value);
  }
  return key === "popularity" ? value : value.toFixed(2);
};

export const getKeyName = (audioFeatures: AudioFeatures | null) => {
  if (
    !audioFeatures ||
    typeof audioFeatures.key !== "number" ||
    audioFeatures.key < 0 ||
    audioFeatures.key > 11
  ) {
    return "Unknown";
  }
  return keyNames[audioFeatures.key];
};

export const getModeName = (audioFeatures: AudioFeatures | null) => {
  if (!audioFeatures || typeof audioFeatures.mode !== "number") {
    return "";
  }
  return audioFeatures.mode === 1 ? "Major" : "Minor";
};

export const getKeyAccessibleDescription = (
  audioFeatures: AudioFeatures | null
) => {
  const keyName = getKeyName(audioFeatures);
  const modeName = getModeName(audioFeatures);
  return `Musical key: ${keyName} ${modeName}`;
};

export const getAccessibleDescription = (
  key: string,
  value: number,
  maxValue: number
) => {
  if (key === "popularity") {
    return `Popularity: ${value} out of 100`;
  }
  if (key === "tempo") {
    return `Tempo: ${Math.round(value)} beats per minute`;
  }
  const percentage = Math.round((value / maxValue) * 100);
  return `${featureConfig[key].label}: ${value.toFixed(
    2
  )} out of ${maxValue}, which is ${percentage} percent`;
};

export const getNumericFeatures = (audioFeatures: AudioFeatures | null) => {
  const features: Record<string, number> = {};

  if (audioFeatures) {
    Object.entries(audioFeatures).forEach(([key, value]) => {
      if (typeof value === "number" && key in featureConfig) {
        features[key] = value as number;
      }
    });
  }

  return features;
};
