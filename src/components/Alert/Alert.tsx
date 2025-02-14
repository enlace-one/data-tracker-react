import { ReactNode } from "react";
import styles from "./Alert.module.css";

interface Props {
  children: ReactNode;
}

const Alert = ({ children }: Props) => {
  return <div className={styles.alert}>{children}</div>;
};

export default Alert;
