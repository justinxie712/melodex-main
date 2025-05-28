import React from "react";
import { motion } from "framer-motion";
import "./styles.scss";
import type { EmptyStateProps } from "../../types";

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "🎵",
  title,
  description,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`empty-state ${className}`}
    >
      <div className="empty-state__content">
        <div className="empty-state__icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
};

export default EmptyState;
