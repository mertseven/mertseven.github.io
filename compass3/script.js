document.addEventListener('DOMContentLoaded', () => {
    // Initial default target
    let TARGET_LAT = 38.4546337;
    let TARGET_LON = 27.2027813;
    let TARGET_NAME = "Ege University"; // Default target name

    const EARTH_RADIUS_KM = 6371;

    // UI Elements
    const searchSection = document.getElementById('search-section');
    const locationSearchInput = document.getElementById('location-search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResultsDiv = document.getElementById('search-results');
    const currentTargetDisplay = document.getElementById('current-target-display');

    const permissionSection = document.getElementById('permission-section');
    const targetNamePermission = document.getElementById('target-name-permission');
    const startBtn = document.getElementById('start-btn');

    const guidanceSection = document.getElementById('guidance-section');
    const guidanceTargetName = document.getElementById('guidance-target-name');
    const backToSearchBtn = document.getElementById('back-to-search-btn');

    const cameraFeed = document.getElementById('camera-feed');
    const arrowElement = document.getElementById('arrow');
    const distanceInfo = document.getElementById('distance-info');
    const statusInfo = document.getElementById('status-info');

    const headingVal = document.getElementById('heading-val');
    const bearingVal = document.getElementById('bearing-val');
    const coordsVal = document.getElementById('coords-val');

    let currentLat, currentLon;
    let currentHeading;
    // targetBearing is calculated in updateGuidance
    let orientationEventListened = false;
    let activeStream = null;
    let watchId = null; // To store the ID from watchPosition

    // --- Utility Functions ---
    function deg2rad(degrees) {
        return degrees * (Math.PI / 180);
    }
    function rad2deg(radians) {
        return radians * (180 / Math.PI);
    }
    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
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
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
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

    // --- Geocoding Function (using Nominatim) ---
    async function geocodeLocation(query) {
        searchResultsDiv.innerHTML = '<p class="result-item" style="text-align:center;">Searching...</p>';
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
        // For production, use a User-Agent: new Headers({'User-Agent': 'YourAppName/1.0 (your-email@example.com)'})
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`);
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            console.error("Geocoding error:", error);
            searchResultsDiv.innerHTML = `<p class="result-item" style="text-align:center; color:red;">Error finding location. Try again.</p>`;
        }
    }

    function displaySearchResults(results) {
        searchResultsDiv.innerHTML = '';
        if (!results || results.length === 0) {
            searchResultsDiv.innerHTML = '<p class="result-item" style="text-align:center;">No results found.</p>';
            return;
        }
        results.forEach(result => {
            const item = document.createElement('div');
            item.classList.add('result-item');
            item.textContent = result.display_name;
            item.addEventListener('click', () => {
                TARGET_LAT = parseFloat(result.lat);
                TARGET_LON = parseFloat(result.lon);
                // Try to get a shorter name
                TARGET_NAME = result.address?.city || result.address?.town || result.address?.village || result.address?.hamlet || result.display_name.split(',')[0];

                currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
                if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;
                if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;

                searchResultsDiv.innerHTML = '';
                locationSearchInput.value = '';
                statusInfo.innerHTML = "New target set. <br>Press 'Start AR Guidance'.";
                if (guidanceSection.style.display !== 'none' && currentLat !== undefined) {
                    updateGuidance();
                }
            });
            searchResultsDiv.appendChild(item);
        });
    }

    // --- Event Handlers & Logic ---
    function handleLocationSuccess(position) {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
        if (coordsVal) {
            coordsVal.textContent = `${currentLat.toFixed(5)}, ${currentLon.toFixed(5)} (acc: ${position.coords.accuracy.toFixed(0)}m)`;
        }
        updateGuidance();
    }
    function handleLocationError(error) {
        statusInfo.innerHTML = `Location Error: ${error.message}.<br>Ensure GPS is enabled.`;
        console.error("Location error:", error);
        if (coordsVal) coordsVal.textContent = "Error getting location";
    }
    function handleOrientation(event) {
        let heading = null;
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            heading = event.webkitCompassHeading;
        } else if (event.absolute === true && event.alpha !== null) {
            heading = event.alpha;
        } else if (event.alpha !== null) { // Fallback, less reliable
            heading = event.alpha;
        }

        if (heading !== null) {
            currentHeading = heading; // Update the global currentHeading
            updateGuidance();
        } else if (headingVal) {
             headingVal.textContent = "No compass data";
        }
    }

    function updateGuidance() {
        if (guidanceSection.style.display === 'none') return; // Don't update if not in guidance mode

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
        const bearingToTarget = calculateBearing(currentLat, currentLon, TARGET_LAT, TARGET_LON);

        if (distanceInfo) distanceInfo.textContent = `Distance: ${distance.toFixed(0)} m`;
        if (headingVal) headingVal.textContent = `${currentHeading.toFixed(1)}`;
        if (bearingVal) bearingVal.textContent = `${bearingToTarget.toFixed(1)}`;

        let angleDifference = bearingToTarget - currentHeading;
        if (angleDifference > 180) angleDifference -= 360;
        if (angleDifference < -180) angleDifference += 360;

        arrowElement.style.transform = `rotate(${angleDifference}deg)`;

        let directionText = "";
        const absAngleDiff = Math.abs(angleDifference);

        if (absAngleDiff < 10) { directionText = "➡️ Straight Ahead!"; }
        else if (absAngleDiff > 170) { directionText = "🔄 Turn Around!"; } // Adjusted from 165
        else if (angleDifference > 0) { // Target is to the right
            if (angleDifference < 45) directionText = "↗️ Slightly Right";
            else if (angleDifference < 135) directionText = "➡️ Turn Right";
            else directionText = "↘️ Sharply Right";
        } else { // Target is to the left
            if (angleDifference > -45) directionText = "↖️ Slightly Left";
            else if (angleDifference > -135) directionText = "⬅️ Turn Left";
            else directionText = "↙️ Sharply Left";
        }

        let statusMessage = "";
        let containerClass = document.getElementById('container').className.replace(/status-\w+/g, '').trim(); // Preserve other classes

        if (distance < 10) {
            statusMessage = "🎉 You're Here! 🎉"; containerClass += " status-here";
            arrowElement.textContent = "📍"; directionText = "";
        } else if (distance < 40) {
            statusMessage = "🔥🔥 Burning Hot!"; containerClass += " status-burning";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 100) {
            statusMessage = "🔥 Hot!"; containerClass += " status-hot";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 300) {
            statusMessage = "Warm"; containerClass += " status-warm";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 1000) {
            statusMessage = "Cool"; containerClass += " status-cool";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else if (distance < 3000) {
            statusMessage = "❄️ Cold"; containerClass += " status-cold";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        } else {
            statusMessage = "🥶 Freezing!"; containerClass += " status-freezing";
            if (arrowElement.textContent !== "⬆️") arrowElement.textContent = "⬆️";
        }

        statusInfo.innerHTML = `${directionText}<br>${statusMessage}`;
        document.getElementById('container').className = containerClass.trim();
    }

    // --- UI State Management ---
    function showSearchScreen() {
        searchSection.style.display = 'block';
        permissionSection.style.display = 'block';
        guidanceSection.style.display = 'none';
        stopCamera();
        document.getElementById('container').className = ''; // Reset container class
        arrowElement.textContent = "⬆️"; // Reset arrow
        statusInfo.innerHTML = "Set a target or start guidance.";
    }

    function showGuidanceScreen() {
        searchSection.style.display = 'none';
        permissionSection.style.display = 'none';
        guidanceSection.style.display = 'block';
        if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;
        startSensorAndCamera();
    }

    function stopCamera() {
        if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            activeStream = null;
            cameraFeed.srcObject = null;
        }
    }

    async function startSensorAndCamera() {
        // 1. Camera Access
        if (!activeStream) {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    activeStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' }, audio: false
                    });
                    cameraFeed.srcObject = activeStream;
                } else { console.log("getUserMedia not supported."); }
            } catch (err) {
                console.error("Camera access error:", err);
                statusInfo.innerHTML = `Camera Error: ${err.name}.<br>Allow camera access.`;
                showSearchScreen(); return;
            }
        }

        // 2. Geolocation (Start watching if not already)
        if (navigator.geolocation && !watchId) { // Check if watchId is null
            watchId = navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
                enableHighAccuracy: true, maximumAge: 3000, timeout: 27000
            });
        } else if (!navigator.geolocation) {
            statusInfo.innerHTML = "Geolocation not supported.<br>Cannot guide.";
            showSearchScreen(); return;
        }

        // 3. Device Orientation (Compass)
        if (!orientationEventListened) {
            let orientationHandlerRegistered = false;
            const eventType = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';

            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permissionState = await DeviceOrientationEvent.requestPermission();
                    if (permissionState === 'granted') {
                        window.addEventListener(eventType, handleOrientation, true);
                        orientationEventListened = true; orientationHandlerRegistered = true;
                    } else { statusInfo.innerHTML = "Compass permission denied."; }
                } catch (error) {
                    console.error("Orientation permission request error:", error);
                    statusInfo.innerHTML = "Error requesting compass.";
                }
            } else if ('DeviceOrientationEvent' in window) {
                window.addEventListener(eventType, handleOrientation, true);
                orientationEventListened = true; orientationHandlerRegistered = true;
            }
            if (!orientationHandlerRegistered) {
                statusInfo.innerHTML = "Compass not supported/denied.";
            }
        }
        updateGuidance(); // Call to update with current sensor data
    }

    // --- Initialize ---
    if (currentTargetDisplay) currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
    if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;

    // Event Listeners
    searchBtn.addEventListener('click', () => {
        const query = locationSearchInput.value.trim();
        if (query) geocodeLocation(query);
        else searchResultsDiv.innerHTML = '<p class="result-item" style="text-align:center;">Please enter a location.</p>';
    });
    locationSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBtn.click(); });
    startBtn.addEventListener('click', showGuidanceScreen);
    backToSearchBtn.addEventListener('click', showSearchScreen);

    // Initial screen state
    showSearchScreen();
});