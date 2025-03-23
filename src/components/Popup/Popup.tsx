import { ReactNode } from "react";
import styles from "./Popup.module.css";
// import { Heading } from "@aws-amplify/ui-react";
// import BooleanField from "../BooleanField/BooleanField";

interface Props {
  children: ReactNode; // Accepts a child component to be used as the button
  isOpen: Boolean; // Correctly type the isOpen prop as boolean
}

const Popup = ({ children, isOpen }: Props) => {
  return (
    <>
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>{children}</div>
        </div>
      )}
    </>
  );
};

export default Popup;
