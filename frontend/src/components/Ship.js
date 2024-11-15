import React, { useState } from "react";
import shipIcon from "../shipLogo.jpeg";

function Ship({ data, exitTime }) {
  const { name, mmsi, latitude, longitude, speedOverGround, courseOverGround } =
    data;

  // State to handle hover
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="ship"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="ship-icon"
        style={{
          transform: `rotate(${courseOverGround - 90}deg)`,
        }}
      >
        <img
          src={shipIcon}
          alt="Ship Icon"
          className="ship-image" // Apply CSS class for image styles
        />
      </div>
      <p className="ship-name">{name}</p>

      {isHovered && (
        <div className="ship-info">
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>MMSI:</strong> {mmsi}
          </p>
          <p>
            <strong>Latitude:</strong> {latitude.toFixed(5)}
          </p>
          <p>
            <strong>Longitude:</strong> {longitude.toFixed(5)}
          </p>
          <p>
            <strong>Speed:</strong> {speedOverGround} knots
          </p>
          <p>
            <strong>Heading:</strong> {courseOverGround}°
          </p>
          <p>
            <strong>Exit Time:</strong>{" "}
            {typeof exitTime === "number" ? `${exitTime} seconds` : exitTime}
          </p>
        </div>
      )}
    </div>
  );
}

export default Ship;
