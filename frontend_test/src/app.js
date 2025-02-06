document.addEventListener('DOMContentLoaded', () => {
    const shipContainer = document.getElementById('ships-container');

    function formatValue(value, unit = '') {
        return value ? `${value}${unit}` : 'N/A';
    }

    function updateShipDisplay(shipData) {
        const rotation = shipData.courseOverGround || 0;
        shipContainer.innerHTML = `
            <div class="ship-card">
                <div class="ship-illustration">
                    <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg);">
                        <path d="M500 179.5L179.5 820.5h641L500 179.5zm0 100l229.8 461H270.2L500 279.5z" fill="currentColor"/>
                    </svg>
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