import { useState, useRef, useEffect } from "react";
import styles from "./CustomSelectField.module.css"; // Uncommented for styling
import { FlexFormOption } from "../../types";

interface Props {
  defaultValue: string;
  onChange: (value: string) => void;
  items: FlexFormOption[];
  placeholder?: string;
}

const CustomSelectField = ({
  defaultValue,
  items,
  onChange,
  placeholder = "Select an item",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle item selection
  const handleSelect = (item: FlexFormOption) => {
    setSelectedValue(item.value);
    onChange(item.value);
    setIsOpen(false);
  };

  // Find selected item for display
  const selectedItem = items.find((item) => item.value === selectedValue);

  return (
    <div className={styles.customSelectContainer} ref={containerRef}>
      {/* Display area */}
      <div
        className={`${styles.selectDisplay} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItem ? (
          selectedItem.element
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.scrollContainer}>
            {items.map((item) => (
              <div
                key={item.value}
                className={`${styles.dropdownItem} ${
                  item.value === selectedValue ? styles.selected : ""
                }`}
                onClick={() => handleSelect(item)}
              >
                {item.element}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelectField;
