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
  const [typedText, setTypedText] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const key = event.key;

      if (key.length === 1 && key.match(/\S/)) {
        setTypedText((prev) => {
          const newTyped = prev + key.toLowerCase();

          const match = items.find((item) =>
            item.label.toLowerCase().startsWith(newTyped)
          );

          if (match) {
            // 🔽 Only scroll, don't select or call onChange
            setTimeout(() => {
              const matchedEl = itemRefs.current[match.value];
              matchedEl?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }, 0);
          }

          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => {
            setTypedText("");
          }, 500);

          return newTyped;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items, onChange]);

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
                ref={(el) => (itemRefs.current[item.value] = el)}
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
