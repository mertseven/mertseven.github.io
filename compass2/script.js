document.addEventListener('DOMContentLoaded', () => {
    const TARGET_LAT = 38.4546337;
    const TARGET_LON = 27.2027813;
    const EARTH_RADIUS_KM = 6371;

    const startBtn = document.getElementById('start-btn');
    const permissionSection = document.getElementById('permission-section');
    const guidanceSection = document.getElementById('guidance-section');
    const cameraFeed = document.getElementById('camera-feed');

    const arrowElement = document.getElementById('arrow');
    const distanceInfo = document.getElementById('distance-info');
    const statusInfo = document.getElementById('status-info');

    // Debug elements
    const headingVal = document.getElementById('heading-val');
    const bearingVal = document.getElementById('bearing-val');
    const coordsVal = document.getElementById('coords-val');
    const debugInfoContainer = document.getElementById('debug-info'); // The div holding debug <p>

    let currentLat, currentLon;
    let currentHeading;
    let targetBearing;
    let orientationEventListened = false; // Flag to ensure listener is added once

    // --- Utility Functions ---
    function deg2rad(degrees) {
        return degrees * (Math.PI / 180);
    }

    function rad2deg(radians) {
        return radians * (180 / Math.PI);
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined) return Infinity;
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
        if (lat1 === undefined || lon1 === undefined) return 0;
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
        if (coordsVal) { // Update debug info
            coordsVal.textContent = `${currentLat.toFixed(5)}, ${currentLon.toFixed(5)} (acc: ${position.coords.accuracy.toFixed(0)}m)`;
        }
        updateGuidance();
    }

    function handleLocationError(error) {
        statusInfo.textContent = `Location Error: ${error.message}`;
        console.error("Location error:", error);
        if (coordsVal) coordsVal.textContent = "Error";
    }

    function handleOrientation(event) {
        let heading = null;
        // Prioritize webkitCompassHeading for iOS
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            heading = event.webkitCompassHeading;
        }
        // Then try alpha from deviceorientationabsolute
        else if (event.absolute === true && event.alpha !== null) { // event.absolute indicates it's absolute
            heading = event.alpha; // Typically, 0 is North, clockwise.
                                   // Some browsers might report it differently.
                                   // E.g., if alpha is counter-clockwise from North, use (360 - event.alpha) % 360
                                   // Test this part thoroughly on target devices.
        }
        // Fallback for non-absolute or if only 'alpha' is available
        else if (event.alpha !== null) {
            // This 'alpha' might be relative or absolute depending on the device/browser.
            // Often needs calibration or is less reliable.
            // A common heuristic if it's 0 = direction of device when listener started: not useful for true North.
            // If it behaves like a compass (0=North), use it.
            // For simplicity, we'll assume it's absolute if webkitCompassHeading and absolute alpha aren't available.
            heading = event.alpha;
        }


        if (heading !== null) {
            currentHeading = heading;
            updateGuidance();
        } else if (headingVal) {
             headingVal.textContent = "No reliable compass data";
        }
    }


    function updateGuidance() {
        if (currentLat === undefined || currentLon === undefined) {
            statusInfo.innerHTML = "Waiting for location data... <br>Ensure GPS is enabled.";
            return;
        }
        if (currentHeading === undefined) {
            statusInfo.innerHTML = "Waiting for compass data... <br>Try moving phone in fig-8.";
            if (headingVal) headingVal.textContent = "---";
            return;
        }

        const distance = calculateDistance(currentLat, currentLon, TARGET_LAT, TARGET_LON);
        targetBearing = calculateBearing(currentLat, currentLon, TARGET_LAT, TARGET_LON);

        if (distanceInfo) distanceInfo.textContent = `Distance: ${distance.toFixed(0)} m`;
        if (headingVal) headingVal.textContent = `${currentHeading.toFixed(1)}°`;
        if (bearingVal) bearingVal.textContent = `${targetBearing.toFixed(1)}°`;

        let angleDifference = targetBearing - currentHeading;
        if (angleDifference > 180) angleDifference -= 360;
        if (angleDifference < -180) angleDifference += 360;

        arrowElement.style.transform = `rotate(${angleDifference}deg)`;

        let directionText = "";
        const absAngleDiff = Math.abs(angleDifference);

        if (absAngleDiff < 10) { // More precise for "Straight Ahead"
            directionText = "➡️ Straight Ahead!";
        } else if (absAngleDiff > 165) { // Likely behind
            directionText = "🔄 Turn Around!";
        } else if (angleDifference > 0) { // Target is to the right
            if (angleDifference < 45) directionText = "↗️ Slightly Right";
            else if (angleDifference < 135) directionText = "➡️ Turn Right";
            else directionText = "↘️ Sharply Right";
        } else { // Target is to the left
            if (angleDifference > -45) directionText = "↖️ Slightly Left";
            else if (angleDifference > -135) directionText = "⬅️ Turn Left";
            else directionText = "↙️ Sharply Left";
        }

        let statusMessage = "";
        let containerClass = ""; // For the #container element

        if (distance < 10) { // Reduced "here" radius
            statusMessage = "🎉 You're Here! 🎉";
            containerClass = "status-here";
            arrowElement.textContent = "📍";
            directionText = "";
        } else if (distance < 40) { // Adjusted ranges
            statusMessage = "🔥🔥 Burning Hot!";
            containerClass = "status-burning";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 100) {
            statusMessage = "🔥 Hot!";
            containerClass = "status-hot";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 300) {
            statusMessage = "Warm";
            containerClass = "status-warm";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 1000) {
            statusMessage = "Cool";
            containerClass = "status-cool";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 3000) {
            statusMessage = "❄️ Cold";
            containerClass = "status-cold";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else {
            statusMessage = "🥶 Freezing!";
            containerClass = "status-freezing";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        }

        statusInfo.innerHTML = `${directionText}<br>${statusMessage}`;
        document.getElementById('container').className = containerClass; // Apply class to container
    }

    async function startExperience() {
        permissionSection.style.display = 'none';
        guidanceSection.style.display = 'block';

        // 1. Camera Access
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
                cameraFeed.srcObject = stream;
            } else {
                if (debugInfoContainer) debugInfoContainer.innerHTML += "<p>getUserMedia not supported.</p>";
            }
        } catch (err) {
            console.error("Camera access error:", err);
            statusInfo.innerHTML = `Camera Error: ${err.name}.<br>Please allow camera access.`;
            // Potentially revert to permission screen
            permissionSection.style.display = 'block';
            guidanceSection.style.display = 'none';
            return; // Stop if camera fails, as it's key to AR feel
        }

        // 2. Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
                enableHighAccuracy: true,
                maximumAge: 3000, // Fresher data
                timeout: 27000     // Longer timeout
            });
        } else {
            statusInfo.innerHTML = "Geolocation not supported.<br>Cannot guide you.";
            return; // Stop if no geolocation
        }

        // 3. Device Orientation (Compass)
        if (!orientationEventListened) { // Only add listener once
            let orientationHandlerRegistered = false;
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permissionState = await DeviceOrientationEvent.requestPermission();
                    if (permissionState === 'granted') {
                        // Prefer 'deviceorientationabsolute' if available
                        if ('ondeviceorientationabsolute' in window) {
                            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                            orientationHandlerRegistered = true;
                        } else {
                            window.addEventListener('deviceorientation', handleOrientation, true);
                            orientationHandlerRegistered = true;
                        }
                        orientationEventListened = true;
                    } else {
                        statusInfo.innerHTML = "Compass permission denied.<br>Guidance will be limited.";
                    }
                } catch (error) {
                    console.error("Orientation permission request error:", error);
                    statusInfo.innerHTML = "Error requesting compass.<br>Try reloading.";
                }
            } else if ('DeviceOrientationEvent' in window) {
                 if ('ondeviceorientationabsolute' in window) {
                    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                    orientationHandlerRegistered = true;
                } else {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    orientationHandlerRegistered = true;
                }
                orientationEventListened = true;
            }

            if (!orientationHandlerRegistered) {
                statusInfo.innerHTML = "Compass (Device Orientation) not supported.<br>Guidance may be inaccurate.";
                if (headingVal) headingVal.textContent = "N/A";
            }
        }
        updateGuidance(); // Initial call in case data is already available
    }

    startBtn.addEventListener('click', startExperience);
});