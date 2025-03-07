import { ReactNode } from "react";
import styles from "./TextButton.module.css";

interface Props {
  children: ReactNode;
  onClick: () => void; // Add onClick prop to the interface
}

const TextButton = ({ children, onClick }: Props) => {
  return (
    <>
      <button className={styles.textButton} onClick={onClick}>
        {children}
      </button>
    </>
  );
};

export default TextButton;
