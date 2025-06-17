document.addEventListener('DOMContentLoaded', () => {
    // Initial default target
    let TARGET_LAT = 38.4546337;
    let TARGET_LON = 27.2027813;
    let TARGET_NAME = "Ege University";

    const EARTH_RADIUS_KM = 6371;

    // UI Elements (Ensure these match your HTML IDs)
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
    let currentHeading; // This will store the processed, hopefully correct, compass heading
    let orientationEventListened = false;
    let activeStream = null;
    let watchId = null;

    console.log("AR Location Finder Script Loaded.");

    // --- Utility Functions ---
    function deg2rad(degrees) { return degrees * (Math.PI / 180); }
    function rad2deg(radians) { return radians * (180 / Math.PI); }
    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c * 1000;
    }
    function calculateBearing(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
        const φ1 = deg2rad(lat1); const φ2 = deg2rad(lat2);
        const λ1 = deg2rad(lon1); const λ2 = deg2rad(lon2);
        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);
        return (rad2deg(θ) + 360) % 360;
    }

    // --- Geocoding Function ---
    async function geocodeLocation(query) {
        searchResultsDiv.innerHTML = '<p class="result-item" style="text-align:center;">Searching...</p>';
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
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
                TARGET_NAME = result.address?.city || result.address?.town || result.address?.village || result.address?.hamlet || result.display_name.split(',')[0] || "Selected Location";

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

    // --- Event Handlers ---
    function handleLocationSuccess(position) {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
        // console.log(`Location update: Lat: ${currentLat}, Lon: ${currentLon}, Acc: ${position.coords.accuracy}`);
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
        let rawHeading = null;
        let headingSource = "Unknown";

        // Log raw event data for debugging
        // console.log(`Orientation Event: alpha=${event.alpha}, beta=${event.beta}, gamma=${event.gamma}, absolute=${event.absolute}, webkitCompassHeading=${event.webkitCompassHeading}`);

        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            // iOS
            rawHeading = event.webkitCompassHeading;
            headingSource = "webkitCompassHeading";
        } else if (event.absolute === true && event.alpha !== null) {
            // Standard absolute orientation
            rawHeading = event.alpha; // Assuming 0 is North, clockwise.
            headingSource = "absolute alpha";
            // --- COMMON ADJUSTMENT FOR ANDROID ---
            // If arrow is 180 deg off with 'absolute alpha', try:
            // rawHeading = (360 - event.alpha) % 360; // If alpha is counter-clockwise from true North
            // headingSource = "absolute alpha (inverted)";
            // Or if it's off by 90 degrees (often related to device default orientation)
            // rawHeading = (event.alpha + 90) % 360; // Example adjustment
            // headingSource = "absolute alpha (+90)";
        } else if (event.alpha !== null) {
            // Non-absolute or fallback alpha. This is less reliable.
            // Some devices might report a usable heading here, others relative.
            rawHeading = event.alpha;
            headingSource = "fallback alpha";
            // console.warn("Using fallback alpha. May be unreliable or relative.");
        }

        if (rawHeading !== null) {
            currentHeading = (parseFloat(rawHeading) + 360) % 360; // Normalize to 0-359.99
            // console.log(`Processed Heading: ${currentHeading.toFixed(2)}° (Source: ${headingSource}, Raw: ${parseFloat(rawHeading).toFixed(2)})`);
            updateGuidance();
        } else {
            if (headingVal) headingVal.textContent = "---";
            // console.log("No usable compass data from event.");
        }
    }


    function updateGuidance() {
        if (guidanceSection.style.display === 'none') return;

        if (currentLat === undefined || currentLon === undefined) {
            statusInfo.innerHTML = "Waiting for location data... <br>Ensure GPS is enabled.";
            return;
        }
        if (currentHeading === undefined) { // Check if currentHeading has been set
            statusInfo.innerHTML = "Waiting for compass data... <br>Point phone around slowly.";
            if (headingVal) headingVal.textContent = "---";
            return;
        }

        const distance = calculateDistance(currentLat, currentLon, TARGET_LAT, TARGET_LON);
        const bearingToTarget = calculateBearing(currentLat, currentLon, TARGET_LAT, TARGET_LON);

        if (distanceInfo) distanceInfo.textContent = `Distance: ${distance.toFixed(0)} m`;
        if (headingVal) headingVal.textContent = `${currentHeading.toFixed(1)}`;
        if (bearingVal) bearingVal.textContent = `${bearingToTarget.toFixed(1)}`;

        let angleDifference = bearingToTarget - currentHeading;
        while (angleDifference <= -180) angleDifference += 360;
        while (angleDifference > 180) angleDifference -= 360;

        arrowElement.style.transform = `rotate(${angleDifference}deg)`;
        // console.log(`Update Guidance: Dist=${distance.toFixed(0)}, Bearing=${bearingToTarget.toFixed(1)}, MyHeading=${currentHeading.toFixed(1)}, AngleDiff=${angleDifference.toFixed(1)}`);


        let directionText = "";
        const absAngleDiff = Math.abs(angleDifference);

        if (absAngleDiff < 10) { directionText = "➡️ Straight Ahead!"; }
        else if (absAngleDiff > 170) { directionText = "🔄 Turn Around!"; }
        else if (angleDifference > 0) {
            if (angleDifference < 45) directionText = "↗️ Slightly Right";
            else if (angleDifference < 135) directionText = "➡️ Turn Right";
            else directionText = "↘️ Sharply Right";
        } else {
            if (angleDifference > -45) directionText = "↖️ Slightly Left";
            else if (angleDifference > -135) directionText = "⬅️ Turn Left";
            else directionText = "↙️ Sharply Left";
        }

        let statusMessage = "";
        let containerBaseClass = " "; // Start with a space if you plan to add more non-status classes later
        let statusClass = "";

        if (distance < 10) {
            statusMessage = "🎉 You're Here! 🎉"; statusClass = "status-here";
            arrowElement.textContent = "📍"; directionText = "";
        } else if (distance < 40) {
            statusMessage = "🔥🔥 Burning Hot!"; statusClass = "status-burning";
        } else if (distance < 100) {
            statusMessage = "🔥 Hot!"; statusClass = "status-hot";
        } else if (distance < 300) {
            statusMessage = "Warm"; statusClass = "status-warm";
        } else if (distance < 1000) {
            statusMessage = "Cool"; statusClass = "status-cool";
        } else if (distance < 3000) {
            statusMessage = "❄️ Cold"; statusClass = "status-cold";
        } else {
            statusMessage = "🥶 Freezing!"; statusClass = "status-freezing";
        }
        if (statusClass && arrowElement.textContent === "📍" && distance >=10) arrowElement.textContent = "⬆️";


        statusInfo.innerHTML = `${directionText}<br>${statusMessage}`;
        document.getElementById('container').className = (containerBaseClass + statusClass).trim();
    }

    // --- UI State Management ---
    function showSearchScreen() {
        searchSection.style.display = 'block';
        permissionSection.style.display = 'block';
        guidanceSection.style.display = 'none';
        stopCamera();
        document.getElementById('container').className = '';
        arrowElement.textContent = "⬆️";
        statusInfo.innerHTML = "Set a target or start guidance.";
        console.log("Switched to Search Screen");
    }

    function showGuidanceScreen() {
        searchSection.style.display = 'none';
        permissionSection.style.display = 'none';
        guidanceSection.style.display = 'block';
        if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;
        console.log("Switching to Guidance Screen for target:", TARGET_NAME);
        startSensorAndCamera();
    }

    function stopCamera() {
        if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            activeStream = null;
            cameraFeed.srcObject = null;
            console.log("Camera stream stopped.");
        }
    }

    async function startSensorAndCamera() {
        console.log("Attempting to start sensors and camera...");
        // 1. Camera Access
        if (!activeStream) {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                    cameraFeed.srcObject = activeStream;
                    console.log("Camera stream started.");
                } else { console.log("getUserMedia not supported."); }
            } catch (err) {
                console.error("Camera access error:", err);
                statusInfo.innerHTML = `Camera Error: ${err.name}.<br>Allow camera access.`;
                showSearchScreen(); return;
            }
        }

        // 2. Geolocation
        if (navigator.geolocation && !watchId) {
            watchId = navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
                enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 // Slightly tweaked params
            });
            console.log("Geolocation watchPosition started, ID:", watchId);
        } else if (!navigator.geolocation) {
            statusInfo.innerHTML = "Geolocation not supported.<br>Cannot guide.";
            showSearchScreen(); return;
        }

        // 3. Device Orientation (Compass)
        if (!orientationEventListened) {
            let orientationHandlerRegistered = false;
            // Prefer 'deviceorientationabsolute' but fall back if not explicitly supported by 'on...' check
            const eventType = ('ondeviceorientationabsolute' in window || DeviceOrientationEvent.prototype.hasOwnProperty('absolute')) ?
                              'deviceorientationabsolute' : 'deviceorientation';
            console.log("Using orientation event type:", eventType);

            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ model
                try {
                    console.log("Requesting DeviceOrientationEvent permission (iOS)...");
                    const permissionState = await DeviceOrientationEvent.requestPermission();
                    if (permissionState === 'granted') {
                        window.addEventListener(eventType, handleOrientation, true);
                        orientationEventListened = true; orientationHandlerRegistered = true;
                        console.log("DeviceOrientationEvent permission granted and listener added.");
                    } else {
                        statusInfo.innerHTML = "Compass permission denied.";
                        console.log("DeviceOrientationEvent permission denied.");
                    }
                } catch (error) {
                    console.error("Orientation permission request error:", error);
                    statusInfo.innerHTML = "Error requesting compass.";
                }
            } else if ('DeviceOrientationEvent' in window) {
                // Non-iOS or older iOS
                window.addEventListener(eventType, handleOrientation, true);
                orientationEventListened = true; orientationHandlerRegistered = true;
                console.log("Standard DeviceOrientationEvent listener added.");
            }

            if (!orientationHandlerRegistered) {
                statusInfo.innerHTML = "Compass not supported/denied.";
                console.log("Compass (DeviceOrientationEvent) not supported or handler not registered.");
            }
        } else {
            console.log("Orientation listener already added.");
        }
        // It's important to call updateGuidance AFTER attempting to get permissions and start listeners,
        // as currentHeading might not be set yet.
        // updateGuidance(); // Called by sensor callbacks now
    }

    // --- Initialize ---
    if (currentTargetDisplay) currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
    if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;

    searchBtn.addEventListener('click', () => {
        const query = locationSearchInput.value.trim();
        if (query) geocodeLocation(query);
        else searchResultsDiv.innerHTML = '<p class="result-item" style="text-align:center;">Please enter a location.</p>';
    });
    locationSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBtn.click(); });
    startBtn.addEventListener('click', showGuidanceScreen);
    backToSearchBtn.addEventListener('click', showSearchScreen);

    showSearchScreen(); // Initial screen state
    console.log("UI Initialized. Waiting for user interaction.");
});
