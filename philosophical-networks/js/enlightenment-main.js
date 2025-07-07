// js/enlightenment-main.js
// (Formerly main.js - will be significantly slimmed down)

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Enlightenment visualization
    const enlightenmentConfig = {
        // We can define custom node radius logic if needed,
        // otherwise CoreViz will use its default.
        // For Enlightenment, the default category-based sizing might be fine.
        // nodeRadiusFunction: function(d, baseSize) {
        //    // Custom logic for Enlightenment node sizes
        //    if (d.category === 'philosopher') return baseSize * 1.3;
        //    return baseSize;
        // }

        // We can define custom link description formatter for the popup if needed.
        // linkDescriptionFormatter: function(link, sourceNode, targetNode, direction) {
        //    if (direction === 'outgoing') {
        //        return `${sourceNode.name} ${link.description || 'is connected to'} ${targetNode.name}`;
        //    } else {
        //        return `${sourceNode.name} ${link.description || 'is connected to'} ${targetNode.name}`;
        //    }
        // }
        // The default in CoreViz should handle typical link.description well.

        // If there's a specific node to center on initially:
        // centralNodeId: 'reason',
    };

    // Initialize the visualization using the CoreViz system
    // Pass the specific data and any custom configurations
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(enlightenmentData.nodes, enlightenmentData.links, enlightenmentConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Enlightenment visualization
    // and cannot be generalized into visualization-core.js would go here.
    // For now, it's expected to be minimal or empty.
    // For example, if Enlightenment had a unique button that did something special:
    // const specialEnlightenmentButton = document.getElementById('special-enlightenment-feature');
    // if (specialEnlightenmentButton) {
    //     specialEnlightenmentButton.addEventListener('click', function() {
    //         alert('This is a special Enlightenment feature!');
    //     });
    // }
});