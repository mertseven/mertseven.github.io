// Initial data for frames with descriptions and links
const initialFrames = [
  {
    id: 1,
    name: "Journalism Studio Website",
    image: "visuals/jstudio.png",
    description: "A showcase platform featuring student journalism projects, latest trends in digital journalism, and feature-rich reporting techniques. Browse featured stories, archives, and resources for aspiring journalists exploring data-driven storytelling, investigative methods, and modern media distribution.",
    link: "https://mertseven.com/jstudio/index.html",
    defaultPos: { x: 0, y: 0, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 2,
    name: "Fortune Wheel",
    image: "visuals/fortune_wheel2.png",
    description: "Who will face the spotlight next? This devious classroom tool randomly selects victims—err, students—with dramatic spinning animations! Add names individually, dump in a whole class list, or upload files filled with unsuspecting participants. Watch as the wheel of fate decides who must answer your impossible questions. Perfect for creating classroom suspense and keeping students nervously alert! Resistance is futile—the wheel decides all!",
    link: "https://mertseven.com/wheel-html.html",
    defaultPos: { x: 4, y: 0, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 3,
    name: "Critical Theory Visualization",
    image: "visuals/tcs.png",
    description: "Unlock the forbidden knowledge of the Frankfurt School! Navigate this tangled web of revolutionary thinkers who dared to question everything. Warning: May cause existential crisis and uncontrollable urge to overthrow capitalism! Note: It's part of series called Teaching Can Something.",
    link: "https://mertseven.com/critical_theory/index.html",
    defaultPos: { x: 8, y: 0, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 4,
    name: "Digital Journalism Workflow",
    image: "visuals/dj_workflow.png",
    description: "Uncover the secrets journalists don't want you to know! Click mysterious circles to discover hidden tools and examples that will transform you from media consumer to digital content wizard. Journalism will never be the same!",
    link: "https://mertseven.com/digijournalism/index.html",
    defaultPos: { x: 0, y: 4, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 5,
    name: "Socrates' Quest for Knowledge",
    image: "visuals/athens.jpeg",
    description: "Do not miss this historical opportunity to challenge Socrates himself! Step into ancient Athens and match wits with philosophy's greatest gadfly. Will you outsmart the master or fall into his cunning logical traps? Only the truly wise dare enter!",
    link: "https://mertseven.com/socrates/socrates.html",
    defaultPos: { x: 4, y: 4, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 6,
    name: "Knowledge & Research",
    image: "visuals/know_res.png",
    description: "Think you know what knowledge is? Think again! Prepare to have your mind blown by ancient wisdom and modern brain-melting paradoxes. Side effects may include questioning everything you thought you knew!",
    link: "https://mertseven.com/know_res/index.html",
    defaultPos: { x: 8, y: 4, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 7,
    name: "X-Ray Viewer",
    image: "visuals/xray.png",
    description: "Hover over any element while X-Ray is active to inspect its structure. This tool reveals the underlying HTML architecture. Think of it as a transparent layer that lets you peek behind the curtain of web design.",
    link: "#",
    defaultPos: { x: 0, y: 8, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 8,
    name: "Form Builder",
    image: "visuals/jury_form.png",
    description: "Become the master of evaluation! Create your own jury forms with whatever wild criteria you dream up. Judge others with the power of custom scoring systems—who needs fairness when you have FORMS?",
    link: "https://mertseven.com/form-builder.html",
    defaultPos: { x: 4, y: 8, w: 4, h: 4 },
    mediaSize: 1,
    borderThickness: 0,
    borderSize: 0,
  },
  {
    id: 9,
    name: "Traditional and Digital Journalism",
    image: "visuals/dj_comparison.png",
    description: "Witness the epic battle: Old Media vs. New Media! Pick sides in this dramatic showdown between printing presses and algorithms. Contains shocking revelations about how news really gets made!",
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
let touchTimeout = null;
let isTouchDevice = false;
let activeDescriptionElement = null; // Track the currently active description

// Check if device supports touch
function checkTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
}

// Hide all description overlays
function hideAllDescriptions() {
  const overlays = document.querySelectorAll('.description-overlay');
  overlays.forEach(overlay => {
    overlay.classList.remove('visible');
  });
  activeDescriptionElement = null;
  setHovered(null);
}

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
  // Check if device supports touch
  isTouchDevice = checkTouchDevice();
  
  // Check if it's a mobile device for layout purposes
  const isMobileDevice = window.innerWidth <= 768;

  // Clear the grid
  gridContainer.innerHTML = "";

  // Set the gap size for desktop layout
  if (!isMobileDevice) {
    gridContainer.style.gap = `${gapSize}px`;
    gridContainer.style.display = "grid";
  } else {
    // Force block display for mobile
    gridContainer.style.display = "block";
  }

  // Add event listener to document to hide descriptions when clicking outside
  document.addEventListener('click', (e) => {
    // If click is outside any frame component, hide all descriptions
    if (!e.target.closest('.frame-component')) {
      hideAllDescriptions();
    }
  });

  // Create grid items
  frames.forEach((frame) => {
    const row = Math.floor(frame.defaultPos.y / 4);
    const col = Math.floor(frame.defaultPos.x / 4);

    // Create frame component
    const frameComponent = document.createElement("div");
    frameComponent.className = "frame-component";
    frameComponent.dataset.id = frame.id;
    
    // Only set row/col data attributes for desktop layout
    if (!isMobileDevice) {
      frameComponent.dataset.row = row;
      frameComponent.dataset.col = col;
      
      // Set transform origin
      const transformOrigin = getTransformOrigin(frame.defaultPos.x, frame.defaultPos.y);
      frameComponent.style.transformOrigin = transformOrigin;
    } else {
      // For mobile, ensure block display and full width
      frameComponent.style.display = "block";
      frameComponent.style.width = "100%";
      frameComponent.style.height = "250px";
      frameComponent.style.marginBottom = "20px";
    }

    // Create frame container
    const frameContainer = document.createElement("div");
    frameContainer.className = "frame-container";

    // Create image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";
    
    if (isMobileDevice) {
      // For mobile, ensure full dimensions
      imageContainer.style.position = "absolute";
      imageContainer.style.width = "100%";
      imageContainer.style.height = "100%";
    } else {
      imageContainer.style.padding = "0";
      imageContainer.style.width = "100%";
      imageContainer.style.height = "100%";
      imageContainer.style.left = "0";
      imageContainer.style.top = "0";
    }

    // Create image wrapper
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "image-wrapper";
    
    if (isMobileDevice) {
      // For mobile, ensure full dimensions
      imageWrapper.style.width = "100%";
      imageWrapper.style.height = "100%";
    } else {
      imageWrapper.style.transform = `scale(${frame.mediaSize})`;
    }

    // Create image element
    const image = document.createElement("img");
    image.className = "image";
    image.src = frame.image;
    image.alt = `Project image ${frame.id}`;
    
    if (isMobileDevice) {
      // For mobile, ensure image fills container
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";
    }

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
    
    // Create a title element for the description
    const titleElement = document.createElement("h3");
    titleElement.className = "description-title";
    titleElement.textContent = `${frame.name}`;
    
    // Create a short description paragraph
    const shortDesc = frame.description.split(' ').slice(0, 20).join(' ') + '...';
    const shortDescElement = document.createElement("p");
    shortDescElement.className = "description-short";
    shortDescElement.textContent = shortDesc;
    
    // Create a "Read More" button
    const readMoreBtn = document.createElement("button");
    readMoreBtn.className = "read-more-btn";
    readMoreBtn.textContent = "Read More";
    
    // Create a full description element (hidden by default)
    const fullDescElement = document.createElement("div");
    fullDescElement.className = "description-full";
    fullDescElement.innerHTML = `<p>${frame.description}</p>`;
    fullDescElement.style.display = "none";
    
    // Create a "Read Less" button (hidden by default)
    const readLessBtn = document.createElement("button");
    readLessBtn.className = "read-less-btn";
    readLessBtn.textContent = "Read Less";
    readLessBtn.style.display = "none";
    
    // Add event listener to "Read More" button
    readMoreBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent navigation
      e.preventDefault(); // Prevent default behavior for touch events
      shortDescElement.style.display = "none";
      readMoreBtn.style.display = "none";
      fullDescElement.style.display = "block";
      readLessBtn.style.display = "block";
    });
    
    // Add event listener to "Read Less" button
    readLessBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent navigation
      e.preventDefault(); // Prevent default behavior for touch events
      shortDescElement.style.display = "block";
      readMoreBtn.style.display = "block";
      fullDescElement.style.display = "none";
      readLessBtn.style.display = "none";
    });
    
    // Append elements to description overlay
    descriptionOverlay.appendChild(titleElement);
    descriptionOverlay.appendChild(shortDescElement);
    descriptionOverlay.appendChild(readMoreBtn);
    descriptionOverlay.appendChild(fullDescElement);
    descriptionOverlay.appendChild(readLessBtn);

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

    // Add cursor style to indicate it's clickable
    frameComponent.style.cursor = "pointer";

    // Add touch-specific event handlers for mobile
    if (isTouchDevice) {
      // For touch devices, show description on first tap, navigate on second tap
      let tapped = false;
      let lastTap = 0;
      const doubleTapDelay = 300; // milliseconds
      
      frameComponent.addEventListener("touchstart", (e) => {
        // If the touch is on a button, let the button's event handler deal with it
        if (e.target.tagName === 'BUTTON') {
          return;
        }
        
        // Hide any previously visible descriptions
        if (activeDescriptionElement && activeDescriptionElement !== descriptionOverlay) {
          activeDescriptionElement.classList.remove('visible');
          // Reset the read more/less state for the previous description
          const prevShortDesc = activeDescriptionElement.querySelector('.description-short');
          const prevReadMoreBtn = activeDescriptionElement.querySelector('.read-more-btn');
          const prevFullDesc = activeDescriptionElement.querySelector('.description-full');
          const prevReadLessBtn = activeDescriptionElement.querySelector('.read-less-btn');
          
          if (prevShortDesc && prevReadMoreBtn && prevFullDesc && prevReadLessBtn) {
            prevShortDesc.style.display = "block";
            prevReadMoreBtn.style.display = "block";
            prevFullDesc.style.display = "none";
            prevReadLessBtn.style.display = "none";
          }
        }
        
        // Show description overlay on touch
        if (!isMobileDevice) {
          setHovered({ row, col });
        }
        descriptionOverlay.classList.add('visible');
        activeDescriptionElement = descriptionOverlay;
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < doubleTapDelay && tapLength > 0) {
          // Double tap detected - navigate to the link
          window.location.href = frame.link;
          e.preventDefault();
        } else {
          // First tap - just show the description
          tapped = true;
          lastTap = currentTime;
          
          // Clear any existing timeout
          if (touchTimeout) {
            clearTimeout(touchTimeout);
          }
          
          // Set a timeout to reset the tap state
          touchTimeout = setTimeout(() => {
            tapped = false;
          }, doubleTapDelay);
        }
      });
      
      // Prevent immediate navigation on touchend
      frameComponent.addEventListener("touchend", (e) => {
        // Don't prevent default for button elements
        if (e.target.tagName !== 'BUTTON') {
          e.preventDefault();
        }
      });
      
      // Add a separate click handler for navigation that works with a delay
      frameComponent.addEventListener("click", (e) => {
        // If the click is on a button, don't navigate
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          e.stopPropagation();
          return;
        }
        
        // Only navigate if it's not a recent touch event (handled by touchstart)
        if (!tapped) {
          window.location.href = frame.link;
        }
      });
    } else {
      // For non-touch devices, use the original behavior
      frameComponent.addEventListener("click", (e) => {
        // If the click is on a button, don't navigate
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          e.stopPropagation();
          return;
        }
        window.location.href = frame.link;
      });
      
      // Add event listeners for hover
      frameComponent.addEventListener("mouseenter", () => {
        // Hide any previously visible descriptions
        if (activeDescriptionElement && activeDescriptionElement !== descriptionOverlay) {
          activeDescriptionElement.classList.remove('visible');
        }
        
        setHovered({ row, col });
        // Show description overlay
        descriptionOverlay.classList.add('visible');
        activeDescriptionElement = descriptionOverlay;
      });

      frameComponent.addEventListener("mouseleave", () => {
        setHovered(null);
        // Hide description overlay
        descriptionOverlay.classList.remove('visible');
        activeDescriptionElement = null;
      });
    }

    // Add the frame component to the grid container
    gridContainer.appendChild(frameComponent);
  });

  // Initial grid template - only for desktop
  if (!isMobileDevice) {
    updateGridTemplate();
  }
}

// Initialize the grid when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeGrid);

// Add window resize handler to adjust layout
window.addEventListener('resize', () => {
  // Reinitialize grid on resize to handle layout changes
  initializeGrid();
});

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
