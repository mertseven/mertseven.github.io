// Initial data for frames with descriptions and links
const initialFrames = [
  {
    id: 1,
    image: "visuals/jstudio.png",
    description: "Journalism Studio Website - A showcase platform featuring student journalism projects, latest trends in digital journalism, and feature-rich reporting techniques. Browse featured stories, archives, and resources for aspiring journalists exploring data-driven storytelling, investigative methods, and modern media distribution.",
    link: "https://mertseven.com/jstudio/index.html",
    defaultPos: { x: 0, y: 0, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 2,
    image: "visuals/fortune_wheel2.png",
    description: "Fortune Wheel - Who will face the spotlight next? This devious classroom tool randomly selects victims—err, students—with dramatic spinning animations! Add names individually, dump in a whole class list, or upload files filled with unsuspecting participants. Watch as the wheel of fate decides who must answer your impossible questions. Perfect for creating classroom suspense and keeping students nervously alert! Resistance is futile—the wheel decides all!",
    link: "https://mertseven.com/wheel-html.html",
    defaultPos: { x: 4, y: 0, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 3,
    image: "visuals/tcs.png",
    description: "Critical Theory Visualization - Unlock the forbidden knowledge of the Frankfurt School! Navigate this tangled web of revolutionary thinkers who dared to question everything. Warning: May cause existential crisis and uncontrollable urge to overthrow capitalism! Note: It's part of series called Teaching Can Something.",
    link: "https://mertseven.com/critical_theory/index.html",
    defaultPos: { x: 8, y: 0, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 4,
    image: "visuals/dj_workflow.png",
    description: "Digital Journalism Workflow - Uncover the secrets journalists don't want you to know! Click mysterious circles to discover hidden tools and examples that will transform you from media consumer to digital content wizard. Journalism will never be the same!",
    link: "https://mertseven.com/digijournalism/index.html",
    defaultPos: { x: 0, y: 4, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 5,
    image: "visuals/athens.jpeg",
    description: "Socrates' Quest for Knowledge - Do not miss this historical opportunity to challenge Socrates himself! Step into ancient Athens and match wits with philosophy's greatest gadfly. Will you outsmart the master or fall into his cunning logical traps? Only the truly wise dare enter!",
    link: "https://mertseven.com/socrates/socrates.html",
    defaultPos: { x: 4, y: 4, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 6,
    image: "visuals/know_res.png",
    description: "Knowledge & Research - Think you know what knowledge is? Think again! Prepare to have your mind blown by ancient wisdom and modern brain-melting paradoxes. Side effects may include questioning everything you thought you knew!",
    link: "https://mertseven.com/know_res/index.html",
    defaultPos: { x: 8, y: 4, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 7,
    image: "visuals/xray.png",
    description: "X-Ray Viewer - Hover over any element while X-Ray is active to inspect its structure. This tool reveals the underlying HTML architecture. Think of it as a transparent layer that lets you peek behind the curtain of web design.",
    link: "#",
    defaultPos: { x: 0, y: 8, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 8,
    image: "visuals/jury_form.png",
    description: "Form Builder - Become the master of evaluation! Create your own jury forms with whatever wild criteria you dream up. Judge others with the power of custom scoring systems—who needs fairness when you have FORMS?",
    link: "https://mertseven.com/form-builder.html",
    defaultPos: { x: 4, y: 8, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 9,
    image: "visuals/dj_comparison.png",
    description: "Traditional and Digital Journalism - Witness the epic battle: Old Media vs. New Media! Pick sides in this dramatic showdown between printing presses and algorithms. Contains shocking revelations about how news really gets made!",
    link: "https://mertseven.com/digijournalism/journalism-lifecycle.html",
    defaultPos: { x: 8, y: 8, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
];

// DOM elements
const gridContainer = document.getElementById("grid-container");

// State variables
let frames = [...initialFrames];
let hovered = null;
const hoverSize = 6;
const gapSize = 4;

// Get transform origin based on position
function getTransformOrigin(x, y) {
  const vertical = y === 0 ? "top" : y === 4 ? "center" : "bottom";
  const horizontal = x === 0 ? "left" : x === 4 ? "center" : "right";
  return `${horizontal} ${vertical}`;
}

// Set hovered state
function setHovered(hoveredState) {
  hovered = hoveredState;
  updateGridTemplate();
}

// Update grid template based on hovered state
function updateGridTemplate() {
  const rowSizes = getRowSizes();
  const colSizes = getColSizes();

  gridContainer.style.gridTemplateRows = rowSizes;
  gridContainer.style.gridTemplateColumns = colSizes;
}

// Get row sizes based on hovered state
function getRowSizes() {
  if (hovered === null) {
    return "1fr 1fr 1fr";
  }

  const { row } = hovered;
  const nonHoveredSize = (12 - hoverSize) / 2;

  return [0, 1, 2].map((r) => (r === row ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ");
}

// Get column sizes based on hovered state
function getColSizes() {
  if (hovered === null) {
    return "1fr 1fr 1fr";
  }

  const { col } = hovered;
  const nonHoveredSize = (12 - hoverSize) / 2;

  return [0, 1, 2].map((c) => (c === col ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ");
}

// Initialize the grid
function initializeGrid() {
  // Clear the grid
  gridContainer.innerHTML = "";

  // Set the gap size
  gridContainer.style.gap = `${gapSize}px`;

  // Create grid items
  frames.forEach((frame) => {
    const row = Math.floor(frame.defaultPos.y / 4);
    const col = Math.floor(frame.defaultPos.x / 4);

    // Create frame component
    const frameComponent = document.createElement("div");
    frameComponent.className = "frame-component";
    frameComponent.dataset.id = frame.id;
    frameComponent.dataset.row = row;
    frameComponent.dataset.col = col;

    // Set transform origin
    const transformOrigin = getTransformOrigin(frame.defaultPos.x, frame.defaultPos.y);
    frameComponent.style.transformOrigin = transformOrigin;

    // Create frame container
    const frameContainer = document.createElement("div");
    frameContainer.className = "frame-container";

    // Create image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";
    imageContainer.style.padding = "0";
    imageContainer.style.width = "100%";
    imageContainer.style.height = "100%";
    imageContainer.style.left = "0";
    imageContainer.style.top = "0";

    // Create image wrapper
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";
    imageWrapper.style.transform = `scale(${frame.mediaSize})`;

    // Create image element
    const image = document.createElement("img");
    image.className = "image";
    image.src = frame.image;
    image.alt = `Project image ${frame.id}`;

    // Add error handling for images
    image.onerror = function () {
      console.error(`Failed to load image: ${frame.image}`);
      // Create a placeholder div instead of the image
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = "Image not found";
      
      // Replace the image with the placeholder
      this.parentNode.replaceChild(placeholder, this);
    };

    // Create description overlay
    const descriptionOverlay = document.createElement("div");
    descriptionOverlay.className = "description-overlay";
    descriptionOverlay.innerHTML = `<p>${frame.description}</p>`;

    // Append image to wrapper
    imageWrapper.appendChild(image);

    // Append wrapper to container
    imageContainer.appendChild(imageWrapper);

    // Append description overlay to container
    imageContainer.appendChild(descriptionOverlay);

    // Append image container to frame container
    frameContainer.appendChild(imageContainer);

    // Append frame container to frame component
    frameComponent.appendChild(frameContainer);

    // Make the entire frame clickable
    frameComponent.addEventListener("click", () => {
      window.location.href = frame.link;
    });

    // Add cursor style to indicate it's clickable
    frameComponent.style.cursor = "pointer";

    // Add event listeners for hover
    frameComponent.addEventListener("mouseenter", () => {
      setHovered({ row, col });
      // Show description overlay
      descriptionOverlay.classList.add("visible");
    });

    frameComponent.addEventListener("mouseleave", () => {
      setHovered(null);
      // Hide description overlay
      descriptionOverlay.classList.remove("visible");
    });

    // Append frame component to grid container
    gridContainer.appendChild(frameComponent);
  });

  // Update grid template
  updateGridTemplate();
}

// Check if terminal emulator exists and extend its commands
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing projects grid...");
  initializeGrid();
  
  // Add terminal command for projects if terminal exists
  if (typeof TerminalEmulator !== 'undefined') {
    TerminalEmulator.prototype.commands.projects = function() {
      this.addToTerminal('Available projects:');
      frames.forEach(frame => {
        this.addToTerminal(`- ${frame.id}: ${frame.description.substring(0, 60)}...`);
      });
    };
  }
});