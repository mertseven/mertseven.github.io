document.addEventListener('DOMContentLoaded', () => {
    // Define Studio Coordinates
    const STUDIOS = {
        "Studio 1": { lat: 38.454246, lon: 27.203309, name: "Studio 1 (Tech Lab)" },
        "Studio 2": { lat: 38.454457, lon: 27.203158, name: "Studio 2 (Design Hub)" }
    };

    // Initial default target (let's pick Studio 1 by default)
    let TARGET_LAT = STUDIOS["Studio 1"].lat;
    let TARGET_LON = STUDIOS["Studio 1"].lon;
    let TARGET_NAME = STUDIOS["Studio 1"].name;

    const EARTH_RADIUS_KM = 6371;

    // UI Elements (Ensure these IDs exist in your HTML)
    // We'll repurpose the search section for studio selection
    const targetSelectionSection = document.getElementById('search-section'); // Assuming this div exists
    const studioSelectorContainer = document.getElementById('search-results'); // Re-use this for buttons
    const currentTargetDisplay = document.getElementById('current-target-display');

    const permissionSection = document.getElementById('permission-section');
    const targetNamePermission = document.getElementById('target-name-permission');
    const startBtn = document.getElementById('start-btn');

    const guidanceSection = document.getElementById('guidance-section');
    const guidanceTargetName = document.getElementById('guidance-target-name');
    const backToSelectionBtn = document.getElementById('back-to-search-btn'); // Renamed for clarity

    const cameraFeed = document.getElementById('camera-feed');
    const arrowElement = document.getElementById('arrow');
    const distanceInfo = document.getElementById('distance-info');
    const statusInfo = document.getElementById('status-info');

    const headingVal = document.getElementById('heading-val');
    const bearingVal = document.getElementById('bearing-val');
    const coordsVal = document.getElementById('coords-val');

    let currentLat, currentLon;
    let currentHeading;
    let orientationEventListened = false;
    let activeStream = null;
    let watchId = null;

    console.log("Indoor GPS Test Script Loaded.");

    // --- Utility Functions (deg2rad, rad2deg, calculateDistance, calculateBearing - KEEP AS IS) ---
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

    // --- Populate Studio Selection Buttons ---
    function populateStudioSelector() {
        studioSelectorContainer.innerHTML = ''; // Clear previous content
        const title = document.createElement('h3');
        title.textContent = "Select a Studio:";
        title.style.textAlign = 'center';
        title.style.marginBottom = '10px';
        studioSelectorContainer.appendChild(title);


        Object.keys(STUDIOS).forEach(key => {
            const studio = STUDIOS[key];
            const button = document.createElement('button');
            button.classList.add('result-item'); // Re-use class for styling
            button.style.width = '100%';
            button.style.marginBottom = '5px';
            button.textContent = studio.name;
            button.addEventListener('click', () => {
                TARGET_LAT = studio.lat;
                TARGET_LON = studio.lon;
                TARGET_NAME = studio.name;

                currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
                if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;
                if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;
                
                // Optional: Visually highlight selected button
                Array.from(studioSelectorContainer.getElementsByTagName('button')).forEach(btn => btn.style.fontWeight = 'normal');
                button.style.fontWeight = 'bold';

                console.log(`Target set to: ${TARGET_NAME} (${TARGET_LAT}, ${TARGET_LON})`);
                statusInfo.innerHTML = "New target set. <br>Press 'Start AR Guidance'.";
                if (guidanceSection.style.display !== 'none' && currentLat !== undefined) {
                    updateGuidance();
                }
            });
            studioSelectorContainer.appendChild(button);
        });
    }


    // --- Event Handlers (handleLocationSuccess, handleLocationError, handleOrientation - Use the robust version from previous "failproof" attempt) ---
    function handleLocationSuccess(position) {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
        if (coordsVal) {
            coordsVal.textContent = `${currentLat.toFixed(6)}, ${currentLon.toFixed(6)} (acc: ${position.coords.accuracy.toFixed(0)}m)`; // Increased precision for indoor
        }
        // Log GPS accuracy
        console.log(`GPS Update: Accuracy = ${position.coords.accuracy.toFixed(1)}m`);
        if (position.coords.accuracy > 30) { // Arbitrary threshold for "poor" indoor GPS
            console.warn("Poor GPS accuracy, guidance might be unreliable.");
            // Optionally provide UI feedback about poor GPS
            // statusInfo.innerHTML += "<br><small>Poor GPS signal.</small>";
        }
        updateGuidance();
    }
    function handleLocationError(error) { /* ... same as before ... */ }
    function handleOrientation(event) { /* ... Use the robust version from the "failproof" attempt, including console logs for debugging heading ... */
        let rawHeading = null;
        let headingSource = "Unknown";
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            rawHeading = event.webkitCompassHeading; headingSource = "webkitCompassHeading";
        } else if (event.absolute === true && event.alpha !== null) {
            rawHeading = event.alpha; headingSource = "absolute alpha";
            // COMMON ADJUSTMENT: if (rawHeading > 180 && headingSource === "absolute alpha") rawHeading = (360 - rawHeading); // Or similar based on testing
        } else if (event.alpha !== null) {
            rawHeading = event.alpha; headingSource = "fallback alpha";
        }
        if (rawHeading !== null) {
            currentHeading = (parseFloat(rawHeading) + 360) % 360;
            // console.log(`Processed Heading: ${currentHeading.toFixed(1)}° (Source: ${headingSource})`);
            updateGuidance();
        } else {
            if (headingVal) headingVal.textContent = "---";
        }
    }

    // --- updateGuidance function (KEEP AS IS, it uses TARGET_LAT/LON/NAME which are now dynamic) ---
    function updateGuidance() { /* ... same as the robust version before ... */
        if (guidanceSection.style.display === 'none') return;
        if (currentLat === undefined || currentLon === undefined) {
            statusInfo.innerHTML = "Waiting for location data... <br>Ensure GPS is enabled.";
            return;
        }
        if (currentHeading === undefined) {
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
        let containerBaseClass = document.getElementById('container').className.replace(/status-\w+/g, '').trim();
        let statusClass = "";

        // Adjust distance thresholds for potentially shorter indoor distances
        if (distance < 5) { // "Here" threshold tighter for indoor
            statusMessage = "🎉 You're Here! 🎉"; statusClass = "status-here";
            arrowElement.textContent = "📍"; directionText = "";
        } else if (distance < 15) { // Burning hot
            statusMessage = "🔥🔥 Burning Hot!"; statusClass = "status-burning";
        } else if (distance < 30) { // Hot
            statusMessage = "🔥 Hot!"; statusClass = "status-hot";
        } else if (distance < 60) { // Warm
            statusMessage = "Warm"; statusClass = "status-warm";
        } else if (distance < 100) { // Cool (relative to indoor scale)
            statusMessage = "Cool"; statusClass = "status-cool";
        } else { // Cold
            statusMessage = "❄️ Getting Colder"; statusClass = "status-cold";
        }
        if (statusClass && arrowElement.textContent === "📍" && distance >=5) arrowElement.textContent = "⬆️";

        statusInfo.innerHTML = `${directionText}<br>${statusMessage}`;
        document.getElementById('container').className = (containerBaseClass + " " + statusClass).trim();
    }


    // --- UI State Management (showTargetSelectionScreen, showGuidanceScreen, etc. - Adapt as needed) ---
    function showTargetSelectionScreen() {
        if (targetSelectionSection) targetSelectionSection.style.display = 'block';
        permissionSection.style.display = 'block';
        guidanceSection.style.display = 'none';
        stopCamera();
        document.getElementById('container').className = '';
        arrowElement.textContent = "⬆️";
        statusInfo.innerHTML = "Select a studio or start guidance.";
        console.log("Switched to Target Selection Screen");
    }

    function showGuidanceScreen() {
        if (targetSelectionSection) targetSelectionSection.style.display = 'none';
        permissionSection.style.display = 'none';
        guidanceSection.style.display = 'block';
        if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;
        console.log("Switching to Guidance Screen for target:", TARGET_NAME);
        startSensorAndCamera();
    }
    // stopCamera() and startSensorAndCamera() remain the same as the "failproof" version

    function stopCamera() { /* ... same ... */ }
    async function startSensorAndCamera() { /* ... same, ensure it calls the robust handleOrientation ... */ }


    // --- Initialize ---
    if (currentTargetDisplay) currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
    if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;
    populateStudioSelector(); // Create buttons for studio selection

    // Remove search-specific listeners if they were there:
    // searchBtn.addEventListener('click', ...);
    // locationSearchInput.addEventListener('keypress', ...);
    // Instead, the studio buttons handle target changes.

    startBtn.addEventListener('click', showGuidanceScreen);
    backToSelectionBtn.addEventListener('click', showTargetSelectionScreen); // Ensure this button exists and is named correctly

    showTargetSelectionScreen(); // Initial screen state
    console.log("UI Initialized for Indoor GPS Test. Waiting for user interaction.");
});
