.text(imp)
                    .style("cursor", "pointer")
                    .on("click", function() {
                        // Find the node with this name and simulate a click
                        const targetNode = node.filter(n => n.data.name === imp);
                        if (!targetNode.empty()) {
                            // Close current popup
                            popup.classed("visible", false);
                            // Simulate click on target node
                            setTimeout(() => {
                                targetNode.dispatch("click");
                            }, 100);
                        }
                    });
            });
        }
        
        // Find incoming connections
        const incoming = links.filter(l => l.target === d).map(l => l.source.data.name);
        if (incoming.length > 0) {
            incoming.forEach(imp => {
                if (!d.data.imports || !d.data.imports.includes(imp)) {
                    popupConnections.append("li")
                        .text(imp + " (incoming)")
                        .style("cursor", "pointer")
                        .style("color", "#666")
                        .on("click", function() {
                            // Find the node with this name and simulate a click
                            const targetNode = node.filter(n => n.data.name === imp);
                            if (!targetNode.empty()) {
                                // Close current popup
                                popup.classed("visible", false);
                                // Simulate click on target node
                                setTimeout(() => {
                                    targetNode.dispatch("click");
                                }, 100);
                            }
                        });
                }
            });
        }
        
        if ((!d.data.imports || d.data.imports.length === 0) && incoming.length === 0) {
            popupConnections.append("li")
                .text("No direct connections");
        }
        
        popup.classed("visible", true);
        
        // Keep connections visible while popup is open
        link.filter(l => l.source === d || l.target === d)
            .style("stroke-opacity", 0.8)
            .style("stroke-width", 1.5);
            
        // Keep related nodes highlighted
        node.filter(n => links.some(l => (l.source === d && l.target === n) || (l.target === d && l.source === n)))
            .select("circle")
            .attr("class", "node node--target");
            
        // Keep labels visible
        node.filter(n => links.some(l => (l.source === d && l.target === n) || (l.target === d && l.source === n)))
            .select("text")
            .style("font-weight", "bold");
    });
    
    // Click outside to close popup
    d3.select("body").on("click", function() {
        popup.classed("visible", false);
        
        // Reset visualization
        link
            .style("mix-blend-mode", "multiply")
            .attr("class", "link")
            .style("stroke-opacity", 0.35)
            .style("stroke-width", 0.8);
        
        node
            .select("circle")
            .attr("class", "node");
            
        node
            .select("text")
            .style("font-weight", "normal");
    });
    
    // Prevent popup from closing when clicking inside it
    popup.on("click", function(event) {
        event.stopPropagation();
    });
    
    // Reset button
    d3.select("#resetBtn").on("click", createVisualization);
    
    // Show all connections button
    d3.select("#showAllBtn").on("click", function() {
        // Highlight all links with animation
        link.transition()
            .duration(300)
            .style("stroke-opacity", 0.8)
            .style("stroke-width", 1.2)
            .transition()
            .delay(2000)
            .duration(500)
            .style("stroke-opacity", 0.35)
            .style("stroke-width", 0.8);
    });
    
    // Allow zooming and panning
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoomBehavior);
}

// Helper function to enhance visualization with additional features
function enhanceVisualization() {
    // Add search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search concepts or theorists...';
    searchInput.classList.add('search-input');
    
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');
    searchContainer.appendChild(searchInput);
    
    document.querySelector('.controls').prepend(searchContainer);
    
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        if (searchText.length < 2) {
            // Reset all nodes and connections if search is cleared
            d3.selectAll('.node')
                .style('opacity', 1)
                .each(function(d) {
                    const originalR = d.data.size ? Math.sqrt(d.data.size) * 1.2 : 3;
                    d3.select(this).attr('r', originalR);
                });
                
            d3.selectAll('.link')
                .style('opacity', 0.35)
                .style('stroke-width', 0.8);
                
            d3.selectAll('.node-label')
                .style('opacity', 1)
                .style('font-weight', 'normal');
                
            return;
        }
        
        // Find matching nodes
        const matchingNodes = [];
        const allNodes = d3.selectAll('.node').data();
        
        allNodes.forEach(node => {
            if (node.data.name.toLowerCase().includes(searchText)) {
                matchingNodes.push(node);
            }
        });
        
        // Highlight matching nodes
        d3.selectAll('.node')
            .style('opacity', d => {
                return matchingNodes.includes(d) ? 1 : 0.3;
            })
            .attr('r', d => {
                return matchingNodes.includes(d) ? Math.sqrt(d.data.size) * 2 : Math.sqrt(d.data.size) * 1.2;
            });
            
        d3.selectAll('.node-label')
            .style('opacity', d => {
                return matchingNodes.includes(d) ? 1 : 0.3;
            })
            .style('font-weight', d => {
                return matchingNodes.includes(d) ? 'bold' : 'normal';
            });
            
        // Highlight connections between matching nodes
        d3.selectAll('.link')
            .style('opacity', link => {
                const sourceInMatch = matchingNodes.includes(link.source);
                const targetInMatch = matchingNodes.includes(link.target);
                return (sourceInMatch || targetInMatch) ? 0.8 : 0.1;
            })
            .style('stroke-width', link => {
                const sourceInMatch = matchingNodes.includes(link.source);
                const targetInMatch = matchingNodes.includes(link.target);
                return (sourceInMatch || targetInMatch) ? 1.5 : 0.5;
            });
    });
}

// Add enhanced CSS styles
function addEnhancedStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .search-container {
            margin-bottom: 15px;
        }
        
        .search-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.85rem;
            margin-bottom: 5px;
        }
        
        .search-input:focus {
            outline: none;
            border-color: #999;
        }
                
        .popup {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-left: 4px solid #333;
        }
    `;
    
    document.head.appendChild(style);
}// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up the intro popup
    const introPopup = document.getElementById('intro-popup');
    const introCloseBtn = document.getElementById('intro-close');
    
    if (!introPopup || !introCloseBtn) {
        console.error("Intro popup elements not found, initializing visualization directly");
        createVisualization();
        
        // Add enhancement features
        setTimeout(() => {
            addEnhancedStyles();
            enhanceVisualization();
        }, 100);
        return;
    }
    
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('hasSeenCriticalTheoryIntro');
    
    // Only show the intro if the user hasn't seen it before
    if (!hasSeenIntro) {
        // Show the intro popup (make sure it's not hidden by default in HTML)
        introPopup.style.display = 'flex';
        
        // Prevent scrolling on the body when the popup is open
        document.body.style.overflow = 'hidden';
    } else {
        // Hide the intro popup if they've seen it before
        introPopup.style.display = 'none';
        
        // Create the visualization immediately if they've seen the intro
        createVisualization();
        
        // Add enhancement features
        setTimeout(() => {
            addEnhancedStyles();
            enhanceVisualization();
        }, 100);
    }
    
    // Close intro popup when the close button is clicked
    introCloseBtn.addEventListener('click', function() {
        // Hide the popup
        introPopup.style.display = 'none';
        
        // Allow scrolling again
        document.body.style.overflow = '';
        
        // Remember that the user has seen the intro
        localStorage.setItem('hasSeenCriticalTheoryIntro', 'true');
        
        // Create the visualization after closing the intro
        createVisualization();
        
        // Add enhancement features
        setTimeout(() => {
            addEnhancedStyles();
            enhanceVisualization();
        }, 100);
    });
});

// Define the hierarchical data structure
const data = {
    name: "Critical Theory",
    children: [
        {
            name: "Generations",
            color: "#1f77b4",
            children: [
                {name: "First Generation", size: 10, imports: ["Marx", "Freud", "Weber", "Horkheimer", "Adorno", "Marcuse", "Benjamin"]},
                {name: "Second Generation", size: 8, imports: ["First Generation", "Kant", "Habermas"]},
                {name: "Third Generation", size: 7, imports: ["Second Generation", "Hegel", "Post-structuralism", "Honneth", "Fraser", "Allen", "Benhabib", "Forst"]}
            ]
        },
        {
            name: "Influences",
            color: "#ff7f0e",
            children: [
                {name: "Marx", size: 10, imports: ["Alienation", "Reification", "Ideology", "Emancipation"]},
                {name: "Freud", size: 8, imports: ["Authoritarian Personality"]},
                {name: "Weber", size: 8, imports: ["Reification", "System/Lifeworld"]},
                {name: "Kant", size: 7, imports: ["Communicative Action", "Justification", "Emancipation"]},
                {name: "Hegel", size: 9, imports: ["Kant", "Immanent Critique", "Recognition", "Negative Dialectics"]},
                {name: "Nietzsche", size: 6, imports: ["Genealogical Critique"]},
                {name: "Lukács", size: 6, imports: ["Reification", "Marx"]},
                {name: "Post-structuralism", size: 7, imports: ["Disclosive Critique", "Genealogical Critique"]}
            ]
        },
        {
            name: "Methods",
            color: "#2ca02c",
            children: [
                {name: "Immanent Critique", size: 10, imports: ["Hegel", "Marx", "First Generation", "Horkheimer", "Adorno"]},
                {name: "Reconstructive Critique", size: 8, imports: ["Hegel", "Immanent Critique", "Honneth"]},
                {name: "Disclosive Critique", size: 7, imports: ["First Generation", "Post-structuralism", "Benjamin", "Adorno"]},
                {name: "Genealogical Critique", size: 7, imports: ["Nietzsche", "Post-structuralism", "Foucault"]},
                {name: "Communicative Action", size: 9, imports: ["Habermas", "Kant", "System/Lifeworld"]}
            ]
        },
        {
            name: "Concepts",
            color: "#d62728",
            children: [
                {name: "Alienation", size: 9, imports: ["Marx", "Hegel", "First Generation", "Adorno", "Marcuse"]},
                {name: "Reification", size: 9, imports: ["Lukács", "Marx", "Weber", "Horkheimer", "Adorno", "Habermas", "Honneth"]},
                {name: "Ideology", size: 10, imports: ["Marx", "First Generation", "Adorno"]},
                {name: "Emancipation", size: 10, imports: ["Marx", "Kant", "First Generation", "Marcuse", "Habermas", "Critical Practices"]}
            ]
        },
        {
            name: "Contemporary Focuses",
            color: "#9467bd",
            children: [
                {name: "Gender", size: 8, imports: ["Third Generation", "Feminist Theory", "Fraser", "Allen", "Benhabib"]},
                {name: "Race", size: 7, imports: ["Critical Race Theory", "First Generation", "Authoritarianism"]},
                {name: "Colonialism", size: 7, imports: ["Post-colonialism", "Third Generation", "Allen"]},
                {name: "Economic Crises", size: 8, imports: ["Marx", "Capitalism", "Fraser"]},
                {name: "Ecological Crises", size: 8, imports: ["First Generation", "Adorno", "Marcuse"]},
                {name: "Political Crises", size: 9, imports: ["First Generation", "Authoritarianism", "Culture Industry"]}
            ]
        },
        {
            name: "Key Theorists",
            color: "#8c564b",
            children: [
                {name: "Horkheimer", size: 10, imports: ["First Generation", "Immanent Critique", "Marx", "Culture Industry", "Critical Theory versus Traditional Theory"]},
                {name: "Adorno", size: 10, imports: ["First Generation", "Negative Dialectics", "Horkheimer", "Culture Industry", "Authoritarian Personality"]},
                {name: "Marcuse", size: 9, imports: ["First Generation", "Freud", "Gender", "One-Dimensional Man", "Emancipation"]},
                {name: "Benjamin", size: 8, imports: ["First Generation", "Disclosive Critique"]},
                {name: "Habermas", size: 10, imports: ["Second Generation", "Kant", "Communicative Action", "System/Lifeworld"]},
                {name: "Honneth", size: 9, imports: ["Third Generation", "Recognition", "Hegel", "Reconstructive Critique"]},
                {name: "Fraser", size: 8, imports: ["Third Generation", "Gender", "Economic Crises", "Capitalism"]},
                {name: "Allen", size: 7, imports: ["Third Generation", "Gender", "Colonialism", "Post-structuralism"]},
                {name: "Benhabib", size: 7, imports: ["Third Generation", "Gender", "Habermas"]},
                {name: "Forst", size: 7, imports: ["Third Generation", "Kant", "Justification"]}
            ]
        },
        {
            name: "Special Concepts",
            color: "#e377c2",
            children: [
                {name: "Negative Dialectics", size: 8, imports: ["Adorno", "Hegel"]},
                {name: "Culture Industry", size: 8, imports: ["Adorno", "Horkheimer", "Capitalism", "Political Crises"]},
                {name: "System/Lifeworld", size: 8, imports: ["Habermas", "Weber", "Communicative Action"]},
                {name: "Authoritarian Personality", size: 7, imports: ["First Generation", "Freud", "Adorno"]},
                {name: "One-Dimensional Man", size: 7, imports: ["Marcuse", "Capitalism", "Alienation"]},
                {name: "Recognition", size: 8, imports: ["Honneth", "Hegel"]},
                {name: "Justification", size: 7, imports: ["Forst", "Kant"]},
                {name: "Critical Theory versus Traditional Theory", size: 8, imports: ["Horkheimer", "Marx", "Immanent Critique"]},
                {name: "Feminist Theory", size: 7, imports: ["Gender", "Fraser", "Allen", "Benhabib"]},
                {name: "Critical Race Theory", size: 7, imports: ["Race"]},
                {name: "Post-colonialism", size: 7, imports: ["Colonialism"]},
                {name: "Foucault", size: 7, imports: ["Genealogical Critique", "Post-structuralism"]},
                {name: "Capitalism", size: 8, imports: ["Marx", "Culture Industry", "One-Dimensional Man", "Economic Crises"]},
                {name: "Critical Practices", size: 8, imports: ["Emancipation", "First Generation", "Third Generation"]}
            ]
        }
    ]
};

// Node descriptions for popups
const nodeDescriptions = {
    "First Generation": "The original group of Frankfurt School theorists who began work in the 1930s. They developed critical theory as an interdisciplinary approach combining philosophy and social science with the practical aim of furthering emancipation.",
    "Second Generation": "Led by Jürgen Habermas, the second generation shifted focus to communicative action and discourse ethics, working to provide more robust normative foundations for critical theory.",
    "Third Generation": "Includes figures like Axel Honneth, Nancy Fraser, and Seyla Benhabib who developed diverse approaches to critical theory focusing on recognition, redistribution, and representation.",
    "Marx": "Karl Marx was a foundational influence on critical theory. Frankfurt School theorists revised and updated Marxism while maintaining its commitment to radical critique and emancipatory transformation.",
    "Freud": "Sigmund Freud's psychoanalytic theory was integrated into critical theory to understand the psychology of individuals and how social conflicts get denied or repressed.",
    "Weber": "Max Weber's theory of rationalization, which stressed the growing dominance of instrumental rationality through bureaucratization, heavily influenced Frankfurt School analysis.",
    "Kant": "Immanuel Kant's appeal to autonomy and public use of reason animates the ideal of emancipation throughout critical theory.",
    "Hegel": "G.W.F. Hegel's dialectical method and concept of recognition have been continual reference points for Frankfurt School philosophers.",
    "Nietzsche": "Friedrich Nietzsche influenced the first generation as a critic of modern bourgeois culture and violent formation of individual subjectivity.",
    "Immanent Critique": "A form of critique that seeks to secure its normative resources from within the society being criticized, avoiding purely external or internal standards.",
    "Reconstructive Critique": "Seeks to develop a socially grounded form of normativity by reconstructing social values and how they are institutionalized in modern societies.",
    "Disclosive Critique": "Aims to reveal the world in a new light, disclosing unrecognized suffering and forms of domination that are occluded by dominant ideologies.",
    "Genealogical Critique": "Traces the historical emergence of social practices, highlighting their contingency and denaturalizing them to open possibilities for thinking differently.",
    "Alienation": "Refers to humans being separated or estranged from something crucial to their freedom, whether their labor, themselves, or the world around them.",
    "Reification": "The process by which social relations take on a thing-like character, with people and social processes becoming objectified and instrumentalized.",
    "Ideology": "Refers to action-guiding belief systems that obscure social reality, especially power relations and social conflicts, thereby contributing to maintaining the status quo.",
    "Emancipation": "The liberation from social, political, and economic domination, aiming at enabling collective practices of self-determination.",
    "Gender": "Contemporary feminist critical theory analyzes gender-based oppression and has expanded the Frankfurt School tradition to engage feminist movements and theory.",
    "Race": "Critical race theory extends Frankfurt School analysis to focus on racial oppression, examining how racism functions within capitalism and modern institutions.",
    "Colonialism": "Postcolonial theory critiques Eurocentrism in critical theory and examines how colonialism constitutively shaped modern European societies and knowledge.",
    "Horkheimer": "Max Horkheimer was director of the Institute for Social Research and outlined the original research agenda for the Frankfurt School in 1931.",
    "Adorno": "Theodor W. Adorno developed negative dialectics and collaborated with Horkheimer on Dialectic of Enlightenment, a critical analysis of instrumental reason.",
    "Marcuse": "Herbert Marcuse analyzed 'one-dimensional' society and supported radical social movements of the 1960s and 1970s, seeking to overcome repressive desublimation.",
    "Benjamin": "Walter Benjamin contributed innovative analysis of mass culture, placing hope in its radical potential, unlike Adorno who saw it as conformist.",
    "Habermas": "Jürgen Habermas developed the theory of communicative action, discourse ethics, and a defense of modernity based on rational communication.",
    "Honneth": "Axel Honneth developed a theory of recognition, analyzing how struggles for recognition drive social progress across various social spheres.",
    "Fraser": "Nancy Fraser has focused on integrating redistribution, recognition, and representation in a comprehensive theory of justice and critical analysis of capitalism.",
    "Culture Industry": "A concept from Dialectic of Enlightenment describing how culture is manufactured using standardized methods that pacify audiences and reconcile them to the status quo.",
    "Negative Dialectics": "Adorno's approach that takes from Hegelian dialectics the emphasis on difference and mediation but abandons the attempt to overcome difference through unifying synthesis.",
    "System/Lifeworld": "Habermas's distinction between domains governed by instrumental rationality (system) and those organized through communicative action (lifeworld)."
};

// Function to create the visualization
function createVisualization() {
    // Clear previous visualization
    d3.select("#visualization").selectAll("*").remove();
    
    // Create SVG element
    const svg = d3.select("#visualization")
        .append("svg")
        .attr("viewBox", [0, 0, 960, 960])
        .style("background", "white");
        
    // Create group element
    const g = svg.append("g")
        .attr("transform", `translate(${960 / 2},${960 / 2})`);
    
    // Set up the radius and cluster layout
    const radius = 960 / 2 - 130;

    // Create a cluster layout
    const cluster = d3.cluster()
        .size([360, radius]);
        
    // Create a hierarchy from the root data
    const root = d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name));
        
    // Apply the cluster layout to the hierarchy
    cluster(root);
    
    // Get the nodes and links
    const nodes = root.descendants();
    
    // Process imports to create links
    let links = [];
    
    function collectImports(node) {
        if (node.data.imports) {
            node.data.imports.forEach(importName => {
                // Find the target node
                const target = nodes.find(n => n.data.name === importName);
                if (target) {
                    links.push({ source: node, target });
                }
            });
        }
        
        if (node.children) {
            node.children.forEach(collectImports);
        }
    }
    
    collectImports(root);
    
    // Draw the links with proper curved paths
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("d", d => {
            // Get cartesian coordinates for source and target
            const sourceX = d.source.y * Math.sin(d.source.x * Math.PI / 180);
            const sourceY = -d.source.y * Math.cos(d.source.x * Math.PI / 180);
            const targetX = d.target.y * Math.sin(d.target.x * Math.PI / 180);
            const targetY = -d.target.y * Math.cos(d.target.x * Math.PI / 180);
            
            // Calculate midpoint
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            
            // Calculate distance between points
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate control point
            // Control point is perpendicular to the midpoint of the straight line
            // but its position is adjusted based on the distance between nodes
            const normX = -dy / dist;
            const normY = dx / dist;
            
            // Calculate angle between points (in radians)
            const angle = Math.atan2(dy, dx);
            const angleDiff = Math.abs(d.source.x - d.target.x) * Math.PI / 180;
            
            // Adjust curvature based on angular distance between points
            // More curve for points that are further apart angularly
            let curveStrength = 0;
            
            if (angleDiff < Math.PI) {
                // Points are on same side, use stronger curve
                curveStrength = Math.min(dist * 0.3, radius * 0.2);
            } else {
                // Points are on opposite sides, use softer curve
                curveStrength = Math.min(dist * 0.15, radius * 0.1);
            }
            
            // Ensure curves stay within the circle by limiting the control point's distance from center
            const ctrlX = midX + normX * curveStrength;
            const ctrlY = midY + normY * curveStrength;
            
            // Use quadratic Bezier curve
            return `M${sourceX},${sourceY} Q${ctrlX},${ctrlY} ${targetX},${targetY}`;
        })
        .style("stroke-opacity", 0.35) // More visible links
        .style("stroke-width", 0.8);    // Slightly thicker lines by default
    
    // Create group for nodes
    const nodeG = g.append("g")
        .attr("class", "nodes");
        
    // Draw the nodes with labels
    const node = nodeG.selectAll("g")
        .data(nodes.filter(d => !d.children))
        .join("g")
        .attr("class", "node-group")
        .attr("transform", d => {
            const x = d.y * Math.sin(d.x * Math.PI / 180);
            const y = -d.y * Math.cos(d.x * Math.PI / 180);
            return `translate(${x},${y})`;
        });
    
    // Add circles for nodes
    node.append("circle")
        .attr("class", "node")
        .attr("r", d => d.data.size ? Math.sqrt(d.data.size) * 1.2 : 3)
        .attr("fill", d => {
            // Find the color of the parent
            let parent = d.parent;
            while (parent && !parent.data.color) {
                parent = parent.parent;
            }
            return parent ? parent.data.color : "#666";
        });
    
    // Add text labels
    node.append("text")
        .attr("class", "node-label")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < 180 ? 6 : -6)
        .attr("text-anchor", d => d.x < 180 ? "start" : "end")
        .text(d => d.data.name)
        .style("font-size", "9px")
        .style("fill", "#333");
    
    // Setup popup
    const popup = d3.select("#popup");
    const popupTitle = d3.select("#popupTitle");
    const popupCategory = d3.select("#popupCategory");
    const popupContent = d3.select("#popupContent");
    const popupConnections = d3.select("#popupConnections");
    
    d3.select("#closePopup").on("click", function() {
        popup.classed("visible", false);
    });
    
    // Interactive features for nodes
    node.on("mouseover", function(event, d) {
        // Change blend mode for better visibility
        link.style("mix-blend-mode", null);
        
        // Highlight source node
        d3.select(this)
            .select("circle")
            .attr("class", "node node--source");
        
        // Highlight outgoing links
        link.filter(l => l.source === d)
            .attr("class", "link link--source")
            .style("stroke-opacity", 0.8)
            .style("stroke-width", 1.5)
            .each(function() { this.parentNode.appendChild(this); });
        
        // Highlight incoming links
        link.filter(l => l.target === d)
            .attr("class", "link link--target")
            .style("stroke-opacity", 0.8)
            .style("stroke-width", 1.5)
            .each(function() { this.parentNode.appendChild(this); });
        
        // Highlight connected nodes
        node.filter(n => links.some(l => (l.source === d && l.target === n) || (l.target === d && l.source === n)))
            .select("circle")
            .attr("class", "node node--target");
            
        // Make connected labels more visible
        node.filter(n => links.some(l => (l.source === d && l.target === n) || (l.target === d && l.source === n)))
            .select("text")
            .style("font-weight", "bold");
    })
    .on("mouseout", function(event, d) {
        if (!popup.classed("visible")) {
            // Reset visualization
            link.style("mix-blend-mode", "multiply");
            
            d3.select(this)
                .select("circle")
                .attr("class", "node");
            
            link
                .attr("class", "link")
                .style("stroke-opacity", 0.35)
                .style("stroke-width", 0.8);
            
            node
                .select("circle")
                .attr("class", "node");
                
            node
                .select("text")
                .style("font-weight", "normal");
        }
    })
    .on("click", function(event, d) {
        event.stopPropagation();
        
        // Find the parent category for this node
        let parentCategory = "Unknown";
        let parentColor = "#333";
        let parent = d.parent;
        while (parent && parent.depth > 0) {
            parentCategory = parent.data.name;
            if (parent.data.color) {
                parentColor = parent.data.color;
            }
            parent = parent.parent;
        }
        
        // Set popup position
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.x + window.scrollX;
        const y = rect.y + window.scrollY;
        
        popup.style("left", (x + 20) + "px")
             .style("top", (y - 20) + "px")
             .style("border-left", `4px solid ${parentColor}`);
        
        // Fill popup with data
        popupTitle.text(d.data.name);
        popupCategory.text(parentCategory);
        popupCategory.style("background-color", parentColor);
        
        // Set content from descriptions or a default message
        popupContent.text(nodeDescriptions[d.data.name] || 
            "A key concept in Critical Theory. Click connections below to explore related concepts.");
        
        // List connections
        popupConnections.html("");
        
        // Find imports (outgoing connections)
        if (d.data.imports && d.data.imports.length > 0) {
            d.data.imports.forEach(imp => {
                popupConnections.append("li")
                    .text(imp)
                    .style
