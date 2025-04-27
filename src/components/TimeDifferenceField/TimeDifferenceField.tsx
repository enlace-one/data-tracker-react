import { useState } from "react";
// import styles from "./TimeDifferenceField.module.css";

interface Props {
  defaultValue: string;
  onBlur: (value: string) => void;
}

const TimeDifferenceField = ({ defaultValue, onBlur = console.log }: Props) => {
  const [value1, setValue1] = useState(defaultValue.split("-")[0]);
  const [value2, setValue2] = useState(defaultValue.split("-")[1]);

  // useEffect(() => {
  //   onBlur(`${value1}-${value2}`);
  // }, [value1, value2]);

  return (
    <div>
      <small>
        <i>Earlier Time</i>
      </small>
      <br />
      <input
        type="time"
        // className={styles.TimeDifferenceField}
        value={value1}
        onChange={(e) => setValue1(e.target.value)}
        onBlur={() => onBlur(`${value1}-${value2}`)}
      />
      <br />
      <small>
        <i>Later Time</i>
      </small>
      <br />
      <input
        type="time"
        // className={styles.TimeDifferenceField}
        value={value2}
        onChange={(e) => setValue2(e.target.value)}
        onBlur={() => onBlur(`${value1}-${value2}`)}
      />
    </div>
  );
};

export default TimeDifferenceField;
