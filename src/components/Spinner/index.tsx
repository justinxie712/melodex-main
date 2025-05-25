import React from "react";
import { Loader2 } from "lucide-react";
import "./styles.scss";

const SpinnerWidget: React.FC<{ label?: string }> = ({
  label = "Loading...",
}) => {
  return (
    <div className="spinner">
      <Loader2 className="spinner__icon" />
      <span className="spinner__label">{label}</span>
    </div>
  );
};

export default SpinnerWidget;
