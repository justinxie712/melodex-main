import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./styles.scss";
import type { TrackDetailProps } from "../../types";
import { featureConfig, trackDetailChartOptions } from "../../utils/constants";
import {
  createChartData,
  createKeyChartData,
  createPopularityChartData,
  formatFeatureValue,
  getAccessibleDescription,
  getKeyAccessibleDescription,
  getKeyName,
  getModeName,
  getNumericFeatures,
} from "../../utils/helpers";

ChartJS.register(ArcElement, Tooltip, Legend);

const TrackDetail: React.FC<TrackDetailProps> = ({ track, audioFeatures }) => {
  const artistNames = track.artists.map((a) => a.name).join(", ");
  const albumImage = track.album.images[0]?.url || "";
  const numericFeatures = getNumericFeatures(audioFeatures);
  const keyName = getKeyName(audioFeatures);
  const modeName = getModeName(audioFeatures);

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
          <div
            role="img"
            aria-label={getAccessibleDescription(
              "popularity",
              track.popularity,
              100
            )}
          >
            <Doughnut
              data={createPopularityChartData(track.popularity)}
              options={trackDetailChartOptions}
              aria-hidden="true"
            />
          </div>
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
              <div
                role="img"
                aria-label={getKeyAccessibleDescription(audioFeatures)}
              >
                <Doughnut
                  data={createKeyChartData(audioFeatures)}
                  options={trackDetailChartOptions}
                  aria-hidden="true"
                />
              </div>
              <div className="track-detail__feature-label">
                <span className="track-detail__feature-value">{keyName}</span>
                <span className="track-detail__feature-text">
                  {`${modeName} Key`}
                </span>
              </div>
            </div>
          </div>
        )}
        {Object.entries(numericFeatures).map(([key, value]) => (
          <div key={key} className="track-detail__feature-item">
            <div className="track-detail__chart-container">
              <div
                role="img"
                aria-label={getAccessibleDescription(
                  key,
                  value,
                  featureConfig[key].maxValue
                )}
              >
                <Doughnut
                  data={createChartData(
                    key,
                    value,
                    featureConfig[key].maxValue,
                    featureConfig[key].color
                  )}
                  options={trackDetailChartOptions}
                  aria-hidden="true"
                />
              </div>
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
