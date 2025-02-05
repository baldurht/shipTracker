import React, { useEffect, useState } from "react";
import "./Ship.css";

function Ship({ data, exitTime, bounds }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!bounds) return;

    const relativeX = ((data.longitude - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * 100;
    const relativeY = ((data.latitude - bounds.latMin) / (bounds.latMax - bounds.latMin)) * 100;

    setPosition({
      left: `${relativeX}%`,
      top: `${relativeY}%`,
      transition: 'all 1s ease-out'
    });
  }, [data.longitude, data.latitude, bounds]);

  if (!position) return null;

  return (
    <div 
      className="ship"
      style={{
        ...position,
      }}
    >
      <div 
        className="ship-icon"
        style={{
          transform: `rotate(${data.courseOverGround + 90}deg)`
        }}
      >
        🚢
      </div>
      <div className="ship-name">{data.name || `Ship ${data.mmsi}`}</div>
    </div>
  );
}

export default Ship;
