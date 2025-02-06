document.addEventListener('DOMContentLoaded', () => {
    const shipContainer = document.getElementById('ships-container');

    function createPolygon(position, direction, fovDegrees = 120, viewDistance = 0.03) {
        const lat = parseFloat(position.lat);
        const lng = parseFloat(position.lng);
        const dir = parseFloat(direction);
        
        // Convert FOV to radians
        const fovRad = (fovDegrees * Math.PI) / 180;
        const leftAngle = (dir - fovDegrees/2) * (Math.PI / 180);
        const rightAngle = (dir + fovDegrees/2) * (Math.PI / 180);
        const midAngle = dir * (Math.PI / 180);
        
        // Calculate polygon points with intermediate points
        const points = [
            [lng, lat], // Observer position
            [
                lng + (viewDistance * 0.4) * Math.sin(leftAngle),
                lat + (viewDistance * 0.4) * Math.cos(leftAngle)
            ],
            [
                lng + viewDistance * Math.sin(leftAngle),
                lat + viewDistance * Math.cos(leftAngle)
            ],
            [
                lng + (viewDistance * 1.2) * Math.sin(midAngle),
                lat + (viewDistance * 1.2) * Math.cos(midAngle)
            ],
            [
                lng + viewDistance * Math.sin(rightAngle),
                lat + viewDistance * Math.cos(rightAngle)
            ],
            [
                lng + (viewDistance * 0.4) * Math.sin(rightAngle),
                lat + (viewDistance * 0.4) * Math.cos(rightAngle)
            ],
            [lng, lat] // Close the polygon
        ];
        
        // Format as GeoJSON
        const geoJSON = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        coordinates: [points],
                        type: "Polygon"
                    }
                }
            ]
        };
        
        console.log('Created GeoJSON:', geoJSON);
        
        return geoJSON;
    }

    function updateViewingArea() {
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        const direction = document.getElementById('direction').value;
        
        console.log('Form values:', { lat, lng, direction });
        
        const geoJSON = createPolygon({lat, lng}, direction);
        
        console.log('Sending GeoJSON to backend:', geoJSON);
        
        fetch('http://localhost:8000/update-polygon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                polygon: geoJSON.features[0].geometry.coordinates[0]
            })
        }).then(response => response.json())
          .then(data => console.log('Backend response:', data))
          .catch(error => console.error('Error updating polygon:', error));
    }

    // Modified form HTML to remove inline onclick
    // Change this part of the code
    document.getElementById('position-form-container').insertAdjacentHTML('beforeend', `
        <div class="position-form">
            <h2>Set Your Position</h2>
            <div class="form-group">
                <label for="latitude">Latitude:</label>
                <input type="number" id="latitude" step="0.000001" value="59.614">
            </div>
            <div class="form-group">
                <label for="longitude">Longitude:</label>
                <input type="number" id="longitude" step="0.000001" value="10.411">
            </div>
            <div class="form-group">
                <label for="direction">Viewing Direction (degrees):</label>
                <input type="number" id="direction" min="0" max="360" value="0">
            </div>
            <button id="getCurrentLocation" class="secondary-button">📍 Use Current Location</button>
            <button id="updateView">Update View</button>
        </div>
    `);

    // Add getCurrentLocation function
    function getCurrentLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    document.getElementById('latitude').value = position.coords.latitude;
                    document.getElementById('longitude').value = position.coords.longitude;
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please check your browser permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    }

    // Add event listeners
    document.getElementById('updateView').addEventListener('click', updateViewingArea);
    document.getElementById('getCurrentLocation').addEventListener('click', getCurrentLocation);

    function formatValue(value, unit = '') {
        return value ? `${value}${unit}` : 'N/A';
    }

    function updateShipDisplay(shipData) {
        const course = shipData.courseOverGround || 0;
        const isHeadingNorth = course > 270 || course < 90;
        
        shipContainer.innerHTML = `
            <div class="ship-card">
                <div class="ship-illustration">
                    <img src="ship.png" alt="Ship" class="${isHeadingNorth ? 'heading-north' : 'heading-south'}">
                </div>
                <h3>${shipData.name || `Ship ${shipData.mmsi}`}</h3>
                <div class="ship-details">
                    <p>
                        <span>MMSI</span>
                        <span>${formatValue(shipData.mmsi)}</span>
                    </p>
                    <p>
                        <span>Position</span>
                        <span>${formatValue(shipData.latitude, '°N')}, ${formatValue(shipData.longitude, '°E')}</span>
                    </p>
                    <p>
                        <span>Speed</span>
                        <span>${formatValue(shipData.speedOverGround, ' knots')}</span>
                    </p>
                    <p>
                        <span>Course</span>
                        <span>${formatValue(shipData.courseOverGround, '°')}</span>
                    </p>
                </div>
            </div>
        `;
    }

    const eventSource = new EventSource('http://localhost:8000/data');

    eventSource.onmessage = (event) => {
        try {
            const shipData = JSON.parse(event.data);
            updateShipDisplay(shipData);
        } catch (error) {
            console.error('Error parsing ship data:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
});