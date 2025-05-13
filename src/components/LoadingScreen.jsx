import React from "react";

const LoadingScreen = ({ size = 40, color = "#3B82F6" }) => {
  const circleStyle = {
    width: size,
    height: size,
    border: `4px solid ${color}`,
    borderTop: "4px solid transparent",
    borderRadius: "50%",
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div
        className="animate-spin"
        style={circleStyle}
      ></div>
    </div>
  );
};

export default LoadingScreen;