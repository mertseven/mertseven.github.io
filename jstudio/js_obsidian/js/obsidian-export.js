document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();
  
  // Add sidebar toggle buttons
  addSidebarToggles();
  
  // Generate table of contents
  generateTableOfContents();
  
  // Mark active navigation item
  markActiveNavItem();
  
  // Handle responsive behavior
  handleResponsive();
  
  // Initialize heading collapsing
  initHeadingCollapse();
});

function initTheme() {
  // Get theme from localStorage or use system preference
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply theme
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme === 'light');
  
  // Add theme toggle if not present
  if (!document.querySelector('.theme-toggle')) {
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    toggle.style.position = 'fixed';
    toggle.style.top = '10px';
    toggle.style.right = '10px';
    toggle.style.zIndex = '100';
    toggle.style.background = 'transparent';
    toggle.style.border = 'none';
    toggle.style.fontSize = '1.5em';
    toggle.style.cursor = 'pointer';
    
    toggle.addEventListener('click', () => {
      const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.body.classList.toggle('theme-dark', newTheme === 'dark');
      document.body.classList.toggle('theme-light', newTheme === 'light');
      
      localStorage.setItem('theme', newTheme);
      toggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    document.body.appendChild(toggle);
  }
}

function addSidebarToggles() {
  const leftSidebar = document.querySelector('.sidebar-left');
  const rightSidebar = document.querySelector('.sidebar-right');
  
  if (leftSidebar && !leftSidebar.querySelector('.sidebar-toggle')) {
    const leftToggle = document.createElement('button');
    leftToggle.className = 'sidebar-toggle left-sidebar-toggle';
    leftToggle.innerHTML = '◀';
    leftToggle.setAttribute('aria-label', 'Toggle left sidebar');
    
    leftToggle.addEventListener('click', () => {
      leftSidebar.classList.toggle('is-collapsed');
      leftToggle.innerHTML = leftSidebar.classList.contains('is-collapsed') ? '▶' : '◀';
    });
    
    leftSidebar.appendChild(leftToggle);
  }
  
  if (rightSidebar && !rightSidebar.querySelector('.sidebar-toggle')) {
    const rightToggle = document.createElement('button');
    rightToggle.className = 'sidebar-toggle right-sidebar-toggle';
    rightToggle.innerHTML = '▶';
    rightToggle.setAttribute('aria-label', 'Toggle right sidebar');
    
    rightToggle.addEventListener('click', () => {
      rightSidebar.classList.toggle('is-collapsed');
      rightToggle.innerHTML = rightSidebar.classList.contains('is-collapsed') ? '◀' : '▶';
    });
    
    rightSidebar.appendChild(rightToggle);
  }
}

function generateTableOfContents() {
  const tocContainer = document.querySelector('.outline-tree');
  const contentContainer = document.querySelector('.markdown-preview-view');
  
  if (tocContainer && contentContainer) {
    const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length > 0) {
      let tocHTML = '<div class="tree-header"><span class="sidebar-section-header">Table of Contents</span></div><div class="tree-scroll-area">';
      
      headings.forEach(heading => {
        // Ensure headings have IDs
        if (!heading.id) {
          heading.id = heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
        
        const level = parseInt(heading.tagName.charAt(1));
        const indent = (level - 1) * 12;
        
        tocHTML += `
          <div class="tree-item" style="padding-left: ${indent}px">
            <a class="tree-link" href="#${heading.id}">
              <div class="tree-item-contents">
                <span class="tree-item-title">${heading.textContent}</span>
              </div>
            </a>
          </div>
        `;
      });
      
      tocHTML += '</div>';
      tocContainer.innerHTML = tocHTML;
    }
  }
}

function markActiveNavItem() {
  // Get current page path
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop();
  
  // Find and mark active nav item
  const navLinks = document.querySelectorAll('.file-tree .tree-link');
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === filename || linkPath === currentPath) {
      link.classList.add('active');
    }
  });
}

function handleResponsive() {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  function handleResize(e) {
    const sidebars = document.querySelectorAll('.sidebar');
    
    if (e.matches) {
      // On mobile/tablet, collapse all sidebars initially
      sidebars.forEach(sidebar => {
        if (!sidebar.classList.contains('is-collapsed')) {
          sidebar.classList.add('is-collapsed');
          const toggle = sidebar.querySelector('.sidebar-toggle');
          if (toggle) {
            toggle.innerHTML = sidebar.classList.contains('sidebar-left') ? '▶' : '◀';
          }
        }
      });
    } else {
      // On desktop, expand left sidebar
      const leftSidebar = document.querySelector('.sidebar-left');
      if (leftSidebar && leftSidebar.classList.contains('is-collapsed')) {
        leftSidebar.classList.remove('is-collapsed');
        const toggle = leftSidebar.querySelector('.sidebar-toggle');
        if (toggle) {
          toggle.innerHTML = '◀';
        }
      }
    }
  }
  
  mediaQuery.addEventListener('change', handleResize);
  handleResize(mediaQuery);
}

function initHeadingCollapse() {
  // Add collapse functionality to headings with .heading-collapse-indicator
  const collapseIndicators = document.querySelectorAll('.heading-collapse-indicator');
  
  collapseIndicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const heading = indicator.closest('.heading');
      const wrapper = heading?.closest('.heading-wrapper');
      
      if (wrapper) {
        wrapper.classList.toggle('is-collapsed');
      }
    });
  });
}

// Utility for smooth scrolling to anchors
document.addEventListener('click', (e) => {
  const target = e.target.closest('a[href^="#"]');
  if (target) {
    e.preventDefault();
    const id = target.getAttribute('href').slice(1);
    const element = document.getElementById(id);
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

function addSidebarToggles() {
  const leftSidebar = document.querySelector('.sidebar-left');
  const rightSidebar = document.querySelector('.sidebar-right');
  
  // For left sidebar
  if (leftSidebar) {
    // Remove existing toggle if present
    const existingLeftToggle = document.querySelector('.left-sidebar-toggle');
    if (existingLeftToggle) {
      existingLeftToggle.remove();
    }
    
    // Create new toggle
    const leftToggle = document.createElement('button');
    leftToggle.className = 'sidebar-toggle left-sidebar-toggle';
    leftToggle.innerHTML = leftSidebar.classList.contains('is-collapsed') ? '▶' : '◀';
    leftToggle.setAttribute('aria-label', 'Toggle left sidebar');
    
    leftToggle.addEventListener('click', () => {
      leftSidebar.classList.toggle('is-collapsed');
      leftToggle.innerHTML = leftSidebar.classList.contains('is-collapsed') ? '▶' : '◀';
    });
    
    // Add to document instead of inside sidebar
    document.body.appendChild(leftToggle);
  }
  
  // For right sidebar
  if (rightSidebar) {
    // Remove existing toggle if present
    const existingRightToggle = document.querySelector('.right-sidebar-toggle');
    if (existingRightToggle) {
      existingRightToggle.remove();
    }
    
    // Create new toggle
    const rightToggle = document.createElement('button');
    rightToggle.className = 'sidebar-toggle right-sidebar-toggle';
    rightToggle.innerHTML = rightSidebar.classList.contains('is-collapsed') ? '◀' : '▶';
    rightToggle.setAttribute('aria-label', 'Toggle right sidebar');
    
    rightToggle.addEventListener('click', () => {
      rightSidebar.classList.toggle('is-collapsed');
      rightToggle.innerHTML = rightSidebar.classList.contains('is-collapsed') ? '◀' : '▶';
    });
    
    // Add to document instead of inside sidebar
    document.body.appendChild(rightToggle);
  }
}