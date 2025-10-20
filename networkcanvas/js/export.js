// js/export.js

import * as state from './state.js';
import { showNotification } from './notifications.js';

/**
 * Converts a 2D array of data into a CSV-formatted string.
 * @param {string[][]} data - The 2D array (e.g., [['h1', 'h2'], ['d1', 'd2']]).
 * @returns {string} The CSV content.
 */
function arrayToCsv(data) {
    return data.map(row => 
        row.map(cell => {
            const str = String(cell === null || cell === undefined ? '' : cell);
            // Handle commas, double quotes, and newlines
            if (str.includes('"') || str.includes(',') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',')
    ).join('\n');
}

/**
 * Triggers a browser download for the given content.
 * @param {string} content - The content to download.
 * @param {string} fileName - The name of the file.
 * @param {string} mimeType - The MIME type of the file.
 */
function triggerDownload(content, fileName, mimeType = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exports the data from a given HTML table to a CSV file.
 * @param {string} tableId - The ID of the HTML table to export.
 * @param {string} fileName - The desired name for the downloaded CSV file.
 */
export function exportTableToCsv(tableId, fileName) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error(`Table with id "${tableId}" not found.`);
        showNotification('Error: Could not find table to export.', 'error');
        return;
    }

    const data = [];

    // Get headers
    const headers = [...table.querySelectorAll('thead th')].map(th => th.innerText.trim());
    data.push(headers);

    // Get rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [...row.querySelectorAll('td')].map(td => td.innerText.trim());
        data.push(rowData);
    });

    if (data.length <= 1) {
        showNotification('There is no data to export.', 'info');
        return;
    }

    const csvContent = arrayToCsv(data);
    triggerDownload(csvContent, fileName);
}

/**
 * Exports the raw data used for the Group Analysis comparison to a CSV file.
 * @param {string} fileName - The desired name for the downloaded CSV file.
 */
export function exportGroupAnalysisToCsv(fileName) {
    const appState = state.get();
    const groupByKey = document.getElementById('group-by-select').value;
    const metricKey = document.getElementById('compare-metric-select').value;

    if (!groupByKey || !metricKey) {
        showNotification("Cannot export data: Please select a grouping variable and a metric first.", 'error');
        return;
    }

    const nodes = appState.masterSociogramData.nodes;
    if (!nodes || nodes.length === 0) {
        alert("There is no data to export.");
        return;
    }

    const data = [];
    // Add headers
    const headers = ['Code', 'Name', groupByKey, metricKey];
    data.push(headers);

    // Add rows
    nodes.forEach(node => {
        const group = node.demographics[groupByKey] || 'Uncategorized';
        const metric = node[metricKey];
        const rowData = [node.id, node.label, group, metric];
        data.push(rowData);
    });

    if (data.length <= 1) {
        showNotification('There is no data to export.', 'info');
        return;
    }

    const csvContent = arrayToCsv(data);
    triggerDownload(csvContent, fileName);
}

/**
 * Exports the Group Analysis results dashboard as a PNG image.
 * @param {string} fileName - The desired name for the downloaded PNG file.
 */
export function exportAnalysisToPng(fileName) {
    const dashboard = document.getElementById('analysis-results-dashboard');
    if (!dashboard || dashboard.style.display === 'none') {
        showNotification("There are no analysis results to export.", 'info');
        return;
    }

    // Temporarily set background to white for the screenshot
    const originalBackgroundColor = dashboard.style.backgroundColor;
    dashboard.style.backgroundColor = 'white';

    html2canvas(dashboard, {
        scale: 2, // Higher scale for better resolution
        useCORS: true // To handle any cross-origin images if they were present
    }).then(canvas => {
        // Restore original background color
        dashboard.style.backgroundColor = originalBackgroundColor;

        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();

    }).catch(err => {
        // Restore original background color in case of error
        dashboard.style.backgroundColor = originalBackgroundColor;
        console.error("Error exporting analysis to PNG:", err);
        showNotification("An error occurred while exporting the image.", 'error');
    });
}

