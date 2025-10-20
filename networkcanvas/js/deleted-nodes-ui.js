// js/deleted-nodes-ui.js

import * as state from './state.js';

// Lazy-load the container to avoid any initialization order issues.
let deletedNodesContainer = null;
function getContainer() {
    if (!deletedNodesContainer) {
        deletedNodesContainer = document.getElementById('deleted-nodes-pills-container');
    }
    return deletedNodesContainer;
}

function restoreNode(nodeId) {
    const appState = state.get();
    if (appState.deletedNodeIds.has(nodeId)) {
        appState.deletedNodeIds.delete(nodeId);
        // Instead of importing and calling, dispatch an event that app.js will listen for.
        window.dispatchEvent(new CustomEvent('request-redraw'));
    }
}

export function renderDeletedNodesPills() {
    const container = getContainer();
    if (!container) {
        console.error("Could not find #deleted-nodes-pills-container");
        return;
    }

    const { deletedNodeIds, masterSociogramData } = state.get();
    
    container.innerHTML = '';

    if (!deletedNodeIds || deletedNodeIds.size === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';

    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.marginBottom = '5px';

    const title = document.createElement('h5');
    title.textContent = 'Hidden Nodes';
    title.style.margin = '0';
    title.style.padding = '0 5px';
    title.style.color = 'var(--text-color-secondary)';
    headerContainer.appendChild(title);

    const restoreAllBtn = document.createElement('button');
    restoreAllBtn.textContent = 'Restore All';
    restoreAllBtn.classList.add('small');
    restoreAllBtn.style.marginLeft = 'auto';
    restoreAllBtn.addEventListener('click', () => {
        const appState = state.get();
        appState.deletedNodeIds.clear();
        window.dispatchEvent(new CustomEvent('request-redraw'));
    });
    headerContainer.appendChild(restoreAllBtn);

    container.appendChild(headerContainer);

    deletedNodeIds.forEach(nodeId => {
        const node = masterSociogramData.nodes.find(n => n.id === nodeId);
        if (node) {
            const pill = document.createElement('div');
            pill.classList.add('deleted-node-pill');
            pill.title = 'Click to restore this node';
            
            const icon = document.createElement('span');
            icon.classList.add('restore-icon');
            icon.innerHTML = '+';
            
            const label = document.createElement('span');
            label.textContent = node.label || node.id;

            pill.appendChild(icon);
            pill.appendChild(label);

            pill.addEventListener('click', () => restoreNode(nodeId));
            container.appendChild(pill);
        }
    });
}

export function initializeDeletedNodesUI() {
    renderDeletedNodesPills();
    window.addEventListener('app-data-reprocessed', renderDeletedNodesPills);
}