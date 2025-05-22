import type { AudioFeatures } from "../types";
import { generateMockAudioFeatures } from "../utils/mockDataGenerator";
import { cacheService } from "./cacheService";

export const getAudioFeatures = async (
  trackId: string
): Promise<AudioFeatures> => {
  const cacheKey = `audioFeatures_${trackId}`;
  if (cacheService.has(cacheKey)) {
    return cacheService.get<AudioFeatures>(cacheKey)!;
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const mockData = generateMockAudioFeatures();

  // Cache the generated data
  cacheService.set(cacheKey, mockData);
  return mockData;
};
