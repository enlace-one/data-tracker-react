import { SetStateAction, useState } from "react";
import styles from "./List.module.css";

interface Item {
  id: string;
  name: string;
  [key: string]: any; // Allows for additional key/value pairs
}

interface Props {
  items: Item[];
  heading: string;
  onSelectItem: (item_id: string) => void;
}

const List = ({ items, heading, onSelectItem }: Props) => {
  const handleClick = (item_id: string, index: SetStateAction<number>) => {
    onSelectItem(`Clicked ${item_id}`);
    setSelectedIndex(index);
  };

  //   const arr = useState(-1); // arr[0] = variable, arr[0] = updater function
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    // <> is a shortcut for a fragment, allows returning mutliple elements
    <>
      <h1 className={styles.listHeading}>{heading}</h1>

      {/* {items.length === 0 ? <p>No items found.</p> : null} */}
      {items.length === 0 && <p>No items found.</p>}

      <ul className={styles.ul}>
        {items.map((item, index) => (
          <li
            className={`${styles.listItem} ${
              selectedIndex === index ? styles.blueText : styles.blackText
            }`}
            onClick={() => handleClick(item.id, index)}
            key={item.id}
          >
            <span className={styles.itemName}>{item.name}</span>

            {Object.entries(item).map(
              ([key, value]) =>
                key !== "id" &&
                key !== "name" && <span key={key}> {`${key}: ${value}`}</span>
            )}
          </li> // A unique key is expected
        ))}
      </ul>
    </>
  );
};

export default List;
