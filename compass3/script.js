document.addEventListener('DOMContentLoaded', () => {
    // Define Studio Coordinates
    const STUDIOS = {
        "Studio 1": { lat: 38.454246, lon: 27.203309, name: "Studio 1 (Tech Lab)" },
        "Studio 2": { lat: 38.454457, lon: 27.203158, name: "Studio 2 (Design Hub)" }
    };

    let TARGET_LAT = STUDIOS["Studio 1"].lat;
    let TARGET_LON = STUDIOS["Studio 1"].lon;
    let TARGET_NAME = STUDIOS["Studio 1"].name;

    const EARTH_RADIUS_KM = 6371;

    // UI Elements
    const targetSelectionSection = document.getElementById('search-section');
    const studioSelectorContainer = document.getElementById('search-results');
    const currentTargetDisplay = document.getElementById('current-target-display');
    const permissionSection = document.getElementById('permission-section');
    const targetNamePermission = document.getElementById('target-name-permission');
    const startBtn = document.getElementById('start-btn');
    const guidanceSection = document.getElementById('guidance-section');
    const guidanceTargetName = document.getElementById('guidance-target-name');
    const backToSelectionBtn = document.getElementById('back-to-search-btn'); // Matched to HTML
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

    console.log("AR Indoor GPS Test Script Loaded. Ver: FinalCheck");

    function deg2rad(degrees) { return degrees * (Math.PI / 180); }
    function rad2deg(radians) { return radians * (180 / Math.PI); }
    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
        const dLat = deg2rad(lat2 - lat1); const dLon = deg2rad(lon2 - lon1);
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

    function populateStudioSelector() {
        if (!studioSelectorContainer) {
            console.error("Error: studioSelectorContainer (search-results div) not found!");
            return;
        }
        studioSelectorContainer.innerHTML = '';
        const title = document.createElement('h3');
        title.textContent = "Select a Studio:";
        title.style.textAlign = 'center'; title.style.marginBottom = '10px';
        studioSelectorContainer.appendChild(title);

        Object.keys(STUDIOS).forEach(key => {
            const studio = STUDIOS[key];
            const button = document.createElement('button');
            button.classList.add('result-item'); // Assuming .result-item is styled
            button.style.width = '100%'; button.style.marginBottom = '5px'; // Basic styling
            button.textContent = studio.name;
            button.addEventListener('click', () => {
                TARGET_LAT = studio.lat; TARGET_LON = studio.lon; TARGET_NAME = studio.name;
                if(currentTargetDisplay) currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
                if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;
                if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;
                Array.from(studioSelectorContainer.getElementsByTagName('button')).forEach(btn => btn.style.fontWeight = 'normal');
                button.style.fontWeight = 'bold';
                console.log(`Target set to: ${TARGET_NAME}`);
                if(statusInfo) statusInfo.innerHTML = "New target set. <br>Press 'Start AR Guidance'.";
                if (guidanceSection.style.display !== 'none' && currentLat !== undefined) updateGuidance();
            });
            studioSelectorContainer.appendChild(button);
        });
    }

    function handleLocationSuccess(position) {
        currentLat = position.coords.latitude; currentLon = position.coords.longitude;
        if (coordsVal) coordsVal.textContent = `${currentLat.toFixed(6)}, ${currentLon.toFixed(6)} (acc: ${position.coords.accuracy.toFixed(0)}m)`;
        console.log(`GPS Update: Accuracy = ${position.coords.accuracy.toFixed(1)}m`);
        if (position.coords.accuracy > 35) { // Threshold for poor GPS
            console.warn("Poor GPS accuracy, guidance might be unreliable.");
        }
        updateGuidance();
    }
    function handleLocationError(error) {
        if(statusInfo) statusInfo.innerHTML = `Location Error: ${error.message}.<br>Ensure GPS is enabled.`;
        console.error("Location error:", error);
        if (coordsVal) coordsVal.textContent = "Error";
    }
    function handleOrientation(event) {
        let rawHeading = null; let headingSource = "Unknown";
        // console.log(`Orientation Event: alpha=${event.alpha?.toFixed(1)}, beta=${event.beta?.toFixed(1)}, gamma=${event.gamma?.toFixed(1)}, abs=${event.absolute}, webkit=${event.webkitCompassHeading?.toFixed(1)}`);
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            rawHeading = event.webkitCompassHeading; headingSource = "webkitCompassHeading";
        } else if (event.absolute === true && event.alpha !== null) {
            rawHeading = event.alpha; headingSource = "absolute alpha";
            // *** TEST THIS IF ANDROID COMPASS IS 180 DEG OFF ***
            // rawHeading = (360 - event.alpha) % 360; headingSource = "absolute alpha inverted";
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

    function updateGuidance() {
        if (!guidanceSection || guidanceSection.style.display === 'none') return;
        if (currentLat === undefined || currentLon === undefined) {
            if(statusInfo) statusInfo.innerHTML = "Waiting for location data... <br>Ensure GPS is enabled."; return;
        }
        if (currentHeading === undefined) {
            if(statusInfo) statusInfo.innerHTML = "Waiting for compass data... <br>Point phone around.";
            if (headingVal) headingVal.textContent = "---"; return;
        }
        const distance = calculateDistance(currentLat, currentLon, TARGET_LAT, TARGET_LON);
        const bearingToTarget = calculateBearing(currentLat, currentLon, TARGET_LAT, TARGET_LON);
        if (distanceInfo) distanceInfo.textContent = `Distance: ${distance.toFixed(0)} m`;
        if (headingVal) headingVal.textContent = `${currentHeading.toFixed(1)}`;
        if (bearingVal) bearingVal.textContent = `${bearingToTarget.toFixed(1)}`;
        let angleDifference = bearingToTarget - currentHeading;
        while (angleDifference <= -180) angleDifference += 360;
        while (angleDifference > 180) angleDifference -= 360;
        if(arrowElement) arrowElement.style.transform = `rotate(${angleDifference}deg)`;

        let directionText = ""; const absAngleDiff = Math.abs(angleDifference);
        if (absAngleDiff < 10) { directionText = "➡️ Straight Ahead!"; }
        else if (absAngleDiff > 170) { directionText = "🔄 Turn Around!"; }
        else if (angleDifference > 0) {
            if (angleDifference < 45) directionText = "↗️ Slightly Right"; else if (angleDifference < 135) directionText = "➡️ Turn Right"; else directionText = "↘️ Sharply Right";
        } else {
            if (angleDifference > -45) directionText = "↖️ Slightly Left"; else if (angleDifference > -135) directionText = "⬅️ Turn Left"; else directionText = "↙️ Sharply Left";
        }
        let statusMessage = ""; let container = document.getElementById('container');
        let containerBaseClass = container ? container.className.replace(/status-\w+/g, '').trim() : "";
        let statusClass = "";
        if (distance < 5) { statusMessage = "🎉 You're Here! 🎉"; statusClass = "status-here"; if(arrowElement) arrowElement.textContent = "📍"; directionText = ""; }
        else if (distance < 15) { statusMessage = "🔥🔥 Burning Hot!"; statusClass = "status-burning"; }
        else if (distance < 30) { statusMessage = "🔥 Hot!"; statusClass = "status-hot"; }
        else if (distance < 60) { statusMessage = "Warm"; statusClass = "status-warm"; }
        else if (distance < 100) { statusMessage = "Cool"; statusClass = "status-cool"; }
        else { statusMessage = "❄️ Getting Colder"; statusClass = "status-cold"; }
        if (statusClass && arrowElement && arrowElement.textContent === "📍" && distance >= 5) arrowElement.textContent = "⬆️";
        if(statusInfo) statusInfo.innerHTML = `${directionText}<br>${statusMessage}`;
        if(container) container.className = (containerBaseClass + " " + statusClass).trim();
    }

    function showTargetSelectionScreen() {
        if (targetSelectionSection) targetSelectionSection.style.display = 'block';
        if (permissionSection) permissionSection.style.display = 'block';
        if (guidanceSection) guidanceSection.style.display = 'none';
        stopCamera();
        let container = document.getElementById('container'); if(container) container.className = '';
        if(arrowElement) arrowElement.textContent = "⬆️";
        if(statusInfo) statusInfo.innerHTML = "Select a studio or start guidance.";
        console.log("UI: Switched to Target Selection Screen");
    }

    function showGuidanceScreen() {
        if (targetSelectionSection) targetSelectionSection.style.display = 'none';
        if (permissionSection) permissionSection.style.display = 'none';
        if (guidanceSection) guidanceSection.style.display = 'block';
        if (guidanceTargetName) guidanceTargetName.textContent = `Guiding to: ${TARGET_NAME}`;
        console.log("UI: Switching to Guidance Screen for target:", TARGET_NAME);
        startSensorAndCamera();
    }

    function stopCamera() {
        if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop()); activeStream = null;
            if(cameraFeed) cameraFeed.srcObject = null;
            console.log("Camera stream stopped.");
        }
    }

    async function startSensorAndCamera() {
        console.log("Permissions: Attempting to start sensors and camera...");
        // 1. Camera Access
        if (!activeStream) {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                    if(cameraFeed) cameraFeed.srcObject = activeStream;
                    console.log("Permissions: Camera stream started.");
                } else { console.log("Permissions: getUserMedia not supported."); }
            } catch (err) {
                console.error("Permissions: Camera access error:", err);
                if(statusInfo) statusInfo.innerHTML = `Camera Error: ${err.name}.<br>Allow camera access.`;
                showTargetSelectionScreen(); return;
            }
        }

        // 2. Geolocation
        if (navigator.geolocation && !watchId) {
            watchId = navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
                enableHighAccuracy: true, maximumAge: 2000, timeout: 20000
            });
            console.log("Permissions: Geolocation watchPosition started, ID:", watchId);
        } else if (!navigator.geolocation) {
            if(statusInfo) statusInfo.innerHTML = "Geolocation not supported.<br>Cannot guide.";
            showTargetSelectionScreen(); return;
        }

        // 3. Device Orientation (Compass)
        if (!orientationEventListened) {
            let orientationHandlerRegistered = false;
            const eventType = ('ondeviceorientationabsolute' in window || (DeviceOrientationEvent.prototype && DeviceOrientationEvent.prototype.hasOwnProperty('absolute'))) ?
                              'deviceorientationabsolute' : 'deviceorientation';
            console.log("Permissions: Using orientation event type:", eventType);

            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    console.log("Permissions: Requesting DeviceOrientationEvent permission (iOS)...");
                    const permissionState = await DeviceOrientationEvent.requestPermission();
                    if (permissionState === 'granted') {
                        window.addEventListener(eventType, handleOrientation, true);
                        orientationEventListened = true; orientationHandlerRegistered = true;
                        console.log("Permissions: DeviceOrientationEvent permission granted and listener added.");
                    } else {
                        if(statusInfo) statusInfo.innerHTML = "Compass permission denied by user.";
                        console.log("Permissions: DeviceOrientationEvent permission denied by user.");
                    }
                } catch (error) {
                    console.error("Permissions: Orientation permission request error:", error);
                    if(statusInfo) statusInfo.innerHTML = `Error requesting compass: ${error.name}. Try reloading.`;
                }
            } else if ('DeviceOrientationEvent' in window) {
                window.addEventListener(eventType, handleOrientation, true);
                orientationEventListened = true; orientationHandlerRegistered = true;
                console.log("Permissions: Standard DeviceOrientationEvent listener added.");
            }

            if (!orientationHandlerRegistered && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Status already set if permission was denied or errored
            } else if (!orientationHandlerRegistered) {
                 if(statusInfo) statusInfo.innerHTML = "Compass (Device Orientation) not supported.";
                 console.log("Permissions: Compass (DeviceOrientationEvent) not supported or handler not registered.");
            }
        } else {
            console.log("Permissions: Orientation listener already added.");
        }
    }

    // --- Initialize UI and Event Listeners ---
    if (!startBtn) {
        console.error("CRITICAL ERROR: startBtn (Start AR Guidance button) not found in HTML!");
        return; // Stop script if critical button is missing
    }

    if (currentTargetDisplay) currentTargetDisplay.textContent = `Target: ${TARGET_NAME}`;
    if (targetNamePermission) targetNamePermission.textContent = TARGET_NAME;
    populateStudioSelector();

    startBtn.addEventListener('click', () => {
        console.log("Event: 'Start AR Guidance' button CLICKED!");
        showGuidanceScreen();
    });

    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', () => {
            console.log("Event: 'Change Studio' button CLICKED!");
            showTargetSelectionScreen();
        });
    } else {
        console.warn("Warning: backToSelectionBtn (Change Studio button) not found in HTML.");
    }

    showTargetSelectionScreen(); // Initial screen state
    console.log("UI Initialized. Waiting for user interaction. Ver: FinalCheck");
});
