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
  { name: "Bike (Blue)", imageLink: "bike-blue.svg" },
  { name: "Bike (Cyan)", imageLink: "bike-cyan.svg" },
  { name: "Bike (Green)", imageLink: "bike-green.svg" },
  { name: "Bike (Purple)", imageLink: "bike-purple.svg" },
  { name: "Bike (Red)", imageLink: "bike-red.svg" },
  { name: "Book (Black)", imageLink: "book-black.svg" },
  { name: "Book (Blue)", imageLink: "book-blue.svg" },
  { name: "Book (Cyan)", imageLink: "book-cyan.svg" },
  { name: "Book (Green)", imageLink: "book-green.svg" },
  { name: "Book (Purple)", imageLink: "book-purple.svg" },
  { name: "Book (Red)", imageLink: "book-red.svg" },
  { name: "Car (Black)", imageLink: "car-black.svg" },
  { name: "Coffee (Black)", imageLink: "coffee-black.svg" },
  { name: "Color (Black)", imageLink: "color-black.svg" },
  { name: "Data Tracker", imageLink: "dataTracker.svg" },
  { name: "Gift (Black)", imageLink: "gift-black.svg" },
  { name: "Guitar (Black)", imageLink: "guitar-black.svg" },
  { name: "Profile", imageLink: "profile-view.svg" }, // Not a "view" per your rule?
  { name: "Shirt (Black)", imageLink: "shirt-black.svg" },
  { name: "Shirt (Blue)", imageLink: "shirt-blue.svg" },
  { name: "Shirt (Cyan)", imageLink: "shirt-cyan.svg" },
  { name: "Shirt (Green)", imageLink: "shirt-green.svg" },
  { name: "Shirt (Purple)", imageLink: "shirt-purple.svg" },
  { name: "Shirt (Red)", imageLink: "shirt-red.svg" },
];

// Black
// #2b2b2b (black)
// #444444 (grey)

// Cyan
// #00bfbf (cyan)
// #9acee6(blue)

// Blue
// #9acee6 (blue)
// #BF7E96 (purple)

// Green
// #619E73 (green)
// #B1FFFF (blue)

// Purple
// #AF84A3 (purple)
// #9acee6 (blue)

// Red
// #d10c0c (red)
// #BF7E96 (purple)
