export const version = "1.0.0";

export const appName = "Data Tracker"; // Also update index.html

export const helpLink = "https://help-enlace.freshdesk.com/support/home";

export const DEFAULT_DATA_TYPES = [
  {
    name: "Number",
    note: "Stores numeric values",
    isComplex: false,
    inputType: "number",
    id: "number-001",
  },
  {
    name: "Boolean",
    note: "Stores true/false values",
    isComplex: false,
    inputType: "boolean-string",
    id: "boolean-001",
  },
  {
    name: "Text",
    note: "Stores string values",
    isComplex: false,
    inputType: "string",
    id: "text-001",
  },
  {
    name: "Time",
    note: "Stores time values",
    isComplex: false,
    inputType: "time",
    id: "time-001",
  },
  {
    name: "Complex Number",
    note: "Stores multiple related numbers",
    isComplex: true,
    pattern:
      "(\\(?\\d+(\\.\\d+)?\\)?)[*/+-](\\(?\\d+(\\.\\d+)?\\)?)([*/+-](\\(?\\d+(\\.\\d+)?\\)?))*",
    inputType: "math",
    id: "complex-number-001",
  },
];

// imageLink = topicId
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
  { name: "Camera (Black)", imageLink: "camera-black.svg" },
  { name: "Car (Black)", imageLink: "car-black.svg" },
  { name: "Cart (Black)", imageLink: "cart-black.svg" },
  { name: "Cat (Black)", imageLink: "cat-black.svg" },
  { name: "Clock (Black)", imageLink: "clock-black.svg" },
  { name: "Coffee (Black)", imageLink: "coffee-black.svg" },
  { name: "Color (Black)", imageLink: "color-black.svg" },
  { name: "Color (Blue)", imageLink: "color-blue.svg" },
  { name: "Color (Cyan)", imageLink: "color-cyan.svg" },
  { name: "Color (Green)", imageLink: "color-green.svg" },
  { name: "Color (Purple)", imageLink: "color-purple.svg" },
  { name: "Color (Red)", imageLink: "color-red.svg" },
  { name: "Dog (Black)", imageLink: "dog-black.svg" },
  { name: "Earth (Black)", imageLink: "earth-black.svg" },
  { name: "File (Black)", imageLink: "file-black.svg" },
  { name: "Gears (Black)", imageLink: "gears-black.svg" },
  { name: "Gift (Black)", imageLink: "gift-black.svg" },
  { name: "Globe (Black)", imageLink: "globe-black.svg" },
  { name: "Guitar (Black)", imageLink: "guitar-black.svg" },
  { name: "Heart (Black)", imageLink: "heart-black.svg" },
  { name: "House (Black)", imageLink: "house-black.svg" },
  { name: "Music (Black)", imageLink: "music-black.svg" },
  { name: "Pin (Black)", imageLink: "pin-black.svg" },
  { name: "Plane (Black)", imageLink: "plane-black.svg" },
  { name: "Rain (Black)", imageLink: "rain-black.svg" },
  { name: "Shirt (Black)", imageLink: "shirt-black.svg" },
  { name: "Shirt (Blue)", imageLink: "shirt-blue.svg" },
  { name: "Shirt (Cyan)", imageLink: "shirt-cyan.svg" },
  { name: "Shirt (Green)", imageLink: "shirt-green.svg" },
  { name: "Shirt (Purple)", imageLink: "shirt-purple.svg" },
  { name: "Shirt (Red)", imageLink: "shirt-red.svg" },
  { name: "Temp (Black)", imageLink: "temp-black.svg" },
  { name: "Treadmil (Black)", imageLink: "treadmil-black.svg" },
  { name: "Tree (Black)", imageLink: "tree-black.svg" },
  { name: "Work (Black)", imageLink: "work-black.svg" },
];

////////////
// Styles //
////////////

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
