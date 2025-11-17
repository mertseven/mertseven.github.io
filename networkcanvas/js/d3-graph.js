// js/d3-graph.js

import { get as getState, set as setState } from "./state.js";
import { updateLegendAndExplanation } from "./ui-updates.js";
import { getActiveFilters } from "./filters.js";
import { DEFAULT_SETTINGS } from "./constants.js";
import { updateNodeCount, updateLinkCount } from "./statusbar.js";
import { showNotification } from "./notifications.js";

const nodeLabelSelect = document.getElementById("node-label-select");
const nodeLabelSizeInput = document.getElementById("node-label-size");
const linkDistanceInput = document.getElementById("link-distance");
const chargeStrengthInput = document.getElementById("charge-strength");
const collideRadiusFactorInput = document.getElementById(
  "collide-radius-factor",
);
const showPositiveLinksCheckbox = document.getElementById(
  "show-positive-links",
);
const showNegativeLinksCheckbox = document.getElementById(
  "show-negative-links",
);
const minPrefsFilterInput = document.getElementById("min-prefs-filter");
const clearHighlightBtn = document.getElementById("clear-highlight-btn");
const exitEgoViewBtn = document.getElementById("exit-ego-view-btn");
const nodeColorModeSelect = document.getElementById("node-color-mode");

function getNodeColor(node, mode) {
  const appState = getState();

  if (mode.startsWith("demographic_")) {
    const key = mode.replace("demographic_", "");
    const value = node.demographics[key] || "N/A";

    if (!appState.nodeColorScales[key]) {
      const allValues = [
        ...new Set(
          appState.masterSociogramData.nodes.map(
            (n) => n.demographics[key] || "N/A",
          ),
        ),
      ];
      appState.nodeColorScales[key] = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(allValues);
    }
    return appState.nodeColorScales[key](value);
  }

  switch (mode) {
    case "status":
      return `var(--status-${node.status ? node.status.toLowerCase() : "average"})`;
    case "community":
      if (typeof node.communityId === "undefined") {
        return "var(--accent-primary)";
      }
      if (!appState.nodeColorScales.community) {
        const allCommunityIds = [
          ...new Set(
            appState.masterSociogramData.nodes
              .map((n) => n.communityId)
              .filter((id) => typeof id !== "undefined"),
          ),
        ];
        appState.nodeColorScales.community = d3
          .scaleOrdinal(d3.schemeCategory10)
          .domain(allCommunityIds);
      }
      return appState.nodeColorScales.community(node.communityId);
    case "preferencesReceived":
      if (!appState.masterSociogramData.nodes.length)
        return "var(--accent-primary)";
      if (
        !appState.nodeColorScales.preferencesReceived ||
        appState.nodeColorScales.preferencesReceivedExtent !==
          d3
            .extent(
              appState.masterSociogramData.nodes,
              (d) => d.preferencesReceived,
            )
            .join("-")
      ) {
        const extentPR = d3.extent(
          appState.masterSociogramData.nodes,
          (d) => d.preferencesReceived,
        );
        appState.nodeColorScales.preferencesReceivedExtent = extentPR.join("-");
        appState.nodeColorScales.preferencesReceived = d3
          .scaleSequential(d3.interpolateGreens)
          .domain(extentPR);
        if (extentPR[0] === extentPR[1]) {
          appState.nodeColorScales.preferencesReceived = () =>
            d3.interpolateGreens(0.5);
        }
      }
      return appState.nodeColorScales.preferencesReceived(
        node.preferencesReceived,
      );
    case "nonPreferencesReceived":
      if (!appState.masterSociogramData.nodes.length)
        return "var(--accent-primary)";
      if (
        !appState.nodeColorScales.nonPreferencesReceived ||
        appState.nodeColorScales.nonPreferencesReceivedExtent !==
          d3
            .extent(
              appState.masterSociogramData.nodes,
              (d) => d.nonPreferencesReceived,
            )
            .join("-")
      ) {
        const extentNPR = d3.extent(
          appState.masterSociogramData.nodes,
          (d) => d.nonPreferencesReceived,
        );
        appState.nodeColorScales.nonPreferencesReceivedExtent =
          extentNPR.join("-");
        appState.nodeColorScales.nonPreferencesReceived = d3
          .scaleSequential((t) => d3.interpolateReds(t))
          .domain(extentNPR);
        if (extentNPR[0] === extentNPR[1]) {
          appState.nodeColorScales.nonPreferencesReceived = () =>
            d3.interpolateReds(0.5);
        }
      }
      return appState.nodeColorScales.nonPreferencesReceived(
        node.nonPreferencesReceived,
      );
    case "degree":
      if (!appState.masterSociogramData.nodes.length)
        return "var(--accent-primary)";
      if (
        !appState.nodeColorScales.degree ||
        appState.nodeColorScales.degreeExtent !==
          d3
            .extent(appState.masterSociogramData.nodes, (d) => d.totalDegree)
            .join("-")
      ) {
        const extentDegree = d3.extent(
          appState.masterSociogramData.nodes,
          (d) => d.totalDegree,
        );
        appState.nodeColorScales.degreeExtent = extentDegree.join("-");
        appState.nodeColorScales.degree = d3
          .scaleSequential(d3.interpolateBlues)
          .domain(extentDegree);
        if (extentDegree[0] === extentDegree[1]) {
          appState.nodeColorScales.degree = () => d3.interpolateBlues(0.5);
        }
      }
      return appState.nodeColorScales.degree(node.totalDegree);
    case "betweenness":
      if (
        !appState.masterSociogramData.nodes.length ||
        typeof node.betweenness === "undefined"
      )
        return "var(--accent-primary)";
      if (
        !appState.nodeColorScales.betweenness ||
        appState.nodeColorScales.betweennessExtent !==
          d3
            .extent(appState.masterSociogramData.nodes, (d) => d.betweenness)
            .join("-")
      ) {
        const extentB = d3.extent(
          appState.masterSociogramData.nodes,
          (d) => d.betweenness,
        );
        appState.nodeColorScales.betweennessExtent = extentB.join("-");
        appState.nodeColorScales.betweenness = d3
          .scaleLinear()
          .domain(extentB)
          .range(["#440154", "#fde725"]);
        if (extentB[0] === extentB[1])
          appState.nodeColorScales.betweenness = () => "#440154";
      }
      return appState.nodeColorScales.betweenness(node.betweenness);

    case "default":
    default:
      return "var(--accent-primary)";
  }
}

function drag(simulationInstance) {
  function dragstarted(event, d) {
    if (!event.active) simulationInstance.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulationInstance.alphaTarget(0);
    d.fx = d.x;
    d.fy = d.y;
  }
  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

export function setupD3Graph() {
  const appState = getState();
  if (appState.graphInitialized) return true;

  const containerRect = appState.d3Container.getBoundingClientRect();
  let width = Math.floor(containerRect.width);
  let height = Math.floor(containerRect.height);

  if (width <= 0 || height <= 0) {
    console.warn(
      "D3 container dimensions are invalid during setup. Deferring actual SVG setup.",
    );
    return false;
  }
  appState.svg.attr("width", width).attr("height", height);

  appState.svg
    .append("defs")
    .selectAll("marker")
    .data(["positive", "negative"])
    .join("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 19)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", (d) => (d === "positive" ? "var(--pos)" : "var(--neg)"));

  const zoomableGroup = appState.svg
    .append("g")
    .attr("id", "zoomable-graph-group");
  const linkGroup = zoomableGroup.append("g").attr("class", "links");
  const nodeGroup = zoomableGroup.append("g").attr("class", "nodes");

  const zoomBehavior = d3
    .zoom()
    .scaleExtent([0.05, 10])
    .on("zoom", (event) => {
      if (zoomableGroup) zoomableGroup.attr("transform", event.transform);
    });
  appState.svg.call(zoomBehavior);
  appState.svg.on("dblclick.zoom", () => {
    if (zoomBehavior && width > 0 && height > 0) {
      appState.svg
        .transition()
        .duration(750)
        .call(
          zoomBehavior.transform,
          d3.zoomIdentity,
          d3.zoomTransform(appState.svg.node()).invert([width / 2, height / 2]),
        );
    }
  });

  const simulation = d3
    .forceSimulation()
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", () => {
      if (!linkGroup || !nodeGroup) return;
      linkGroup
        .selectAll(".link")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      nodeGroup
        .selectAll(".node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

  setState({
    width,
    height,
    zoomableGroup,
    linkGroup,
    nodeGroup,
    zoomBehavior,
    simulation,
    graphInitialized: true,
  });

  console.log("D3 graph setup complete with dimensions:", width, height);
  return true;
}

export function updateD3Graph(isNewData = false) {
  const appState = getState();
  if (!appState.graphInitialized) {
    if (!setupD3Graph()) return;
  }

  const containerRect = appState.d3Container.getBoundingClientRect();
  const currentWidth = Math.floor(containerRect.width);
  const currentHeight = Math.floor(containerRect.height);

  if (
    currentWidth > 0 &&
    currentHeight > 0 &&
    (appState.width !== currentWidth || appState.height !== currentHeight)
  ) {
    setState({ width: currentWidth, height: currentHeight });
    appState.svg.attr("width", currentWidth).attr("height", currentHeight);
    if (appState.simulation) {
      appState.simulation.force(
        "center",
        d3.forceCenter(currentWidth / 2, currentHeight / 2),
      );
    }
  }

  if (
    !appState.currentDisplayNodes.length &&
    !appState.currentDisplayLinks.length &&
    !appState.masterSociogramData.nodes.length
  ) {
    if (appState.linkGroup) appState.linkGroup.selectAll("*").remove();
    if (appState.nodeGroup) appState.nodeGroup.selectAll("*").remove();
    if (appState.simulation) appState.simulation.nodes([]).force("link", null);
    updateLegendAndExplanation(nodeColorModeSelect.value);
    return;
  }

  const nodeLabelType = nodeLabelSelect.value;
  const currentLabelSize = +nodeLabelSizeInput.value;
  const currentColorMode = nodeColorModeSelect.value;

  updateLegendAndExplanation(currentColorMode);

  let nodesForSim = appState.currentDisplayNodes.map((d) => ({ ...d }));
  let linksForSim = appState.currentDisplayLinks.map((d) => ({ ...d }));

  appState.simulation.nodes(nodesForSim);

  const links = appState.linkGroup
    .selectAll(".link")
    .data(linksForSim, (d) => d.id);

  links.exit().remove();
  links
    .enter()
    .append("line")
    .attr("class", "link")
    .merge(links)
    .attr("stroke", (d) =>
      d.type === "positive" ? "var(--pos)" : "var(--neg)",
    )
    .attr("stroke-width", 2)
    .attr("marker-end", (d) => `url(#arrow-${d.type})`);

  const nodes = appState.nodeGroup
    .selectAll(".node")
    .data(nodesForSim, (d) => d.id);

  nodes.exit().remove();
  const nodeEnter = nodes.enter().append("g").attr("class", "node");

  const tooltip = d3.select("#graph-tooltip");

  nodeEnter
    .append("circle")
    .attr("r", (d) => d.radius)
    .on("mouseover", (event, d_node) => {
      appState.linkGroup.selectAll(".link").style("opacity", (l) => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        return sourceId === d_node.id || targetId === d_node.id ? 1 : 0.2;
      });

      tooltip
        .html(
          `
                <h4>${d_node.label || d_node.id}</h4>
                <p><strong>Status:</strong> ${d_node.status}</p>
                <p><strong>Prefs Rcvd:</strong> ${d_node.preferencesReceived}</p>
            `,
        )
        .classed("visible", true);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      appState.linkGroup.selectAll(".link").style("opacity", 0.7);
      tooltip.classed("visible", false);
    });

  nodeEnter.append("text").attr("text-anchor", "middle");

  nodeEnter
    .merge(nodes)
    .each(function (d_node) {
      d3.select(this)
        .select("circle")
        .attr("r", d_node.radius)
        .attr("fill", getNodeColor(d_node, currentColorMode));
      d3.select(this)
        .select("text")
        .attr("dy", d_node.radius + 12 + currentLabelSize / 10)
        .style("font-size", `${currentLabelSize}px`)
        .text(nodeLabelType === "name" ? d_node.label || d_node.id : d_node.id);
    })
    .call(drag(appState.simulation))
    .on("dblclick", (event, d_node) => {
      event.preventDefault();
      setState({ isEgoView: true, egoNodeId: d_node.id });
      applyFiltersAndRedraw();
      exitEgoViewBtn.style.display = "inline-block";
      clearHighlights();
    })
    .on("contextmenu", (event, d_node) => {
      event.preventDefault();
      const contextMenu = document.getElementById("context-menu");
      contextMenu.innerHTML = `
                <div class="context-menu-item" id="context-details">Show Details for <b>${d_node.label || d_node.id}</b></div>
                <div class="context-menu-item" id="context-highlight">Highlight Neighbors</div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" id="context-delete">Hide Node</div>
            `;
      contextMenu.style.display = "block";
      contextMenu.style.left = `${event.pageX}px`;
      contextMenu.style.top = `${event.pageY}px`;

      document
        .getElementById("context-details")
        .addEventListener("click", () => {
          showNotification(
            `Details for ${d_node.label || d_node.id}: Status: ${d_node.status}, Prefs Rcvd: ${d_node.preferencesReceived}, Non-Prefs Rcvd: ${d_node.nonPreferencesReceived}`,
            "info",
            5000,
          );
          contextMenu.style.display = "none";
        });

      document
        .getElementById("context-highlight")
        .addEventListener("click", () => {
          highlightNeighbors(d_node.id);
          contextMenu.style.display = "none";
        });

      document
        .getElementById("context-delete")
        .addEventListener("click", () => {
          const appState = getState();
          appState.deletedNodeIds.add(d_node.id);
          window.dispatchEvent(new CustomEvent("request-redraw"));
          showNotification(
            `Node ${d_node.label || d_node.id} hidden. It can be restored from the list of hidden nodes.`,
            "info",
            6000,
          );
          contextMenu.style.display = "none";
        });
    });

  if (!isNewData) {
    appState.simulation.nodes().forEach((node) => {
      node.fx = null;
      node.fy = null;
    });
  }

  const linkDist = +linkDistanceInput.value;
  const chargeStr = +chargeStrengthInput.value;
  const collideFactor = +collideRadiusFactorInput.value;

  appState.simulation
    .force(
      "link",
      d3
        .forceLink(linksForSim)
        .id((d) => d.id)
        .distance(linkDist)
        .strength(0.4),
    )
    .force("charge", d3.forceManyBody().strength(chargeStr))
    .force(
      "collide",
      d3
        .forceCollide()
        .radius((d) => d.radius * collideFactor + 3)
        .strength(0.8),
    );

  appState.simulation.alpha(1).restart();
}

export function applyFiltersAndRedraw() {
  const appState = getState();
  const showPositive = showPositiveLinksCheckbox.checked;
  const showNegative = showNegativeLinksCheckbox.checked;
  const minPrefs = +minPrefsFilterInput.value;

  let { nodes: activeNodes, links: activeLinks } = appState.activeSociogramData;

  if (appState.isEgoView && appState.egoNodeId) {
    const egoId = appState.egoNodeId;
    const neighborIds = new Set([egoId]);

    appState.activeSociogramData.links.forEach((link) => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      if (sourceId === egoId) {
        neighborIds.add(targetId);
      } else if (targetId === egoId) {
        neighborIds.add(sourceId);
      }
    });

    activeNodes = activeNodes.filter((n) => neighborIds.has(n.id));
  }

  const currentDisplayNodes = activeNodes.filter((node) => {
    if (node.preferencesReceived < minPrefs) return false;
    return true;
  });

  const visibleNodeIds = new Set(currentDisplayNodes.map((n) => n.id));

  const currentDisplayLinks = activeLinks.filter((link) => {
    const sourceId = link.source.id || link.source;
    const targetId = link.target.id || link.target;
    if (!visibleNodeIds.has(sourceId) || !visibleNodeIds.has(targetId))
      return false;
    if (link.type === "positive" && showPositive) return true;
    if (link.type === "negative" && showNegative) return true;
    return false;
  });

  setState({ currentDisplayNodes, currentDisplayLinks });
  updateNodeCount(currentDisplayNodes.length);
  updateLinkCount(currentDisplayLinks.length);
  updateD3Graph();
}

function highlightNeighbors(nodeId) {
  const appState = getState();
  const { currentDisplayLinks } = appState;

  const neighborIds = new Set([nodeId]);

  currentDisplayLinks.forEach((link) => {
    const sourceId = link.source.id || link.source;
    const targetId = link.target.id || link.target;
    if (sourceId === nodeId) {
      neighborIds.add(targetId);
    } else if (targetId === nodeId) {
      neighborIds.add(sourceId);
    }
  });

  if (appState.nodeGroup) {
    appState.nodeGroup
      .selectAll(".node")
      .classed("highlighted", (d) => neighborIds.has(d.id))
      .classed("faded", (d) => !neighborIds.has(d.id));
  }

  if (appState.linkGroup) {
    appState.linkGroup
      .selectAll(".link")
      .classed("highlighted", (d) => {
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        return sourceId === nodeId || targetId === nodeId;
      })
      .classed("faded", (d) => {
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        return !(sourceId === nodeId || targetId === nodeId);
      });
  }
  clearHighlightBtn.style.display = "inline-block";
}

export function highlightClique(cliqueMemberIds) {
  const appState = getState();
  const cliqueSet = new Set(cliqueMemberIds);

  if (appState.nodeGroup) {
    appState.nodeGroup
      .selectAll(".node")
      .classed("highlighted", (d) => cliqueSet.has(d.id))
      .classed("faded", (d) => !cliqueSet.has(d.id));
  }

  if (appState.linkGroup) {
    appState.linkGroup
      .selectAll(".link")
      .classed("highlighted", (d) => {
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        return cliqueSet.has(sourceId) && cliqueSet.has(targetId);
      })
      .classed("faded", (d) => {
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        return !(cliqueSet.has(sourceId) && cliqueSet.has(targetId));
      });
  }
  clearHighlightBtn.style.display = "inline-block";
}

export function clearHighlights() {
  const appState = getState();
  if (appState.nodeGroup)
    appState.nodeGroup
      .selectAll(".node")
      .classed("highlighted", false)
      .classed("faded", false);
  if (appState.linkGroup)
    appState.linkGroup
      .selectAll(".link")
      .classed("highlighted", false)
      .classed("faded", false);
  clearHighlightBtn.style.display = "none";
}

export function handleFullscreenChange() {
  const appState = getState();
  setTimeout(() => {
    if (document.getElementById("graph").classList.contains("active")) {
      requestAnimationFrame(() => {
        const containerRect = appState.d3Container.getBoundingClientRect();
        if (containerRect.width > 0 && containerRect.height > 0) {
          const newWidth = Math.floor(containerRect.width);
          const newHeight = Math.floor(containerRect.height);

          if (appState.width !== newWidth || appState.height !== newHeight) {
            setState({ width: newWidth, height: newHeight });
            appState.svg.attr("width", newWidth).attr("height", newHeight);
            if (appState.simulation) {
              appState.simulation.force(
                "center",
                d3.forceCenter(newWidth / 2, newHeight / 2),
              );
              if (appState.currentDisplayNodes.length > 0) {
                appState.simulation.alpha(0.5).restart();
              }
            }
          }
          if (appState.currentDisplayNodes.length > 0) {
            updateD3Graph();
          }
        }
      });
    }
  }, 150);
}

export function resetGraph() {
  const appState = getState();
  if (!appState.graphInitialized) return;

  // Reset zoom
  if (appState.zoomBehavior && appState.width > 0 && appState.height > 0) {
    appState.svg
      .transition()
      .duration(750)
      .call(
        appState.zoomBehavior.transform,
        d3.zoomIdentity,
        d3
          .zoomTransform(appState.svg.node())
          .invert([appState.width / 2, appState.height / 2]),
      );
  }

  // Reset node positions
  appState.simulation.nodes().forEach((node) => {
    node.fx = null;
    node.fy = null;
  });

  // Reset simulation parameters to default
  linkDistanceInput.value = DEFAULT_SETTINGS.LINK_DISTANCE;
  chargeStrengthInput.value = DEFAULT_SETTINGS.CHARGE_STRENGTH;
  collideRadiusFactorInput.value = DEFAULT_SETTINGS.COLLIDE_RADIUS_FACTOR;

  // Update display values
  document.getElementById("link-distance-value").textContent =
    DEFAULT_SETTINGS.LINK_DISTANCE;
  document.getElementById("charge-strength-value").textContent =
    DEFAULT_SETTINGS.CHARGE_STRENGTH;
  document.getElementById("collide-radius-factor-value").textContent =
    DEFAULT_SETTINGS.COLLIDE_RADIUS_FACTOR;

  // Restart simulation
  if (appState.simulation) {
    appState.simulation.force("link").distance(+DEFAULT_SETTINGS.LINK_DISTANCE);
    appState.simulation
      .force("charge")
      .strength(+DEFAULT_SETTINGS.CHARGE_STRENGTH);
    appState.simulation
      .force("collide")
      .radius((d) => d.radius * +DEFAULT_SETTINGS.COLLIDE_RADIUS_FACTOR + 3);
    appState.simulation.alpha(1).restart();
  }

  showNotification("Graph view has been reset.", "success");
}
