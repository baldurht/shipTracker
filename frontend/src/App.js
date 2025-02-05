import React, { useState, useEffect } from "react";
import Ship from "./components/Ship";
import "./App.css";
import { calculateExitTime } from "./components/utils"; // Import the calculateExitTime function

function App() {
  const [ships, setShips] = useState({});
  const [exitTimes, setExitTimes] = useState({});
  const [polygonBounds, setPolygonBounds] = useState(null);

  useEffect(() => {
    const polygonCoordinates = [
      [10.659531163693629, 59.89610516809168],
      [10.673500812335789, 59.87885330460057],
      [10.750226283167166, 59.89761428576347],
      [10.730451399765485, 59.908283179956356],
      [10.72658325851188, 59.90914516724291],
      [10.699076055987064, 59.91054589181482],
      [10.659531163693629, 59.89610516809168],
    ];

    // Calculate polygon bounds
    const bounds = {
      lonMin: Math.min(...polygonCoordinates.map(coord => coord[0])),
      lonMax: Math.max(...polygonCoordinates.map(coord => coord[0])),
      latMin: Math.min(...polygonCoordinates.map(coord => coord[1])),
      latMax: Math.max(...polygonCoordinates.map(coord => coord[1]))
    };
    setPolygonBounds(bounds);

    const eventSource = new EventSource(
      "https://shipohoi-backend.onrender.com/data",
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (!data.mmsi) {
          console.error("No MMSI found for the ship", data);
          return;
        }

        // Update ships state while preserving existing ships
        setShips((prevShips) => {
          const updatedShips = { ...prevShips };
          updatedShips[data.mmsi] = {
            ...updatedShips[data.mmsi],  // Preserve existing ship data
            ...data,                      // Update with new data
            lastUpdate: Date.now()        // Add timestamp for tracking
          };
          
          // Clean up ships that haven't been updated in 5 minutes
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          Object.keys(updatedShips).forEach(mmsi => {
            if (updatedShips[mmsi].lastUpdate < fiveMinutesAgo) {
              delete updatedShips[mmsi];
            }
          });
          
          return updatedShips;
        });
      } catch (error) {
        console.error("Error parsing data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource encountered an error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const polygonCoordinates = [
      [10.659531163693629, 59.89610516809168],
      [10.673500812335789, 59.87885330460057],
      [10.750226283167166, 59.89761428576347],
      [10.730451399765485, 59.908283179956356],
      [10.72658325851188, 59.90914516724291],
      [10.699076055987064, 59.91054589181482],
      [10.659531163693629, 59.89610516809168],
    ];

    const newExitTimes = { ...exitTimes };

    Object.values(ships).forEach((ship) => {
      // If speed is 0, skip calculation since it won't exit
      if (ship.speedOverGround === 0) {
        console.log(
          `MMSI ${ship.mmsi}: Ship is stationary, skipping exit time calculation.`,
        );
        return;
      }

      // Check if ship data has changed before recalculating
      const existingData = newExitTimes[ship.mmsi];
      const dataChanged =
        !existingData ||
        existingData.latitude !== ship.latitude ||
        existingData.longitude !== ship.longitude ||
        existingData.speedOverGround !== ship.speedOverGround;

      if (dataChanged) {
        const exitTime = calculateExitTime(ship, polygonCoordinates);
        console.log(`MMSI ${ship.mmsi}: Calculated exit time = ${exitTime}`);
        newExitTimes[ship.mmsi] = exitTime;
      } else {
        console.log(
          `MMSI ${ship.mmsi}: Exit time already calculated. Last exit time: ${newExitTimes[ship.mmsi]}`,
        );
      }
    });

    // Update state with new exit times
    setExitTimes(newExitTimes);
  }, [ships]); // Re-run this effect whenever ships data updates

  return (
    <div className="App">
      <main className="ships-container">
        {Object.values(ships).length > 0 ? (
          <div className="ships-wrapper">
            {Object.values(ships).map((shipData) => (
              <Ship
                key={shipData.mmsi}
                data={shipData}
                exitTime={exitTimes[shipData.mmsi]}
                bounds={polygonBounds}
              />
            ))}
          </div>
        ) : (
          <p>No ships available yet.</p>
        )}
      </main>
    </div>
  );
}

export default App;
