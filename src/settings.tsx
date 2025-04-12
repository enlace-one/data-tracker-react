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
    name: "Select (Text)",
    note: "Select from options",
    isComplex: false,
    inputType: "select",
    id: "select-text-001",
  },
  {
    name: "Select (Numeric)",
    note: "Select from options with numeric values. Enter 'optionA (2), optionB (5)' in the options field.",
    isComplex: false,
    inputType: "select",
    id: "select-numeric-001",
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
  {
    name: "Time Difference",
    note: "Computes the difference between two times",
    isComplex: true,
    inputType: "time-difference",
    id: "time-difference-001",
  },
];

// imageLink = topicId
export const DEFAULT_TOPICS = [
  { name: "Bed (Black)", imageLink: "bed-black.svg" },
  { name: "Bed (Blue)", imageLink: "bed-blue.svg" },
  { name: "Bed (Colorful)", imageLink: "bed-colorful.svg" },
  { name: "Bed (Cyan)", imageLink: "bed-cyan.svg" },
  { name: "Bed (Green)", imageLink: "bed-green.svg" },
  { name: "Bed (Purple)", imageLink: "bed-purple.svg" },
  { name: "Bed (Red)", imageLink: "bed-red.svg" },
  { name: "Bike (Black)", imageLink: "bike-black.svg" },
  { name: "Bike (Blue)", imageLink: "bike-blue.svg" },
  { name: "Bike (Colorful)", imageLink: "bike-colorful.svg" },
  { name: "Bike (Cyan)", imageLink: "bike-cyan.svg" },
  { name: "Bike (Green)", imageLink: "bike-green.svg" },
  { name: "Bike (Purple)", imageLink: "bike-purple.svg" },
  { name: "Bike (Red)", imageLink: "bike-red.svg" },
  { name: "Book (Black)", imageLink: "book-black.svg" },
  { name: "Book (Blue)", imageLink: "book-blue.svg" },
  { name: "Book (Colorful)", imageLink: "book-colorful.svg" },
  { name: "Book (Cyan)", imageLink: "book-cyan.svg" },
  { name: "Book (Green)", imageLink: "book-green.svg" },
  { name: "Book (Purple)", imageLink: "book-purple.svg" },
  { name: "Book (Red)", imageLink: "book-red.svg" },
  { name: "Camera (Black)", imageLink: "camera-black.svg" },
  { name: "Camera (Blue)", imageLink: "camera-blue.svg" },
  { name: "Camera (Colorful)", imageLink: "camera-colorful.svg" },
  { name: "Camera (Cyan)", imageLink: "camera-cyan.svg" },
  { name: "Camera (Green)", imageLink: "camera-green.svg" },
  { name: "Camera (Purple)", imageLink: "camera-purple.svg" },
  { name: "Camera (Red)", imageLink: "camera-red.svg" },
  { name: "Car (Black)", imageLink: "car-black.svg" },
  { name: "Car (Blue)", imageLink: "car-blue.svg" },
  { name: "Car (Colorful)", imageLink: "car-colorful.svg" },
  { name: "Car (Cyan)", imageLink: "car-cyan.svg" },
  { name: "Car (Green)", imageLink: "car-green.svg" },
  { name: "Car (Purple)", imageLink: "car-purple.svg" },
  { name: "Car (Red)", imageLink: "car-red.svg" },
  { name: "Cart (Black)", imageLink: "cart-black.svg" },
  { name: "Cart (Blue)", imageLink: "cart-blue.svg" },
  { name: "Cart (Colorful)", imageLink: "cart-colorful.svg" },
  { name: "Cart (Cyan)", imageLink: "cart-cyan.svg" },
  { name: "Cart (Green)", imageLink: "cart-green.svg" },
  { name: "Cart (Purple)", imageLink: "cart-purple.svg" },
  { name: "Cart (Red)", imageLink: "cart-red.svg" },
  { name: "Cat (Black)", imageLink: "cat-black.svg" },
  { name: "Cat (Blue)", imageLink: "cat-blue.svg" },
  { name: "Cat (Colorful)", imageLink: "cat-colorful.svg" },
  { name: "Cat (Cyan)", imageLink: "cat-cyan.svg" },
  { name: "Cat (Green)", imageLink: "cat-green.svg" },
  { name: "Cat (Purple)", imageLink: "cat-purple.svg" },
  { name: "Cat (Red)", imageLink: "cat-red.svg" },
  { name: "Chess (Black)", imageLink: "chess-black.svg" },
  { name: "Chess (Blue)", imageLink: "chess-blue.svg" },
  { name: "Chess (Colorful)", imageLink: "chess-colorful.svg" },
  { name: "Chess (Cyan)", imageLink: "chess-cyan.svg" },
  { name: "Chess (Green)", imageLink: "chess-green.svg" },
  { name: "Chess (Purple)", imageLink: "chess-purple.svg" },
  { name: "Chess (Red)", imageLink: "chess-red.svg" },
  { name: "Clock (Black)", imageLink: "clock-black.svg" },
  { name: "Clock (Blue)", imageLink: "clock-blue.svg" },
  { name: "Clock (Colorful)", imageLink: "clock-colorful.svg" },
  { name: "Clock (Cyan)", imageLink: "clock-cyan.svg" },
  { name: "Clock (Green)", imageLink: "clock-green.svg" },
  { name: "Clock (Purple)", imageLink: "clock-purple.svg" },
  { name: "Clock (Red)", imageLink: "clock-red.svg" },
  { name: "Coffee (Black)", imageLink: "coffee-black.svg" },
  { name: "Coffee (Blue)", imageLink: "coffee-blue.svg" },
  { name: "Coffee (Colorful)", imageLink: "coffee-colorful.svg" },
  { name: "Coffee (Cyan)", imageLink: "coffee-cyan.svg" },
  { name: "Coffee (Green)", imageLink: "coffee-green.svg" },
  { name: "Coffee (Purple)", imageLink: "coffee-purple.svg" },
  { name: "Coffee (Red)", imageLink: "coffee-red.svg" },
  { name: "Color (Black)", imageLink: "color-black.svg" },
  { name: "Color (Blue)", imageLink: "color-blue.svg" },
  { name: "Color (Colorful)", imageLink: "color-colorful.svg" },
  { name: "Color (Cyan)", imageLink: "color-cyan.svg" },
  { name: "Color (Green)", imageLink: "color-green.svg" },
  { name: "Color (Purple)", imageLink: "color-purple.svg" },
  { name: "Color (Red)", imageLink: "color-red.svg" },
  { name: "Dog (Black)", imageLink: "dog-black.svg" },
  { name: "Dog (Blue)", imageLink: "dog-blue.svg" },
  { name: "Dog (Colorful)", imageLink: "dog-colorful.svg" },
  { name: "Dog (Cyan)", imageLink: "dog-cyan.svg" },
  { name: "Dog (Green)", imageLink: "dog-green.svg" },
  { name: "Dog (Purple)", imageLink: "dog-purple.svg" },
  { name: "Dog (Red)", imageLink: "dog-red.svg" },
  { name: "Dumbell (Black)", imageLink: "dumbell-black.svg" },
  { name: "Dumbell (Blue)", imageLink: "dumbell-blue.svg" },
  { name: "Dumbell (Colorful)", imageLink: "dumbell-colorful.svg" },
  { name: "Dumbell (Cyan)", imageLink: "dumbell-cyan.svg" },
  { name: "Dumbell (Green)", imageLink: "dumbell-green.svg" },
  { name: "Dumbell (Purple)", imageLink: "dumbell-purple.svg" },
  { name: "Dumbell (Red)", imageLink: "dumbell-red.svg" },
  { name: "Earth (Black)", imageLink: "earth-black.svg" },
  { name: "Earth (Blue)", imageLink: "earth-blue.svg" },
  { name: "Earth (Colorful)", imageLink: "earth-colorful.svg" },
  { name: "Earth (Cyan)", imageLink: "earth-cyan.svg" },
  { name: "Earth (Green)", imageLink: "earth-green.svg" },
  { name: "Earth (Purple)", imageLink: "earth-purple.svg" },
  { name: "Earth (Red)", imageLink: "earth-red.svg" },
  { name: "File (Black)", imageLink: "file-black.svg" },
  { name: "File (Blue)", imageLink: "file-blue.svg" },
  { name: "File (Colorful)", imageLink: "file-colorful.svg" },
  { name: "File (Cyan)", imageLink: "file-cyan.svg" },
  { name: "File (Green)", imageLink: "file-green.svg" },
  { name: "File (Purple)", imageLink: "file-purple.svg" },
  { name: "File (Red)", imageLink: "file-red.svg" },
  { name: "Gears (Black)", imageLink: "gears-black.svg" },
  { name: "Gears (Blue)", imageLink: "gears-blue.svg" },
  { name: "Gears (Colorful)", imageLink: "gears-colorful.svg" },
  { name: "Gears (Cyan)", imageLink: "gears-cyan.svg" },
  { name: "Gears (Green)", imageLink: "gears-green.svg" },
  { name: "Gears (Purple)", imageLink: "gears-purple.svg" },
  { name: "Gears (Red)", imageLink: "gears-red.svg" },
  { name: "Gift (Black)", imageLink: "gift-black.svg" },
  { name: "Gift (Blue)", imageLink: "gift-blue.svg" },
  { name: "Gift (Colorful)", imageLink: "gift-colorful.svg" },
  { name: "Gift (Cyan)", imageLink: "gift-cyan.svg" },
  { name: "Gift (Green)", imageLink: "gift-green.svg" },
  { name: "Gift (Purple)", imageLink: "gift-purple.svg" },
  { name: "Gift (Red)", imageLink: "gift-red.svg" },
  { name: "Globe (Black)", imageLink: "globe-black.svg" },
  { name: "Globe (Blue)", imageLink: "globe-blue.svg" },
  { name: "Globe (Colorful)", imageLink: "globe-colorful.svg" },
  { name: "Globe (Cyan)", imageLink: "globe-cyan.svg" },
  { name: "Globe (Green)", imageLink: "globe-green.svg" },
  { name: "Globe (Purple)", imageLink: "globe-purple.svg" },
  { name: "Globe (Red)", imageLink: "globe-red.svg" },
  { name: "Guitar (Black)", imageLink: "guitar-black.svg" },
  { name: "Guitar (Blue)", imageLink: "guitar-blue.svg" },
  { name: "Guitar (Colorful)", imageLink: "guitar-colorful.svg" },
  { name: "Guitar (Cyan)", imageLink: "guitar-cyan.svg" },
  { name: "Guitar (Green)", imageLink: "guitar-green.svg" },
  { name: "Guitar (Purple)", imageLink: "guitar-purple.svg" },
  { name: "Guitar (Red)", imageLink: "guitar-red.svg" },
  { name: "Headphones (Black)", imageLink: "headphones-black.svg" },
  { name: "Headphones (Blue)", imageLink: "headphones-blue.svg" },
  { name: "Headphones (Colorful)", imageLink: "headphones-colorful.svg" },
  { name: "Headphones (Cyan)", imageLink: "headphones-cyan.svg" },
  { name: "Headphones (Green)", imageLink: "headphones-green.svg" },
  { name: "Headphones (Purple)", imageLink: "headphones-purple.svg" },
  { name: "Headphones (Red)", imageLink: "headphones-red.svg" },
  { name: "Heart (Black)", imageLink: "heart-black.svg" },
  { name: "Heart (Blue)", imageLink: "heart-blue.svg" },
  { name: "Heart (Colorful)", imageLink: "heart-colorful.svg" },
  { name: "Heart (Cyan)", imageLink: "heart-cyan.svg" },
  { name: "Heart (Green)", imageLink: "heart-green.svg" },
  { name: "Heart (Purple)", imageLink: "heart-purple.svg" },
  { name: "Heart (Red)", imageLink: "heart-red.svg" },
  { name: "House (Black)", imageLink: "house-black.svg" },
  { name: "House (Blue)", imageLink: "house-blue.svg" },
  { name: "House (Colorful)", imageLink: "house-colorful.svg" },
  { name: "House (Cyan)", imageLink: "house-cyan.svg" },
  { name: "House (Green)", imageLink: "house-green.svg" },
  { name: "House (Purple)", imageLink: "house-purple.svg" },
  { name: "House (Red)", imageLink: "house-red.svg" },
  { name: "Lightbulb (Black)", imageLink: "lightbulb-black.svg" },
  { name: "Lightbulb (Blue)", imageLink: "lightbulb-blue.svg" },
  { name: "Lightbulb (Colorful)", imageLink: "lightbulb-colorful.svg" },
  { name: "Lightbulb (Cyan)", imageLink: "lightbulb-cyan.svg" },
  { name: "Lightbulb (Green)", imageLink: "lightbulb-green.svg" },
  { name: "Lightbulb (Purple)", imageLink: "lightbulb-purple.svg" },
  { name: "Lightbulb (Red)", imageLink: "lightbulb-red.svg" },
  { name: "Lock (Black)", imageLink: "lock-black.svg" },
  { name: "Lock (Blue)", imageLink: "lock-blue.svg" },
  { name: "Lock (Colorful)", imageLink: "lock-colorful.svg" },
  { name: "Lock (Cyan)", imageLink: "lock-cyan.svg" },
  { name: "Lock (Green)", imageLink: "lock-green.svg" },
  { name: "Lock (Purple)", imageLink: "lock-purple.svg" },
  { name: "Lock (Red)", imageLink: "lock-red.svg" },
  { name: "Mail (Black)", imageLink: "mail-black.svg" },
  { name: "Mail (Blue)", imageLink: "mail-blue.svg" },
  { name: "Mail (Colorful)", imageLink: "mail-colorful.svg" },
  { name: "Mail (Cyan)", imageLink: "mail-cyan.svg" },
  { name: "Mail (Green)", imageLink: "mail-green.svg" },
  { name: "Mail (Purple)", imageLink: "mail-purple.svg" },
  { name: "Mail (Red)", imageLink: "mail-red.svg" },
  { name: "Moon (Black)", imageLink: "moon-black.svg" },
  { name: "Moon (Blue)", imageLink: "moon-blue.svg" },
  { name: "Moon (Colorful)", imageLink: "moon-colorful.svg" },
  { name: "Moon (Cyan)", imageLink: "moon-cyan.svg" },
  { name: "Moon (Green)", imageLink: "moon-green.svg" },
  { name: "Moon (Purple)", imageLink: "moon-purple.svg" },
  { name: "Moon (Red)", imageLink: "moon-red.svg" },
  { name: "Music (Black)", imageLink: "music-black.svg" },
  { name: "Music (Blue)", imageLink: "music-blue.svg" },
  { name: "Music (Colorful)", imageLink: "music-colorful.svg" },
  { name: "Music (Cyan)", imageLink: "music-cyan.svg" },
  { name: "Music (Green)", imageLink: "music-green.svg" },
  { name: "Music (Purple)", imageLink: "music-purple.svg" },
  { name: "Music (Red)", imageLink: "music-red.svg" },
  { name: "Pin (Black)", imageLink: "pin-black.svg" },
  { name: "Pin (Blue)", imageLink: "pin-blue.svg" },
  { name: "Pin (Colorful)", imageLink: "pin-colorful.svg" },
  { name: "Pin (Cyan)", imageLink: "pin-cyan.svg" },
  { name: "Pin (Green)", imageLink: "pin-green.svg" },
  { name: "Pin (Purple)", imageLink: "pin-purple.svg" },
  { name: "Pin (Red)", imageLink: "pin-red.svg" },
  { name: "Plane (Black)", imageLink: "plane-black.svg" },
  { name: "Plane (Blue)", imageLink: "plane-blue.svg" },
  { name: "Plane (Colorful)", imageLink: "plane-colorful.svg" },
  { name: "Plane (Cyan)", imageLink: "plane-cyan.svg" },
  { name: "Plane (Green)", imageLink: "plane-green.svg" },
  { name: "Plane (Purple)", imageLink: "plane-purple.svg" },
  { name: "Plane (Red)", imageLink: "plane-red.svg" },
  { name: "Rain (Black)", imageLink: "rain-black.svg" },
  { name: "Rain (Blue)", imageLink: "rain-blue.svg" },
  { name: "Rain (Colorful)", imageLink: "rain-colorful.svg" },
  { name: "Rain (Cyan)", imageLink: "rain-cyan.svg" },
  { name: "Rain (Green)", imageLink: "rain-green.svg" },
  { name: "Rain (Purple)", imageLink: "rain-purple.svg" },
  { name: "Rain (Red)", imageLink: "rain-red.svg" },
  { name: "Shirt (Black)", imageLink: "shirt-black.svg" },
  { name: "Shirt (Blue)", imageLink: "shirt-blue.svg" },
  { name: "Shirt (Colorful)", imageLink: "shirt-colorful.svg" },
  { name: "Shirt (Cyan)", imageLink: "shirt-cyan.svg" },
  { name: "Shirt (Green)", imageLink: "shirt-green.svg" },
  { name: "Shirt (Purple)", imageLink: "shirt-purple.svg" },
  { name: "Shirt (Red)", imageLink: "shirt-red.svg" },
  { name: "Temp (Black)", imageLink: "temp-black.svg" },
  { name: "Temp (Blue)", imageLink: "temp-blue.svg" },
  { name: "Temp (Colorful)", imageLink: "temp-colorful.svg" },
  { name: "Temp (Cyan)", imageLink: "temp-cyan.svg" },
  { name: "Temp (Green)", imageLink: "temp-green.svg" },
  { name: "Temp (Purple)", imageLink: "temp-purple.svg" },
  { name: "Temp (Red)", imageLink: "temp-red.svg" },
  { name: "Treadmil (Black)", imageLink: "treadmil-black.svg" },
  { name: "Treadmil (Blue)", imageLink: "treadmil-blue.svg" },
  { name: "Treadmil (Colorful)", imageLink: "treadmil-colorful.svg" },
  { name: "Treadmil (Cyan)", imageLink: "treadmil-cyan.svg" },
  { name: "Treadmil (Green)", imageLink: "treadmil-green.svg" },
  { name: "Treadmil (Purple)", imageLink: "treadmil-purple.svg" },
  { name: "Treadmil (Red)", imageLink: "treadmil-red.svg" },
  { name: "Tree (Black)", imageLink: "tree-black.svg" },
  { name: "Tree (Blue)", imageLink: "tree-blue.svg" },
  { name: "Tree (Colorful)", imageLink: "tree-colorful.svg" },
  { name: "Tree (Cyan)", imageLink: "tree-cyan.svg" },
  { name: "Tree (Green)", imageLink: "tree-green.svg" },
  { name: "Tree (Purple)", imageLink: "tree-purple.svg" },
  { name: "Tree (Red)", imageLink: "tree-red.svg" },
  { name: "Work (Black)", imageLink: "work-black.svg" },
  { name: "Work (Blue)", imageLink: "work-blue.svg" },
  { name: "Work (Colorful)", imageLink: "work-colorful.svg" },
  { name: "Work (Cyan)", imageLink: "work-cyan.svg" },
  { name: "Work (Green)", imageLink: "work-green.svg" },
  { name: "Work (Purple)", imageLink: "work-purple.svg" },
  { name: "Work (Red)", imageLink: "work-red.svg" },
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
//rgb(123, 182, 209) (darker blue if needed)

// Blue
// #9acee6 (blue)
// #BF7E96 (purple)

// Green
// #619E73 (green)
// #56f8f8 (blue)

// Purple
// #AF84A3 (purple)
// #9acee6 (blue)

// Red
// #d10c0c (red)
// #BF7E96 (purple)

///////////////////////
// Background Colors //
///////////////////////

// #c5c5f9
// #aaffd4
// #ffffaa
// #ffd4aa
// #f9cae1
// #c5f7dd

//////////////////
// Example Data //
//////////////////

export const EXAMPLE_DATA = [
  {
    category: {
      name: "Push Ups",
      dataTypeId: "number-001",
      note: "Example category",
      topicId: "treadmil-colorful.svg",
    },
    entries: [
      {
        date: "2025-01-01",
        value: "35",
      },
      {
        date: "2025-01-14",
        value: "54",
      },
      {
        date: "2025-01-15",
        value: "32",
      },
    ],
  },
  {
    category: {
      name: "Read Bible",
      dataTypeId: "boolean-001",
      note: "Example category",
      topicId: "book-blue.svg",
    },
    entries: [
      {
        date: "2025-01-01",
        value: "true",
      },
      {
        date: "2025-01-14",
        value: "false",
      },
      {
        date: "2025-01-15",
        value: "true",
      },
    ],
  },
  {
    category: {
      name: "Dumbell Lifts",
      dataTypeId: "complex-number-001",
      note: "Example category, weight*reps",
      topicId: "treadmil-black.svg",
    },
    entries: [
      {
        date: "2025-01-20",
        value: "20*22",
      },
      {
        date: "2025-01-21",
        value: "20*20",
      },
      {
        date: "2025-01-22",
        value: "20*19",
      },
    ],
  },
  {
    category: {
      name: "Wake up Time",
      dataTypeId: "time-001",
      note: "Example category",
      topicId: "clock-cyan.svg",
    },
    entries: [
      {
        date: "2025-02-01",
        value: "05:00",
      },
      {
        date: "2025-02-04",
        value: "08:00",
      },
      {
        date: "2025-02-25",
        value: "03:00",
      },
    ],
  },
];
