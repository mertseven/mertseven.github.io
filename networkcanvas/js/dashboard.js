// js/dashboard.js

import { get as getState } from './state.js';
import jsnx from 'https://esm.sh/jsnetworkx@0.3.4';

// Helper function to create a consistent widget structure
function createWidget(title, content) {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.innerHTML = `<h3>${title}</h3><div class="widget-content">${content}</div>`;
    return card;
}

// Main function to update the dashboard
export function updateDashboard() {
    const { activeSociogramData, jsnxGraph } = getState();
    const { nodes, links } = activeSociogramData;
    const grid = document.getElementById('dashboard-grid');

    if (!nodes || nodes.length === 0) {
        grid.innerHTML = '<p class="hint">No data to display. Please run an analysis on the \'Data\' tab first.</p>';
        return;
    }

    grid.innerHTML = ''; // Clear previous widgets

    // --- 1. Cohesion & Stats Widget ---
    const density = jsnxGraph ? jsnx.density(jsnxGraph) : 0;

    const statsContent = `
        <div class="stat-item"><strong>Network Density:</strong> <span class="stat-value">${density.toFixed(3)}</span></div>
        <div class="stat-item"><strong>Nodes:</strong> <span class="stat-value">${nodes.length}</span></div>
        <div class="stat-item"><strong>Links:</strong> <span class="stat-value">${links.length}</span></div>
    `;
    grid.appendChild(createWidget('At a Glance', statsContent));

    // --- 2. Key Players Widget ---
    const sortedByBetweenness = [...nodes].sort((a, b) => (b.betweenness || 0) - (a.betweenness || 0));
    const sortedByEigenvector = [...nodes].sort((a, b) => (b.eigenvector || 0) - (a.eigenvector || 0));

    const keyPlayersContent = `
        <div class="player-list">
            <strong>Top Connectors (Betweenness):</strong>
            <ol>
                ${sortedByBetweenness.slice(0, 3).map(n => `<li>${n.label || n.id}</li>`).join('')}
            </ol>
        </div>
        <div class="player-list">
            <strong>Top Influencers (Eigenvector):</strong>
            <ol>
                ${sortedByEigenvector.slice(0, 3).map(n => `<li>${n.label || n.id}</li>`).join('')}
            </ol>
        </div>
    `;
    grid.appendChild(createWidget('Key Players', keyPlayersContent));

    // --- 3. At-Risk Individuals Widget ---
    const isolates = nodes.filter(n => n.totalDegree === 0);
    const rejected = nodes.filter(n => n.status === 'Rejected');

    const atRiskContent = `
         <div class="player-list">
            <strong>Isolates (${isolates.length}):</strong>
            <ul>
                ${isolates.slice(0, 5).map(n => `<li>${n.label || n.id}</li>`).join('')}
                 ${isolates.length > 5 ? '<li>...' : ''}
            </ul>
        </div>
        <div class="player-list">
            <strong>Rejected (${rejected.length}):</strong>
            <ul>
                ${rejected.slice(0, 5).map(n => `<li>${n.label || n.id}</li>`).join('')}
                 ${rejected.length > 5 ? '<li>...' : ''}
            </ul>
        </div>
    `;
    grid.appendChild(createWidget('At-Risk Individuals', atRiskContent));

    // --- 4. Community Distribution Widget ---
    const communityCounts = nodes.reduce((acc, node) => {
        if (node.communityId !== undefined) {
            acc[node.communityId] = (acc[node.communityId] || 0) + 1;
        }
        return acc;
    }, {});
    const sortedCommunities = Object.entries(communityCounts).sort((a, b) => b[1] - a[1]);

    const communityContent = `
        <div class="community-list">
            ${sortedCommunities.map(([id, count]) => `
                <div class="community-item">
                    <span>Community ${parseInt(id) + 1}</span>
                    <span class="community-bar" style="width: ${(count / nodes.length) * 100}%;">${count}</span>
                </div>
            `).join('')}
        </div>
    `;
    grid.appendChild(createWidget('Community Distribution', communityContent));
}