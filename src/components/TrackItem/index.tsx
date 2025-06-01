import { motion } from "framer-motion";
import "./styles.scss";
import { IoCloseSharp } from "react-icons/io5";

interface Artist {
  name: string;
}

interface Album {
  images: Array<{ url: string }>;
}

interface Track {
  id: string;
  name: string;
  color: string;
  album: Album;
  artists: Artist[];
}

interface TrackItemProps {
  track: Track;
  index: number;
  onRemove: (trackId: string) => void;
}

export const TrackItem = ({ track, index, onRemove }: TrackItemProps) => {
  const artistNames = track.artists.map((artist) => artist.name).join(", ");
  
  return (
    <motion.div
      key={track.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="track__item"
    >
      <div
        className="track__color-indicator"
        style={{ backgroundColor: track.color }}
      />
      <div className="track__info">
        <img
          src={track.album.images[2]?.url || track.album.images[0]?.url}
          alt={`Album artwork for ${track.name}`}
          className="track__image"
        />
        <div className="track__details">
          <h4>{track.name}</h4>
          <p>{artistNames}</p>
        </div>
      </div>
      <button 
        className="track__remove" 
        onClick={() => onRemove(track.id)}
        aria-label={`Remove track ${track.name} by ${artistNames} from comparison`}
        title={`Remove ${track.name} by ${artistNames}`}
      >
        <IoCloseSharp size={20} aria-hidden="true" />
      </button>
    </motion.div>
  );
};
