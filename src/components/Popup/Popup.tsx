import { ReactNode, useState } from "react";
import styles from "./Popup.module.css";
// import { Heading } from "@aws-amplify/ui-react";
// import BooleanField from "../BooleanField/BooleanField";

interface Props {
  children: ReactNode; // Accepts a child component to be used as the button
  // isOpen: Boolean; // Correctly type the isOpen prop as boolean
  // setIsOpen:
}

const Popup = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleCancel = () => {
    setIsOpen(false);
  };
  return (
    <>
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            {children}
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
