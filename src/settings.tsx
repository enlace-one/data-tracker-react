export const version = "1.0.0";

export const appName = "Data Tracker"; // Also update index.html

export const helpLink = "https://help-enlace.freshdesk.com/support/home";

export const DEFAULT_DATA_TYPES = [
  {
    name: "Number",
    note: "Stores numeric values",
    isComplex: false,
    inputType: "number",
  },
  {
    name: "Boolean",
    note: "Stores true/false values",
    isComplex: false,
    inputType: "boolean-string",
  },
  {
    name: "Text",
    note: "Stores string values",
    isComplex: false,
    inputType: "string",
  },
  {
    name: "Time",
    note: "Stores time values",
    isComplex: false,
    inputType: "time",
  },
  {
    name: "Complex Number",
    note: "Stores multiple related numbers",
    isComplex: true,
    pattern:
      "(\\(?\\d+(\\.\\d+)?\\)?)[*/+-](\\(?\\d+(\\.\\d+)?\\)?)([*/+-](\\(?\\d+(\\.\\d+)?\\)?))*",
    inputType: "math",
  },
];

export const DEFAULT_TOPICS = [
  {
    name: "Weight Lifting",
    imageLink: "weight-lifting.svg",
  },
  {
    name: "Time",
    imageLink: "time.svg",
  },
  {
    name: "Sleep",
    imageLink: "sleep.svg",
  },
  { name: "Blue", imageLink: "blue.svg" },
  { name: "Blue-Purple", imageLink: "blue-purple.svg" },
  { name: "Cat", imageLink: "cat.svg" },
  { name: "Chart", imageLink: "chart.svg" },
  { name: "Fast Forward", imageLink: "fast-forward.svg" },
  { name: "Gift", imageLink: "gift.svg" },
  { name: "Graph View", imageLink: "graph-view.svg" },
  { name: "Green", imageLink: "green.svg" },
  { name: "Metrics", imageLink: "metrics.svg" },
  { name: "Minus", imageLink: "minus.svg" },
  { name: "Play", imageLink: "play.svg" },
  { name: "Red", imageLink: "red.svg" },
  { name: "Social Media", imageLink: "social-media.svg" },
  { name: "Target", imageLink: "target.svg" },
  { name: "Videos", imageLink: "videos.svg" },
  { name: "Yellow", imageLink: "yellow.svg" },
  { name: "Book (Blue)", imageLink: "book-blue.svg" },
  { name: "Book (Purple)", imageLink: "book-purple.svg" },
  { name: "Book (Green)", imageLink: "book-green.svg" },
];
