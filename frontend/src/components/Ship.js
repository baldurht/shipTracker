import React, { useEffect, useState } from "react";
import "./Ship.css";

function Ship({ data, exitTime, bounds }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!bounds) return;

    // Horizontal position based on latitude (left-right)
    const horizontalPosition = ((data.latitude - bounds.latMin) / (bounds.latMax - bounds.latMin)) * 100;
    
    // Longitude affects vertical position and scale (west -> higher and smaller)
    const distanceFromEast = (bounds.lonMax - data.longitude) / (bounds.lonMax - bounds.lonMin);
    const scale = 1 - (distanceFromEast * 0.6); // Ships scale from 100% to 40% based on distance
    
    // Adjust vertical position based on scale - larger ships (closer) go lower
    const verticalPosition = 50 - (scale * 40); // This will put larger ships lower on screen
    
    setPosition({
      left: `${horizontalPosition}%`,
      top: `${verticalPosition}%`,
      transform: `scale(${scale})`,
      zIndex: Math.round((1 - distanceFromEast) * 100),
      transition: 'all 1s ease-out'
    });
}, [data.longitude, data.latitude, bounds]);

  if (!position) return null;

  // Handle null values with defaults
  const speed = data.speedOverGround ?? 0;
  const course = data.courseOverGround ?? 0;
  const shipName = data.name || `Ship ${data.mmsi}`;

  return (
    <div 
      className="ship"
      style={position}
    >
      <div 
        className="ship-icon"
        style={{
          transform: `rotate(${course + 90}deg)`
        }}
      >
        🚢
      </div>
      <div className="ship-name">{shipName}</div>
      <div className="ship-hover-info">
        <div>Name: {shipName}</div>
        <div>Speed: {speed.toFixed(1)} knots</div>
        <div>Heading: {course.toFixed(1)}°</div>
        <div>Exit Time: {exitTime || 'Calculating...'}</div>
      </div>
    </div>
  );
}

export default Ship;
