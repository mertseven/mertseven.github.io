document.addEventListener('DOMContentLoaded', () => {
    // Yaşar University coordinates
    const yasarUniversity = [38.454600, 27.202694];

    // Initialize the map
    const map = L.map('map').setView(yasarUniversity, 15);

    // Custom monochrome style for the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles-monochrome' // This class is styled in about-styles.css
    }).addTo(map);

    // Add a marker for Yaşar University
    const marker = L.marker(yasarUniversity).addTo(map);
    marker.bindPopup("<b>Yaşar University</b><br>Faculty of Communication").openPopup();

    // Disable scroll zoom to prevent accidental zooming
    map.scrollWheelZoom.disable();
});