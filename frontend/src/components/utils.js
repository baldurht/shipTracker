// Function to calculate the exit time when the ship moves out of the polygon
export function calculateExitTime(ship, polygonVertices) {
  // If ship speed is 0, return immediately since it won't exit
  if (ship.speedOverGround === 0) {
    console.log(
      `Ship with MMSI ${ship.mmsi} is stationary. No exit calculation needed.`,
    );
    return "Stationary";
  }

  // Current position of the ship
  let currentPosition = { latitude: ship.latitude, longitude: ship.longitude };
  let timeInSeconds = 0;

  // Convert speed to nautical miles per second
  const speedInNMPerSecond = ship.speedOverGround / 3600; 

  // Monitor ship's movement until it exits the polygon
  while (true) {
    // Check if the ship is outside the polygon (exit condition)
    if (!isInsidePolygon(currentPosition, polygonVertices)) {
      console.log(
        `Ship with MMSI ${ship.mmsi} exited the polygon after ${timeInSeconds} seconds.`,
      );
      return timeInSeconds;
    }

    // Update the ship's position based on its speed and course
    // Use trigonometry to calculate changes in lat and lon
    let deltaLat = speedInNMPerSecond * Math.cos(toRadians(ship.trueHeading)); // Change in latitude
    let deltaLon = speedInNMPerSecond * Math.sin(toRadians(ship.trueHeading)); // Change in longitude

    // Adjust latitude and longitude
    currentPosition.latitude += deltaLat / 60; // 1 minute of latitude = 1 nautical mile
    currentPosition.longitude +=
      deltaLon / (60 * Math.cos(toRadians(currentPosition.latitude))); // 1 minute of longitude = 1 nautical mile / cos(latitude)

    timeInSeconds += 1; // Increase time by 1 second

    // If the time exceeds a threshold (e.g., 2 hours), exit detection is no longer possible
    if (timeInSeconds > 7200) {
      console.log(`Ship with MMSI ${ship.mmsi} couldn't exit within 2 hours.`);
      return "Exit not possible within 2 hours";
    }
  }
}

// Function to check if a point (ship position) is inside the polygon
function isInsidePolygon(point, polygonVertices) {
  let x = point.longitude;
  let y = point.latitude;
  let isInside = false;

  for (
    let i = 0, j = polygonVertices.length - 1;
    i < polygonVertices.length;
    j = i++
  ) {
    let vertex1X = polygonVertices[i][0],
      vertex1Y = polygonVertices[i][1];
    let vertex2X = polygonVertices[j][0],
      vertex2Y = polygonVertices[j][1];
    let isIntersecting =
      vertex1Y > y !== vertex2Y > y &&
      x <
        ((vertex2X - vertex1X) * (y - vertex1Y)) / (vertex2Y - vertex1Y) +
          vertex1X;

    if (isIntersecting) {
      isInside = !isInside;
    }
  }

  return isInside;
}

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}
