// =========================================================================
// Project KAFKA: Full Experience with ACT I and ACT II
// Final Version with Design Fixes and Credits Page.
// =========================================================================

// --- 1. Global Variables & Constants ---
let capture;
let canvas;
let hands;
let handLandmarks;

// --- State Management ---
let current_stage = "INTRO";
let isVideoReady = false;
let intro_start_time;

const SMOOTHING_FACTOR = 0.5;
let cursor_x, cursor_y;
let smoothed_cursor_pos, last_cursor_pos;

// --- ACT I Variables ---
const NUM_PARTICLES = 2000;
let particles_pos = [], particles_original_pos = [];
const REPULSION_RADIUS = 150, REPULSION_STRENGTH = 15.0, RETURN_SPEED = 0.02;
let DWELL_TIME = 1.5;
let hover_start_time = 0;
let radar_angle = 0;
let velocity_history = [];
let binary_stream = [];

// --- ACT II Variables ---
let pharmakon_words = [];
let relational_nodes = [];
const PROSTHETICITY_TEXT = "Prostheticity designates the fact that man lives only by, with, and according to his technical 'prostheses' ... Man is a neotenic being – that is to say, a being who is born prematurely and essentially incomplete; and becomes to be formed or educated only through his technical prostheses.";
const PHARMAKON_TEXT = "The pharmakon is both what permits care-taking and what requires one to take care... It has medicinal power to the extent that it is (and also isn't) a destructive power. This is what characterizes pharmacology as it tries to grasp, in the same gesture, both what endangers and what saves.";
const RELATIONAL_TEXT = "Relational technologies can just as easily produce short circuits as long circuits in transindividuation. If the scope of these technologies is left to market forces alone... it will necessarily produce a drastic shortening in the circuits of transindividuation.";

// --- Content Definitions (from original code) ---
const CODE_SNIPPETS = {
    "Cursor Logic": { "rect": [50, 50, 550, 180], "code": "if (results) {\n    // Get finger position\n    let finger_x = landmark.x * width;\n    \n    // Apply smoothing filter (lerp)\n    cursor_x = lerp(cursor_x, finger_x, S);\n}", "critique": "This is not your 'hand'. It is a smoothed vector. Your gesture is reduced to a set of coordinates, filtered by an algorithm to create a pleasing, but artificial, illusion of movement." },
    "Particle Physics": { "rect": [50, 250, 550, 220], "code": "// Calculate vector from cursor to all particles\nlet vec_to_particles = p5.Vector.sub(pos, cursor);\nlet dist = vec_to_particles.mag();\n\n// Apply repulsion to close particles\nif (dist < REPULSION_RADIUS) {\n    let force = vec_to_particles.normalize();\n    force.mult(REPULSION_STRENGTH);\n    pos.add(force);\n}", "critique": "This 'space' does not exist. It is an Array of Vector objects. The 'force' you feel is a vector calculation. The entire physical metaphor is a procedure running on a loop, dictated by code." },
    "Render Loop": { "rect": [50, 490, 550, 180], "code": "function draw() {\n    background(0); // Clear screen\n\n    // ... update physics ...\n    // ... draw particles ...\n\n}", critique: "The illusion of continuity is created by rapidly redrawing a black screen (~60 times per second). There is no object persistence, only a high-frequency refresh rate that your brain interprets as motion." }
};
const HARDWARE_COMPONENTS = {
    "CPU": { "rect": [550, 50, 180, 100], "critique": "Below the algorithm is the logic gate. Your 'interaction' is now a series of clock cycles, voltage differences, and heat dissipation. The physical and thermodynamic limit of the system." },
    "WEBCAM": { "rect": [100, 200, 180, 100], "critique": "The camera does not 'see' you. It converts photons into a matrix of integer values. This numerical representation is the only 'real' the machine can process." },
    "DISPLAY": { "rect": [1000, 200, 180, 100], "critique": "The screen does not show you a 'world'. It is a grid of pixels, each emitting a controlled mixture of Red, Green, and Blue light. The image is a constructed illusion." },
    "BIOLOGY (Hand/Eye)": { "rect": [500, 325, 280, 100], "critique": "Your own body is part of the circuit. Your eye is a sensor for the display; your hand is a controller for the CPU. Technics is prosthetic by nature; the human is completed by its tools." },
    "NETWORK": { "rect": [900, 550, 300, 100], "text": "[ ANALYZE HISTORY ]", "critique": "Your machine is not alone. It is a node connected by fiber optics and radio waves to a global infrastructure. Data flows are routed and shaped far beyond your control." }
};
const WAR_COMPONENTS = {
    "TELEGRAPH": { "pos": [200, 200], "critique": "Napoleon's Semaphore. For the first time, information traveled faster than the messenger. Command and control at a distance became a reality, laying the groundwork for modern logistics.", "targeted": false },
    "RADIO (ENIGMA)": { "pos": [640, 400], "critique": "WWII was a war of signals. Encrypted radio transmissions coordinated blitzkriegs. The entire conflict became a race between encryption (Enigma) and decryption (Turing's Bombe).", "targeted": false },
    "ARPANET": { "pos": [1080, 200], "critique": "The Internet began as a US military project to create a decentralized network that could survive a nuclear attack. Every packet you send still bears the mark of its military origin.", "targeted": false }
};
const POSTHUMAN_CRITIQUE = "The system is no longer interested in your 'intention' or 'meaning'. It analyzes the statistical properties of your data stream. The 'human' becomes a calculable effect, a set of parameters derived from a body that provides a signal.";
const history_book_text = "In the discourse network of 1800, the book was the universal medium. It processed and stored all forms of 'media' as a series of black and white letters. Literature was the archive of speech, music, and noise. Everything was filtered through the alphabet.";
const history_1900_critique = "Around 1900, the invention of the phonograph and cinematograph shattered this monopoly. For the first time, sound and image could be stored directly, bypassing the symbolic bottleneck of writing. This was a physical, not just a cultural, revolution. Reality itself could now be recorded on a time axis.";

// --- Transition Nodes ---
let transition_node_1 = { rect: [490, 310, 300, 100], text: "[ COME CLOSER ]" };
let transition_node_2 = { rect: [900, 550, 300, 100], text: "[ EXECUTE ]" };
let transition_node_5 = { rect: [50, 600, 300, 100], text: "[ ANALYZE SUBJECT ]" };
let transition_node_6 = { rect: [440, 550, 400, 100], text: "[ POISON OR CURE? ]" };
let pharmakon_proceed_button = { rect: [], text: "[ CONTINUE ANALYSIS ]" };
let prosthetic_proceed_button = { rect: [], text: "[ EXAMINE RELATIONS ]" };
let relational_proceed_button = { rect: [], text: "[ END ANALYSIS ]" };
let restart_button = { rect: [], text: "[ RESTART ]" };

// --- p5.js setup() Function ---
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    intro_start_time = millis();
    textFont('monospace');
    textSize(18);

    cursor_x = width / 2;
    cursor_y = height / 2;
    smoothed_cursor_pos = createVector(width / 2, height / 2);
    last_cursor_pos = createVector(width / 2, height / 2);

    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles_pos.push(createVector(random(width), random(height)));
        particles_original_pos.push(particles_pos[i].copy());
    }

    let numRows = floor(height / 24) + 1;
    let numCols = floor(width / 16) + 1;
    for (let i = 0; i < numRows; i++) {
        let row = [];
        for (let j = 0; j < numCols; j++) row.push(floor(random(2)));
        binary_stream.push(row);
    }
    
    const words = ["knowledge", "desire", "attention", "spirit", "care", "memory", "truth"];
    for (let i = 0; i < 50; i++) {
        pharmakon_words.push({ text: random(words), pos: createVector(random(width), random(height)), vel: p5.Vector.random2D(), health: 1.0 });
    }
    relational_nodes.push({ label: "Desire", pos: createVector(width * 0.3, height * 0.3), color: color(255, 100, 100) });
    relational_nodes.push({ label: "Technology", pos: createVector(width * 0.7, height * 0.3), color: color(100, 100, 255) });
    relational_nodes.push({ label: "Culture", pos: createVector(width * 0.3, height * 0.7), color: color(100, 255, 100) });
    relational_nodes.push({ label: "Market", pos: createVector(width * 0.7, height * 0.7), color: color(255, 150, 0), isMarket: true, consumed: [] });

    capture = createCapture(VIDEO, onVideoReady);
    capture.size(width, height);
    capture.hide();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// --- Main Draw Loop ---
function draw() {
    let velocity = 0;
    if (handLandmarks) {
        let finger = handLandmarks[8];
        cursor_x = lerp(cursor_x, (1 - finger.x) * width, SMOOTHING_FACTOR);
        cursor_y = lerp(cursor_y, finger.y * height, SMOOTHING_FACTOR);
        let current_raw_pos = createVector(cursor_x, cursor_y);
        velocity = p5.Vector.dist(current_raw_pos, last_cursor_pos);
        if(velocity_history.length > 200) velocity_history.shift();
        velocity_history.push(velocity);
        last_cursor_pos.set(current_raw_pos);
    }
    if(smoothed_cursor_pos) smoothed_cursor_pos.set(cursor_x, cursor_y);

    // --- STAGE ROUTER ---
    if (current_stage === "INTRO") { drawIntro(); return; }
    
    background(0);
    if (current_stage === "SURFACE") { drawSurface(); }
    else if (current_stage === "CODE") { drawCode(); }
    else if (current_stage === "HARDWARE") { drawHardware(); }
    else if (current_stage === "HISTORY") { drawHistory(); }
    else if (current_stage === "WAR") { drawWar(); }
    else if (current_stage === "POSTHUMAN") { drawPosthuman(velocity); }
    else if (current_stage === "PHARMAKON") { drawPharmakon(velocity); }
    else if (current_stage === "PROSTHETIC") { drawProsthetic(); }
    else if (current_stage === "RELATIONAL") { drawRelational(); }
    else if (current_stage === "CREDITS") { drawCredits(); }
    
    drawCursor();
}

// =========================================================================
//                                  DRAW FUNCTIONS
// =========================================================================

function drawIntro() {
    background(0); fill(0, 200, 80); noStroke();
    let time = millis() - intro_start_time; let y = 100;
    const showAfter = (delay, txt) => { if (time > delay) { text(txt, 100, y); y += 28; } };
    showAfter(500,  '> MEDIA ANALYSIS PROGRAM v2.0');
    showAfter(1000, '> KERNEL: KAFKA (Kittler-Analysis & Filtering Kernel Architecture)'); y += 28;
    showAfter(2000, `// "Our writing tools are also working on our thoughts." - Nietzsche, 1882`); y += 56;
    showAfter(3500, `// SYSTEM DIRECTIVE:`);
    showAfter(4000, `// This program uses your webcam to track your hand.`);
    showAfter(4500, `// Your presence is the signal to be processed.`); y += 28;
    showAfter(5500, `// The integrity of the optical-to-digital conversion is dependent on:`);
    showAfter(6000, `// 1. Ambient Lighting: Sufficient photons are required for a clean signal.`);
    showAfter(6500, `// 2. Computational Resources: Real-time analysis demands processing power.`);
    showAfter(7000, `// Signal degradation will manifest as tracking inaccuracies.`); y += 56;
    showAfter(8000, '> SYSTEM READY. AWAITING DATA STREAM.');
    if (time > 9000) {
        if (!isVideoReady) { fill(255, 200, 0); text('> [ PLEASE ENABLE WEBCAM TO PROVIDE SUBJECT DATA ]', 100, y); } 
        else {
            fill(0, 255, 150); text('> OPTICAL SENSOR LINKED. AWAITING USER COMPLIANCE.', 100, y); y += 56;
            if (handLandmarks && isThumbsUp(handLandmarks)) {
                 fill(255, 255, 255); text('> GESTURE ACKNOWLEDGED. EXECUTING...', 100, y);
                 if (time > 9500) { current_stage = "SURFACE"; }
            } else { fill(255, 200, 0); text('> [ HOLD UP A "THUMBS UP" TO PROCEED ]', 100, y); }
        }
    }
}

function drawSurface() {
    for (let i = 0; i < particles_pos.length; i++) {
        let p = particles_pos[i];
        let dist_sq = (p.x - cursor_x)**2 + (p.y - cursor_y)**2;
        if (dist_sq < REPULSION_RADIUS**2) {
            let force = p5.Vector.sub(p, smoothed_cursor_pos).normalize();
            force.mult(REPULSION_STRENGTH); p.add(force);
        } else {
            let home_vec = p5.Vector.sub(particles_original_pos[i], p);
            home_vec.mult(RETURN_SPEED); p.add(home_vec);
        }
        fill(100); noStroke(); circle(p.x, p.y, 2);
    }
    transition_node_1.rect = [width/2 - 150, height/2 - 50, 300, 100];
    drawTransitionNode(transition_node_1, "CODE");
}

function drawCode() {
    let critique_to_show = null; let highlighted_rect = null;
    for (const name in CODE_SNIPPETS) {
        const data = CODE_SNIPPETS[name];
        let is_hovering = checkHover(data.rect);
        stroke(is_hovering ? color(0, 255, 255) : 200); noFill(); strokeWeight(1);
        rect(data.rect[0], data.rect[1], data.rect[2], data.rect[3]);
        fill(is_hovering ? color(0, 255, 255) : 200); noStroke(); textAlign(LEFT, TOP); textSize(14);
        text(data.code, data.rect[0] + 15, data.rect[1] + 15);
        if (is_hovering) { critique_to_show = data.critique; highlighted_rect = data.rect; }
    }
    if (critique_to_show) {
        let panel_y = highlighted_rect[1] > height / 2 ? 100 : height - 320; let panel_x = width - 500;
        fill(0, 255, 255); textSize(16); textAlign(LEFT, TOP); text(critique_to_show, panel_x, panel_y, 450, 300);
    }
    transition_node_2.rect = [width - 350, height - 150, 300, 100];
    drawTransitionNode(transition_node_2, "HARDWARE");
}

function drawHardware() {
    textSize(16); noStroke();
    if (frameCount % 3 === 0) {
        binary_stream.pop(); let newRow = []; let numCols = floor(width / 16) + 1;
        for (let j = 0; j < numCols; j++) newRow.push(floor(random(2)));
        binary_stream.unshift(newRow);
    }
    for (let i = 0; i < binary_stream.length; i++) {
        for (let j = 0; j < binary_stream[i].length; j++) {
            fill(binary_stream[i][j] === 1 ? color(0, 150, 0) : 50); text(binary_stream[i][j], j * 16, i * 24);
        }
    }
    let critique_to_show = null;
    for (const name in HARDWARE_COMPONENTS) {
        const data = HARDWARE_COMPONENTS[name]; let is_hovering = checkHover(data.rect);
        if (data.text) {
            stroke(is_hovering ? color(0, 255, 150) : color(255, 150, 0)); strokeWeight(2); noFill();
            rect(data.rect[0], data.rect[1], data.rect[2], data.rect[3]);
            fill(is_hovering ? color(0, 255, 150) : color(255, 150, 0)); noStroke(); textSize(20); textAlign(CENTER, CENTER);
            text(data.text, data.rect[0] + data.rect[2]/2, data.rect[1] + data.rect[3]/2);
            if (is_hovering) handleDwell("HISTORY");
        } else {
            stroke(is_hovering ? color(255,0,0) : color(200,0,0)); strokeWeight(2); noFill();
            rect(data.rect[0], data.rect[1], data.rect[2], data.rect[3]);
            fill(is_hovering ? color(255,0,0) : color(200,0,0)); noStroke(); textSize(20); textAlign(CENTER, CENTER);
            text(name, data.rect[0] + data.rect[2]/2, data.rect[1] + data.rect[3]/2);
        }
        if(is_hovering) critique_to_show = data.critique;
    }
    if (critique_to_show) { fill(255); textSize(16); textAlign(LEFT, TOP); text(critique_to_show, 50, height - 220, width - 100, 200); }
}

function drawHistory() {
    let divider_x = smoothed_cursor_pos.x;
    background(20); 
    
    // --- Draw Left Side (Discourse Network 1800) ---
    noStroke(); // *** FIX: Ensure no stroke is applied to text ***
    fill(255);  // Use pure white for max contrast
    textSize(14);
    textAlign(LEFT, TOP);
    text(history_book_text, 50, 100, divider_x - 70, 300);
    text(history_1900_critique, 50, 430, divider_x - 70, 400);

    // Draw the horizontal line separator
    stroke(255); 
    strokeWeight(1);
    line(50, 400, divider_x - 20, 400);

    // Draw the title
    noStroke();
    textSize(24);
    fill(255);
    text("Discourse Network 1800", 50, height - 80);

    // --- Draw Right Side (Discourse Network 1900) ---
    for (let i = 0; i < 50; i++) {
        stroke(random(50, 150), random(50, 150), random(50, 150), 180);
        strokeWeight(random(0.5, 2));
        line(random(divider_x, width), random(height), random(divider_x, width), random(height));
    }
    
    stroke(100, 255, 100);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let i = divider_x; i < width; i++) {
        vertex(i, height / 2 + random(-50, 50));
    }
    endShape();

    noStroke();
    fill(100, 255, 100);
    textSize(24);
    textAlign(RIGHT, BOTTOM);
    text("Discourse Network 1900", width - 50, height - 50);

    // --- Transition Logic ---
    if (divider_x < width * 0.1) {
        current_stage = "WAR";
        for (const name in WAR_COMPONENTS) {
            WAR_COMPONENTS[name].targeted = false;
        }
    }
}

function drawWar() {
    background(0); stroke(0, 30, 0);
    for(let i=0; i<width; i+=50) line(i,0,i,height); for(let i=0; i<height; i+=50) line(0,i,width,i);
    radar_angle += 0.02; let end_x = width/2 + cos(radar_angle) * width; let end_y = height/2 + sin(radar_angle) * width;
    stroke(0, 80, 0); strokeWeight(2); line(width/2, height/2, end_x, end_y);
    let critique_to_show = null; let all_targeted = true;
    for (const name in WAR_COMPONENTS) {
        const data = WAR_COMPONENTS[name]; let dist = p5.Vector.dist(smoothed_cursor_pos, createVector(data.pos[0], data.pos[1]));
        if (dist < 50) { data.targeted = true; critique_to_show = data.critique; }
        if (!data.targeted) all_targeted = false;
        stroke(data.targeted ? color(0, 255, 0) : color(0, 180, 0)); noFill(); strokeWeight(2); circle(data.pos[0], data.pos[1], 80);
        fill(data.targeted ? color(0, 255, 0) : color(0, 180, 0)); noStroke(); textAlign(CENTER, CENTER); textSize(14); text(name, data.pos[0], data.pos[1]);
    }
    if (critique_to_show) { fill(0, 255, 0); text(critique_to_show, 50, height - 220, width - 100, 200); }
    transition_node_5.rect = [50, height - 150, 300, 100];
    if (all_targeted) drawTransitionNode(transition_node_5, "POSTHUMAN");
}

function drawPosthuman(velocity) {
    background(0); fill(255); textAlign(LEFT, TOP); textSize(16);
    text(POSTHUMAN_CRITIQUE, 50, height - 220, width - 100, 200);
    fill(0, 0, 255); textSize(32); text("REAL-TIME SUBJECT ANALYSIS", 50, 50);
    fill(200); textSize(24); text(`VELOCITY (px/frame): ${velocity.toFixed(2)}`, 50, 100);
    let graph_x = 50, graph_y = 150, graph_w = width - 100, graph_h = 200;
    stroke(50); noFill(); rect(graph_x, graph_y, graph_w, graph_h); noFill(); stroke(0, 0, 255); strokeWeight(2);
    beginShape();
    for (let i = 0; i < velocity_history.length; i++) {
        let x = map(i, 0, velocity_history.length, graph_x, graph_x + graph_w);
        let y = map(constrain(velocity_history[i], 0, 50), 0, 50, graph_y + graph_h, graph_y); vertex(x, y);
    }
    endShape();
    transition_node_6.rect = [width/2 - 200, height - 150, 400, 100];
    drawTransitionNode(transition_node_6, "PHARMAKON");
}

function drawPharmakon(velocity) {
    for(let word of pharmakon_words) {
        word.pos.add(word.vel);
        if (word.pos.x < 0 || word.pos.x > width) word.vel.x *= -1;
        if (word.pos.y < 0 || word.pos.y > height) word.vel.y *= -1;
        let dist_to_cursor = p5.Vector.dist(word.pos, smoothed_cursor_pos);
        if (dist_to_cursor < 100) word.health = constrain(word.health + (velocity > 1 ? 0.05 : -0.05), 0, 1);
        else word.health = lerp(word.health, 0.5, 0.01);
        let word_color = lerpColor(color(255, 0, 0), color(0, 255, 255), word.health);
        let word_size = lerp(12, 24, word.health);
        fill(word_color);
        noStroke(); // *** FIX: Ensure no stroke is applied to words ***
        textSize(word_size); 
        textAlign(CENTER, CENTER); 
        text(word.text, word.pos.x, word.pos.y);
    }
    
    // *** FIX: Repositioned text box to be fully visible ***
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, TOP); // Align from the top for predictable positioning
    text(PHARMAKON_TEXT, width/2 - 450, height - 150, 900, 140);
    
    pharmakon_proceed_button.rect = [width - 350, 50, 300, 100];
    drawTransitionNode(pharmakon_proceed_button, "PROSTHETIC");
}

function drawProsthetic() {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(capture, 0, 0, width, height);
    pop();

    if (handLandmarks) {
        const flippedLandmarks = JSON.parse(JSON.stringify(handLandmarks));
        for (const landmark of flippedLandmarks) {
            landmark.x = 1 - landmark.x;
        }
        drawConnectors(canvas.drawingContext, flippedLandmarks, HAND_CONNECTIONS, {color: '#00FF64', lineWidth: 3});
        drawLandmarks(canvas.drawingContext, flippedLandmarks, {color: '#00FF64', fillColor: '#00FF64', radius: 6});
    }
    
    fill(0, 0, 0, 180);
    rect(0, height - 200, width, 200);
    fill(255);
    textSize(18);
    textAlign(CENTER, BOTTOM);
    text(PROSTHETICITY_TEXT, width/2 - 450, height - 50, 900, 150);
    
    prosthetic_proceed_button.rect = [50, 50, 300, 100];
    drawTransitionNode(prosthetic_proceed_button, "RELATIONAL");
}


function drawRelational() {
    stroke(100); strokeWeight(1);
    line(relational_nodes[0].pos.x, relational_nodes[0].pos.y, relational_nodes[1].pos.x, relational_nodes[1].pos.y);
    line(relational_nodes[0].pos.x, relational_nodes[0].pos.y, relational_nodes[2].pos.x, relational_nodes[2].pos.y);
    line(relational_nodes[1].pos.x, relational_nodes[1].pos.y, relational_nodes[3].pos.x, relational_nodes[3].pos.y);
    line(relational_nodes[2].pos.x, relational_nodes[2].pos.y, relational_nodes[3].pos.x, relational_nodes[3].pos.y);
    let marketNode = relational_nodes.find(n => n.isMarket);
    for (let consumed of marketNode.consumed) { stroke(marketNode.color); strokeWeight(2); line(marketNode.pos.x, marketNode.pos.y, consumed.pos.x, consumed.pos.y); }
    for (let node of relational_nodes) {
        if(smoothed_cursor_pos) {
            let force = p5.Vector.sub(smoothed_cursor_pos, node.pos);
            let dist = force.mag();
            force.normalize(); force.mult(50000 / (dist * dist + 1)); node.pos.add(force.mult(-0.1));
        }
        if (marketNode.isMarket) {
            for (let other of relational_nodes) {
                if (!other.isMarket && p5.Vector.dist(marketNode.pos, other.pos) < 50) { if (!marketNode.consumed.includes(other)) marketNode.consumed.push(other); }
            }
        }
        let node_color = marketNode.consumed.includes(node) ? color(100) : node.color;
        fill(node_color); noStroke(); circle(node.pos.x, node.pos.y, 60);
        fill(255); textSize(16); textAlign(CENTER, CENTER); text(node.label, node.pos.x, node.pos.y);
    }
    
    // *** FIX: Repositioned text box to be fully visible ***
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, TOP);
    text(RELATIONAL_TEXT, width/2 - 450, height - 120, 900, 110);
    
    relational_proceed_button.rect = [width/2 - 150, 50, 300, 100];
    drawTransitionNode(relational_proceed_button, "CREDITS");
}

function drawCredits() {
    background(10, 10, 20);
    let y = 100;
    let x = 100;
    let w = width - 2 * x;

    // Title
    fill(0, 255, 150);
    textSize(40); // Made title larger
    textAlign(LEFT, TOP);
    noStroke();
    text("PROJECT KAFKA", x, y); // Corrected title
    y += 90;

    // Producer/Designer
    fill(255);
    textSize(20);
    text("Designer: Mert Seven, PhD", x, y);
    y += 30;
    text("Contact: mert.seven@yahoo.com", x, y);
    y += 30;
    text("Web: mertseven.com", x, y);
    y += 60;

    // Project Aim
    fill(0, 255, 150);
    textSize(18);
    text("Project Aim", x, y);
    y += 30;
    fill(220);
    textSize(16);
    text("This project is an interactive essay that uses the very tools it critiques. It aims to explore the media philosophy of thinkers like Friedrich Kittler and Bernard Stiegler not through static text, but through direct, embodied interaction. By turning your hand into a data stream, it demonstrates concepts of the 'pharmakon' (technology as both poison and cure), technics as a human prosthesis, and the digital circuits that shape our perception and desire.", x, y, w, 200);
    y += 100;

    // Tools & Technologies
    fill(0, 255, 150);
    textSize(18);
    text("Tools & Technologies", x, y);
    y += 30;
    fill(220);
    textSize(16);
    text("Realized with: JavaScript, p5.js for creative coding and graphics, and Google's MediaPipe for real-time hand tracking.", x, y, w, 100);
    y += 80;

    // Intellectual Sources
    fill(0, 255, 150);
    textSize(18);
    text("Sources", x, y);
    y += 30;
    fill(220);
    textSize(16);
    text("Core concepts are drawn from the works of Friedrich Kittler (Discourse Networks 1800/1900), and Bernard Stiegler (Technics and Time, and Ars Industrialis works).", x, y, w, 150);
    y += 120;
    
    // Restart Button
    restart_button.rect = [width/2 - 150, height - 120, 300, 80];
    drawTransitionNode(restart_button, "INTRO");
}

// =========================================================================
//                                  HELPER FUNCTIONS
// =========================================================================

function onVideoReady() {
    console.log("Video is ready. Initializing MediaPipe Hands."); isVideoReady = true;
    hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
    hands.setOptions({maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5});
    hands.onResults(onHandResults);
    const videoElement = capture.elt;
    async function detectHands() { if (videoElement.readyState >= 3) { await hands.send({ image: videoElement }); } requestAnimationFrame(detectHands); }
    detectHands();
}

function onHandResults(results) { handLandmarks = results.multiHandLandmarks ? results.multiHandLandmarks[0] : null; }

function isThumbsUp(hand) { if (!hand) return false; return hand[4].y < hand[5].y && hand[4].y < hand[17].y; }

function checkHover(rect) {
    if (!smoothed_cursor_pos || !rect || rect.length !== 4) return false;
    return (smoothed_cursor_pos.x > rect[0] && smoothed_cursor_pos.x < rect[0] + rect[2] &&
            smoothed_cursor_pos.y > rect[1] && smoothed_cursor_pos.y < rect[1] + rect[3]);
}

function handleDwell(next_stage) {
    if (hover_start_time === 0) { hover_start_time = millis(); } 
    else if (millis() - hover_start_time > DWELL_TIME * 1000) {
        current_stage = next_stage; hover_start_time = 0;
        if(next_stage === 'WAR') { for (const name in WAR_COMPONENTS) { WAR_COMPONENTS[name].targeted = false; } }
        if (next_stage === 'INTRO') { intro_start_time = millis(); }
    }
}

function drawTransitionNode(node, next_stage) {
    let is_hovering = checkHover(node.rect);
    let color_val = is_hovering ? color(0, 255, 150) : color(255, 150, 0);
    stroke(color_val); strokeWeight(2); noFill(); rect(node.rect[0], node.rect[1], node.rect[2], node.rect[3]);
    noStroke(); fill(color_val); textAlign(CENTER, CENTER); textSize(20);
    text(node.text, node.rect[0] + node.rect[2]/2, node.rect[1] + node.rect[3]/2);
    if (is_hovering && next_stage) handleDwell(next_stage);
    else if (!is_hovering) hover_start_time = 0;
}

function drawCursor() {
    if (!smoothed_cursor_pos) return;
    noFill(); strokeWeight(2);
    if (current_stage === "CODE") {
        stroke(0, 200, 200); rectMode(CENTER); rect(smoothed_cursor_pos.x, smoothed_cursor_pos.y, 40, 40); rectMode(CORNER);
    } else if (current_stage === "HARDWARE") {
        noStroke(); for (let i = 0; i < 15; i++) { fill(255, 0, 0, 150); let x_off = random(-15, 15); let y_off = random(-15, 15); circle(smoothed_cursor_pos.x + x_off, smoothed_cursor_pos.y + y_off, random(2, 8)); }
    } else if (current_stage === "HISTORY") {
        stroke(0, 255, 255, 200); strokeWeight(3); line(smoothed_cursor_pos.x, 0, smoothed_cursor_pos.x, height);
    } else if (current_stage === "WAR") {
        stroke(0, 255, 0); strokeWeight(1); let size = 30; circle(smoothed_cursor_pos.x, smoothed_cursor_pos.y, size * 2);
        line(smoothed_cursor_pos.x - size, smoothed_cursor_pos.y, smoothed_cursor_pos.x + size, smoothed_cursor_pos.y);
        line(smoothed_cursor_pos.x, smoothed_cursor_pos.y - size, smoothed_cursor_pos.x, smoothed_cursor_pos.y + size);
    } else if (current_stage === "POSTHUMAN") { // *** FIX: Added cursor for this stage ***
        let size = 20;
        stroke(0, 0, 255);
        strokeWeight(1.5);
        line(smoothed_cursor_pos.x - size, smoothed_cursor_pos.y, smoothed_cursor_pos.x + size, smoothed_cursor_pos.y);
        line(smoothed_cursor_pos.x, smoothed_cursor_pos.y - size, smoothed_cursor_pos.x, smoothed_cursor_pos.y + size);
        noFill();
        circle(smoothed_cursor_pos.x, smoothed_cursor_pos.y, size/2);
    } else if (current_stage === "PHARMAKON" || current_stage === "RELATIONAL" || current_stage === "CREDITS") {
        stroke(255); strokeWeight(2); circle(smoothed_cursor_pos.x, smoothed_cursor_pos.y, 20);
    }
}