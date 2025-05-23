import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./styles.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  popularity: number;
}

interface TrackDetailProps {
  track: Track;
  audioFeatures: any;
}

const TrackDetail: React.FC<TrackDetailProps> = ({ track, audioFeatures }) => {
  // Musical key mapping (0-11 to note names)
  const keyNames = [
    "C",
    "C♯/D♭",
    "D",
    "D♯/E♭",
    "E",
    "F",
    "F♯/G♭",
    "G",
    "G♯/A♭",
    "A",
    "A♯/B♭",
    "B",
  ];

  const featureConfig: Record<
    string,
    { color: string; maxValue: number; label: string }
  > = {
    danceability: { color: "#FF4500", maxValue: 1, label: "Danceability" },
    energy: { color: "#FFD700", maxValue: 1, label: "Energy" },
    acousticness: { color: "#4169E1", maxValue: 1, label: "Acousticness" },
    instrumentalness: {
      color: "#9370DB",
      maxValue: 1,
      label: "Instrumentalness",
    },
    liveness: { color: "#32CD32", maxValue: 1, label: "Liveness" },
    speechiness: { color: "#FF69B4", maxValue: 1, label: "Speechiness" },
    valence: { color: "#00CED1", maxValue: 1, label: "Valence" },
    tempo: { color: "#FF8C00", maxValue: 200, label: "Tempo" },
  };

  const getNumericFeatures = () => {
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

  const numericFeatures = getNumericFeatures();

  const createChartData = (
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

  const createPopularityChartData = () => {
    const popularityColor = "#1DB954"; // Spotify green

    return createChartData(
      "popularity",
      track.popularity,
      100,
      popularityColor
    );
  };

  const createKeyChartData = () => {
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const artistNames = track.artists.map((a) => a.name).join(", ");
  const albumImage = track.album.images[0]?.url || "";

  const formatFeatureValue = (key: string, value: number) => {
    if (key === "tempo") {
      return Math.round(value);
    }
    return key === "popularity" ? value : value.toFixed(2);
  };

  const getKeyName = () => {
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

  const getModeName = () => {
    if (!audioFeatures || typeof audioFeatures.mode !== "number") {
      return "";
    }
    return audioFeatures.mode === 1 ? "Major" : "Minor";
  };

  return (
    <div className="track-detail">
      <div className="track-detail__header">
        <div className="track-detail__image-container">
          <img
            src={albumImage}
            alt={`${track.name} album cover`}
            className="track-detail__album-image"
          />
        </div>
        <div className="track-detail__info">
          <h2 className="track-detail__title">{track.name}</h2>
          <p className="track-detail__artist">{artistNames}</p>
        </div>
        <div className="track-detail__popularity-chart">
          <Doughnut data={createPopularityChartData()} options={chartOptions} />
          <div className="track-detail__feature-label">
            <span className="track-detail__feature-value">
              {track.popularity}
            </span>
            <span className="track-detail__feature-text">Popularity</span>
          </div>
        </div>
      </div>

      <div className="track-detail__features-grid">
        {audioFeatures && typeof audioFeatures.key === "number" && (
          <div className="track-detail__feature-item">
            <div className="track-detail__chart-container">
              <Doughnut data={createKeyChartData()} options={chartOptions} />
              <div className="track-detail__feature-label">
                <span className="track-detail__feature-value">
                  {getKeyName()}
                </span>
                <span className="track-detail__feature-text">
                  {getModeName()} Key
                </span>
              </div>
            </div>
          </div>
        )}
        {Object.entries(numericFeatures).map(([key, value]) => (
          <div key={key} className="track-detail__feature-item">
            <div className="track-detail__chart-container">
              <Doughnut
                data={createChartData(
                  key,
                  value,
                  featureConfig[key].maxValue,
                  featureConfig[key].color
                )}
                options={chartOptions}
              />
              <div className="track-detail__feature-label">
                <span className="track-detail__feature-value">
                  {formatFeatureValue(key, value)}
                  {key === "tempo" && " BPM"}
                </span>
                <span className="track-detail__feature-text">
                  {featureConfig[key].label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TrackDetail;
