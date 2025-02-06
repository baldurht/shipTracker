document.addEventListener('DOMContentLoaded', () => {
    const shipContainer = document.getElementById('ships-container');

    function formatValue(value, unit = '') {
        return value ? `${value}${unit}` : 'N/A';
    }

    function updateShipDisplay(shipData) {
        const course = shipData.courseOverGround || 0;
        // Determine if ship is heading north (between 270 and 90 degrees)
        const isHeadingNorth = course > 270 || course < 90;
        
        shipContainer.innerHTML = `
            <div class="ship-card">
                <div class="ship-illustration">
                    <img src="ship.png" alt="Ship" class="${isHeadingNorth ? 'heading-north' : 'heading-south'}">
                </div>
                <h3>${shipData.name || `Ship ${shipData.mmsi}`}</h3>
                <p>
                    <span>MMSI:</span>
                    <span>${formatValue(shipData.mmsi)}</span>
                </p>
                <p>
                    <span>Position:</span>
                    <span>${formatValue(shipData.latitude, '°N')}, ${formatValue(shipData.longitude, '°E')}</span>
                </p>
                <p>
                    <span>Speed:</span>
                    <span>${formatValue(shipData.speedOverGround, ' knots')}</span>
                </p>
                <p>
                    <span>Course:</span>
                    <span>${formatValue(shipData.courseOverGround, '°')}</span>
                </p>
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