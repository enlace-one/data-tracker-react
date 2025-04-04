import { useState } from "react";
// import styles from "./BooleanField.module.css";

interface Props {
  default: boolean | string;
  asString: boolean;
  onChange: (value: boolean | string) => void;
}

const BooleanField = ({ default: defaultValue, asString, onChange }: Props) => {
  const [value, setValue] = useState(
    defaultValue === true || defaultValue === "true" || defaultValue === "True"
  );

  const toggleValue = () => {
    setValue((prevValue) => {
      const newValue = !prevValue;
      const returnValue = asString ? (newValue ? "true" : "false") : newValue;
      onChange(returnValue);
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
