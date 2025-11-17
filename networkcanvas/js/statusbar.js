// js/statusbar.js

const statusMessageEl = document.getElementById("status-message");
const nodeCountEl = document.getElementById("status-node-count");
const linkCountEl = document.getElementById("status-link-count");

export function updateStatus(message) {
  if (statusMessageEl) {
    statusMessageEl.textContent = message;
  }
}

export function updateNodeCount(count) {
  if (nodeCountEl) {
    nodeCountEl.textContent = `Nodes: ${count}`;
  }
}

export function updateLinkCount(count) {
  if (linkCountEl) {
    linkCountEl.textContent = `Links: ${count}`;
  }
}

export function resetStatus() {
  updateStatus("Ready");
  updateNodeCount(0);
  updateLinkCount(0);
}

export function updateVersion(version) {
  const versionEl = document.getElementById("status-version");
  if (versionEl) {
    versionEl.textContent = `v${version}`;
  }
}
