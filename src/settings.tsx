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
