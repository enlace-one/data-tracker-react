import { useState } from "react";
// import styles from "./BooleanField.module.css";

interface Props {
  default: boolean;
  onChange: (value: boolean) => void;
}

const BooleanField = ({ default: defaultValue, onChange }: Props) => {
  const [value, setValue] = useState(defaultValue);

  const toggleValue = () => {
    setValue((prevValue) => {
      const newValue = !prevValue;
      onChange(newValue);
      return newValue;
    });
  };

  return (
    <input
      type="text"
      // className={styles.booleanField}
      value={value ? "True" : "False"}
      readOnly
      onClick={toggleValue}
    />
  );
};

export default BooleanField;
