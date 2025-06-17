document.addEventListener('DOMContentLoaded', () => {
    const TARGET_LAT = 38.4546337;
    const TARGET_LON = 27.2027813;
    const EARTH_RADIUS_KM = 6371;

    const startBtn = document.getElementById('start-btn');
    const permissionSection = document.getElementById('permission-section');
    const guidanceSection = document.getElementById('guidance-section');

    const arrowElement = document.getElementById('arrow');
    const distanceInfo = document.getElementById('distance-info');
    const headingInfo = document.getElementById('heading-info');
    const bearingInfo = document.getElementById('bearing-info');
    const statusInfo = document.getElementById('status-info');
    const debugInfo = document.getElementById('debug-info'); // For extra messages

    let currentLat, currentLon;
    let currentHeading; // Phone's compass heading
    let targetBearing;  // Bearing from user to target

    // --- Utility Functions ---
    function deg2rad(degrees) {
        return degrees * (Math.PI / 180);
    }

    function rad2deg(radians) {
        return radians * (180 / Math.PI);
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c * 1000; // Distance in meters
    }

    function calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = deg2rad(lat1);
        const φ2 = deg2rad(lat2);
        const λ1 = deg2rad(lon1);
        const λ2 = deg2rad(lon2);

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);
        return (rad2deg(θ) + 360) % 360; // Bearing in degrees (0-360)
    }

    // --- Event Handlers & Logic ---
    function handleLocationSuccess(position) {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
        updateGuidance();
    }

    function handleLocationError(error) {
        statusInfo.textContent = `Error getting location: ${error.message}`;
        console.error("Location error:", error);
    }

    function handleOrientation(event) {
        // alpha is the compass heading in degrees (0-360)
        // Check for iOS specific property `webkitCompassHeading`
        if (event.webkitCompassHeading) {
            currentHeading = event.webkitCompassHeading; // For iOS
        } else if (event.alpha !== null) {
            // Standard DeviceOrientationEvent
            // For many devices, alpha is 0 when pointing North.
            // Some devices might need event.absolute to be true.
            // We might need to adjust if alpha is relative. For simplicity, assume absolute.
            currentHeading = (360 - event.alpha) % 360; // Often, alpha is counter-clockwise from North.
                                                        // Or simply use event.alpha if it directly gives North as 0. Test this!
                                                        // Let's assume for now event.alpha is directly what we need or close to it
            currentHeading = event.alpha;
        } else {
            debugInfo.textContent = "Compass data not available or null.";
            return;
        }
        updateGuidance();
    }


    function updateGuidance() {
        if (currentLat === undefined || currentLon === undefined) {
            statusInfo.textContent = "Waiting for location data...";
            return;
        }
        if (currentHeading === undefined) {
            statusInfo.textContent = "Waiting for compass data...";
            return;
        }

        const distance = calculateDistance(currentLat, currentLon, TARGET_LAT, TARGET_LON);
        targetBearing = calculateBearing(currentLat, currentLon, TARGET_LAT, TARGET_LON);

        distanceInfo.textContent = `Distance: ${distance.toFixed(0)} m`;
        headingInfo.textContent = `Your Heading: ${currentHeading.toFixed(0)}°`;
        bearingInfo.textContent = `Target Bearing: ${targetBearing.toFixed(0)}°`;

        // Update Arrow
        // The arrow should point towards the target RELATIVE to the phone's current orientation.
        // If phone heading = 0 (North) and target bearing = 90 (East), arrow rotates 90deg right.
        // If phone heading = 90 (East) and target bearing = 90 (East), arrow rotates 0deg (points straight up).
        const rotationAngle = targetBearing - currentHeading;
        arrowElement.style.transform = `rotate(${rotationAngle}deg)`;

        // Update Hot/Cold Status & Background
        let statusMessage = "";
        let bodyClass = "";

        if (distance < 15) { // Within 15 meters
            statusMessage = "🎉 You're Here! 🎉";
            bodyClass = "status-here";
            arrowElement.textContent = "📍"; // Change to a pin
        } else if (distance < 50) {
            statusMessage = "🔥🔥 Burning Hot! 🔥🔥";
            bodyClass = "status-burning";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 150) {
            statusMessage = "🔥 Hot! 🔥";
            bodyClass = "status-hot";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 500) {
            statusMessage = "Warm";
            bodyClass = "status-warm";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 1500) {
            statusMessage = "Cool";
            bodyClass = "status-cool";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 5000) {
            statusMessage = "❄️ Cold ❄️";
            bodyClass = "status-cold";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else {
            statusMessage = "🥶 Freezing! 🥶";
            bodyClass = "status-freezing";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        }
        statusInfo.textContent = `Status: ${statusMessage}`;
        document.body.className = bodyClass; // Change background based on status
    }

    function requestPermissionsAndStart() {
        permissionSection.style.display = 'none';
        guidanceSection.style.display = 'block';

        // Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
                enableHighAccuracy: true,
                maximumAge: 5000, // Don't use a cached position older than 5 seconds
                timeout: 10000     // If 10 seconds pass, trigger error
            });
        } else {
            statusInfo.textContent = "Geolocation is not supported by this browser.";
            return;
        }

        // Device Orientation (Compass)
        // iOS requires a specific permission request for motion/orientation
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                    } else {
                        statusInfo.textContent = "Permission for device orientation not granted.";
                    }
                })
                .catch(error => {
                    statusInfo.textContent = "Error requesting device orientation permission.";
                    console.error("Orientation permission error:", error);
                });
        } else if ('DeviceOrientationEvent' in window) {
            // For Android and other browsers that don't require explicit permission here
            window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
            statusInfo.textContent = "Device orientation is not supported by this browser.";
        }
    }

    startBtn.addEventListener('click', requestPermissionsAndStart);
});