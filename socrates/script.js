// Wait for DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the first scene
    showScene('intro');
    
    // Make functions available globally
    window.showScene = showScene;
    window.restart = restart;
});

function showScene(sceneId) {
    // Check if the target scene exists
    const targetScene = document.getElementById(sceneId);
    if (!targetScene) {
        console.error(`Scene with ID "${sceneId}" not found`);
        return;
    }
    
    // Hide all scenes
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.remove('active');
    });
    
    // Show the requested scene
    targetScene.classList.add('active');
    
    // Scroll to top of the new scene
    window.scrollTo(0, 0);
    
    // Initialize network graph if needed
    if (sceneId === 'network-map') {
        setTimeout(() => initNetworkGraph(), 100); // Slight delay to ensure the container is visible
    }
}

function restart() {
    showScene('intro');
}

// Epistemology Network Graph
function initNetworkGraph() {
    // Check if D3 is available
    if (typeof d3 === 'undefined') {
        console.error('D3.js is not loaded. Please include D3.js in your HTML file.');
        document.getElementById('network-container').innerHTML = 
            '<p style="padding: 20px; color: red;">Error: D3.js library is required for this visualization.</p>';
        return;
    }

    // Clear existing content
    document.getElementById('network-container').innerHTML = '';
    
    // Create node info panel if it doesn't exist
    if (!document.getElementById('node-info')) {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'node-info';
        infoPanel.className = 'node-info';
        infoPanel.innerHTML = '<p>Click on a node to see information</p>';
        document.getElementById('network-container').appendChild(infoPanel);
    }
    
    // Define the epistemological concepts and their connections
    const nodes = [
        { id: 1, name: "PERCEPTION", group: 1, description: "The idea that knowledge comes through our senses. In Theaetetus, this was the first definition proposed and was associated with Protagoras' 'man is the measure' doctrine. Modern problems include hallucinations, illusions, and questions about whether perception is theory-laden." },
        { id: 2, name: "TRUE BELIEF", group: 1, description: "The position that knowledge is simply belief that happens to be true. Socrates showed this was insufficient using the jury example. Modern epistemologists still wrestle with the distinction between lucky guesses and genuine knowledge." },
        { id: 3, name: "JUSTIFICATION", group: 2, description: "The requirement that knowledge needs backing or reasons. This emerged in Theaetetus as the 'account' that must accompany true belief. Modern debates focus on what counts as adequate justification and whether it must be accessible to the knower." },
        { id: 4, name: "GETTIER PROBLEMS", group: 2, description: "Cases where justified true belief seems insufficient for knowledge due to luck or accident. While not explicitly in Theaetetus, they're anticipated by Socrates' concerns about the limitations of definitions of knowledge." },
        { id: 5, name: "SKEPTICISM", group: 3, description: "The position that knowledge might be impossible to attain. The inconclusive ending of Theaetetus suggests a kind of skeptical outlook. Modern skeptical arguments often focus on radical scenarios like brain-in-a-vat thought experiments." },
        { id: 6, name: "FOUNDATIONALISM", group: 3, description: "The view that knowledge has a secure foundation in basic beliefs. Related to the discussion in Theaetetus about whether elements can be known or only complexes. Modern foundationalists debate what counts as properly basic beliefs." },
        { id: 7, name: "COHERENTISM", group: 3, description: "The theory that knowledge consists in beliefs that cohere with one another. This addresses Socrates' concerns about circularity in accounts. Modern coherentists explore how systems of beliefs can be mutually supporting." },
        { id: 8, name: "RELIABILISM", group: 4, description: "The view that knowledge requires reliable cognitive processes. This relates to Socrates' concerns about the unreliability of both perception and belief. Modern reliabilists focus on which cognitive mechanisms tend to produce truth." },
        { id: 9, name: "SOCIAL EPISTEMOLOGY", group: 4, description: "The study of knowledge as a social phenomenon. Connected to Socrates' midwifery method and the dialogue format itself. Modern social epistemologists examine testimony, expertise, and group knowledge." },
        { id: 10, name: "VIRTUE EPISTEMOLOGY", group: 4, description: "The approach that focuses on intellectual virtues rather than propositional knowledge. While not explicit in Theaetetus, it connects to Socrates' emphasis on intellectual humility and the pursuit of wisdom." }
    ];

    const links = [
        { source: 1, target: 2, value: 2 },
        { source: 1, target: 3, value: 2 },
        { source: 1, target: 5, value: 3 },
        { source: 1, target: 8, value: 2 },
        { source: 2, target: 3, value: 3 },
        { source: 2, target: 4, value: 3 },
        { source: 3, target: 4, value: 3 },
        { source: 3, target: 6, value: 2 },
        { source: 3, target: 7, value: 2 },
        { source: 3, target: 8, value: 2 },
        { source: 4, target: 5, value: 2 },
        { source: 5, target: 6, value: 2 },
        { source: 5, target: 9, value: 1 },
        { source: 6, target: 7, value: 3 },
        { source: 6, target: 8, value: 2 },
        { source: 7, target: 9, value: 2 },
        { source: 8, target: 10, value: 2 },
        { source: 9, target: 10, value: 3 }
    ];

    // Get the container dimensions
    const container = document.getElementById('network-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create SVG element
    const svg = d3.select('#network-container')
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define color scheme for groups
    const color = d3.scaleOrdinal()
        .domain([1, 2, 3, 4])
        .range(["#ff6b6b", "#4ecdc4", "#ffd166", "#6b5b95"]);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60));

    // Create links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", d => Math.sqrt(d.value));

    // Create node groups
    const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node-group")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add circles to nodes
    nodeGroup.append("circle")
        .attr("class", "node")
        .attr("r", 25)
        .style("fill", d => color(d.group))
        .on("click", function(event, d) {
            event.stopPropagation(); // Prevent event bubbling
            selectNode(d);
        });

    // Add text labels to nodes
    nodeGroup.append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(d => d.name)
        .style("font-size", d => {
            // Adjust font size based on name length
            return Math.max(8, 12 - d.name.length / 3) + "px";
        })
        .on("click", function(event, d) {
            event.stopPropagation(); // Prevent event bubbling
            selectNode(d);
        });

    // Handle node selection
    function selectNode(d) {
        console.log("Node clicked:", d.name); // Debug output
        
        // Clear previous selection
        d3.selectAll(".node").classed("selected", false);
        
        // Find and mark this node as selected
        d3.selectAll(".node")
            .filter(node => node.id === d.id)
            .classed("selected", true);
        
        // Update node info display
        document.getElementById("node-info").innerHTML = 
            `<strong>${d.name}</strong><br>${d.description.substring(0, 100)}...`;
        
        // Update concept detail
        document.getElementById("concept-content").innerHTML = 
            `<h4>${d.name}</h4>
            <p>${d.description}</p>
            <h4>CONNECTIONS TO THEAETETUS</h4>
            <p>${getTheaetetusConnection(d.id)}</p>
            <h4>MODERN DEVELOPMENTS</h4>
            <p>${getModernDevelopment(d.id)}</p>`;
    }

    // Define Theaetetus connections for each concept
    function getTheaetetusConnection(nodeId) {
        const connections = {
            1: "The first definition offered in the dialogue: 'Knowledge is perception.' Socrates connects this to Protagoras' relativism and Heraclitus' flux theory before refuting it with the language and memory arguments.",
            2: "The second definition: 'Knowledge is true belief.' Socrates uses the jury example to show how someone might have a true belief without having knowledge.",
            3: "The 'account' (logos) in the third definition: 'Knowledge is true belief with an account.' Socrates explores three possible meanings of 'account' but finds problems with each.",
            4: "Anticipated by Socrates' exploration of cases where true belief might be inadequate for knowledge, especially the jury example where true belief comes about through persuasion rather than understanding.",
            5: "The aporetic ending of Theaetetus, where no satisfactory definition is reached, suggests a kind of skepticism. Socrates' claim to know only that he doesn't know reflects skeptical themes.",
            6: "Connected to Socrates' investigation of whether basic elements can be known or only complexes built from them. The 'Dream Theory' section explores foundational issues.",
            7: "Related to Socrates' concerns about circularity in definitions, especially when discussing the third meaning of 'account' as identifying a thing's distinguishing mark.",
            8: "Implicitly addressed when Socrates questions the reliability of perception and the conditions under which beliefs formed from perception might constitute knowledge.",
            9: "Embodied in the dialogue format itself and Socrates' midwifery method. Knowledge emerges through social interaction rather than solitary contemplation.",
            10: "While not explicitly discussed, the dialogue exemplifies intellectual virtues like perseverance, humility, and open-mindedness that characterize Socratic inquiry."
        };
        return connections[nodeId] || "Connection not specified.";
    }

    // Define modern developments for each concept
    function getModernDevelopment(nodeId) {
        const developments = {
            1: "Contemporary debates about perception include theories of direct realism, representative realism, and the role of conceptual frameworks in shaping what we perceive. Neuroscience has added new dimensions to understanding how perception works.",
            2: "The distinction between true belief and knowledge remains central to epistemology. The question of what must be added to true belief to yield knowledge (the 'Gettier problem') has generated enormous literature since 1963.",
            3: "Modern theories of justification divide into internalist views (where justification must be accessible to the subject) and externalist views (where external factors like reliability can justify without the subject's awareness).",
            4: "Edmund Gettier's 1963 paper initiated decades of attempts to solve the 'Gettier problem' by adding or modifying conditions beyond justified true belief. Proposed solutions include reliability, sensitivity, safety, and anti-luck conditions.",
            5: "Contemporary skeptical arguments often involve thought experiments like brains in vats or simulation hypotheses. Responses include contextualism, relevant alternatives theory, and sensitivity/safety conditions on knowledge.",
            6: "Modern foundationalists debate whether basic beliefs must be infallible or can be merely prima facie justified. Some embrace 'modest foundationalism' where basic beliefs have some initial credibility but remain defeasible.",
            7: "Contemporary coherentists have developed sophisticated models of how beliefs can mutually support each other without vicious circularity. Some versions focus on explanatory coherence or probabilistic coherence.",
            8: "Reliabilism, developed by philosophers like Alvin Goldman, holds that knowledge requires belief formation through reliable processes. This bypasses traditional internalist concerns about accessible justification.",
            9: "Social epistemology examines how social factors influence knowledge acquisition, including testimony, disagreement, group belief, epistemic injustice, and the social structure of science. The internet age has made these issues increasingly relevant.",
            10: "Virtue epistemology, championed by philosophers like Linda Zagzebski and Ernest Sosa, focuses on intellectual virtues like open-mindedness, intellectual courage, and epistemic justice rather than on propositional knowledge alone."
        };
        return developments[nodeId] || "Modern developments not specified.";
    }

    // Update positions on simulation tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeGroup
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    // Select a default node to display initially
    setTimeout(() => {
        console.log("Selecting default node");
        selectNode(nodes[0]);
    }, 500);
    
    // Add click handler for the background to help with debugging
    svg.on("click", function() {
        console.log("SVG background clicked");
    });
}