import React, { useState, useEffect } from "react";
import Ship from "./components/Ship";
import "./App.css";
import { calculateExitTime } from "./components/utils"; // Import the calculateExitTime function

function App() {
  const [ships, setShips] = useState({});
  const [exitTimes, setExitTimes] = useState({});

  useEffect(() => {
    const eventSource = new EventSource(
      "https://shipohoi-backend.onrender.com:10000/data",
    );

    eventSource.onopen = () => {
      // når den får kontakt
      console.log("EventSource connected");
    };

    eventSource.onmessage = (event) => {
      // når det kommer ny melding
      try {
        const data = JSON.parse(event.data);
        console.log("Received ship data:", data);

        if (!data.mmsi) {
          console.error("No MMSI found for the ship", data);
          return;
        }

        // Update ship data in state with the latest info
        setShips((prevShips) => ({
          ...prevShips,
          [data.mmsi]: {
            ...prevShips[data.mmsi],
            ...data,
          },
        }));
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
      <header className="App-header">
        <h1>Ship Tracker</h1>
      </header>
      <main className="ships-container">
        {Object.values(ships).length > 0 ? (
          Object.values(ships).map((shipData) => (
            <Ship
              key={shipData.mmsi}
              data={shipData}
              exitTime={exitTimes[shipData.mmsi]} // Pass exit time to each Ship component
            />
          ))
        ) : (
          <p>No ships available yet.</p>
        )}
      </main>
    </div>
  );
}

export default App;
