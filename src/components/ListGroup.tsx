import { SetStateAction, useState } from "react";

interface Props {
  // Mutating this in the function is an antipattern in React
  items: string[]; // Change to dict with ID?
  heading: string;
  onSelectItem: (item: string) => void;
}

function ListGroup({ items, heading, onSelectItem }: Props) {
  const handleClick = (item: string, index: SetStateAction<number>) => {
    onSelectItem(`clicked ${item}`);
    setSelectedIndex(index);
  };

  //   const arr = useState(-1); // arr[0] = variable, arr[0] = updater function
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    // <> is a shortcut for a fragment, allows returning mutliple elements
    <>
      <h1 className="black-text">{heading}</h1>

      {/* {items.length === 0 ? <p>No items found.</p> : null} */}
      {items.length === 0 && <p>No items found.</p>}

      <ul>
        {items.map((item, index) => (
          <li
            className={selectedIndex === index ? "blue-text" : "black-text"}
            onClick={() => handleClick(item, index)}
            key={item}
          >
            {item}
          </li> // A unique key is expected
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
