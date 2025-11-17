// js/constants.js

export const METRIC_DESCRIPTIONS = {
  preferencesReceived: {
    label: "Preferences Received",
    description:
      "The total number of times an individual was chosen as 'most preferred' by others.",
  },
  nonPreferencesReceived: {
    label: "Non-Preferences Received",
    description:
      "The total number of times an individual was chosen as 'least preferred' by others.",
  },
  preferencesGiven: {
    label: "Preferences Given",
    description:
      "The total number of 'most preferred' choices an individual made.",
  },
  nonPreferencesGiven: {
    label: "Non-Preferences Given",
    description:
      "The total number of 'least preferred' choices an individual made.",
  },
  totalDegree: {
    label: "Total Degree",
    description:
      "The total number of connections (both given and received, preferred and non-preferred).",
  },
  positiveReciprocal: {
    label: "Positive Reciprocal",
    description:
      "The number of times an individual's 'most preferred' choice was reciprocated by the chosen person.",
  },
  socialPreferenceScore: {
    label: "Social Preference Score",
    description:
      "A standardized score (z-score of Pref. Rcvd - z-score of Non-Pref. Rcvd) indicating overall likeability.",
  },
  betweenness: {
    label: "Betweenness Centrality",
    description:
      "A measure of how often an individual lies on the shortest path between two other individuals. Indicates influence and control over information flow.",
  },
};

export const DEFAULT_SETTINGS = {
  NODE_LABEL_SIZE: 12,
  LINK_DISTANCE: 150,
  CHARGE_STRENGTH: -400,
  COLLIDE_RADIUS_FACTOR: 2.5,
  MIN_CLIQUE_SIZE: 3,
};
