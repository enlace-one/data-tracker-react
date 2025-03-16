import { ReactNode } from "react";
import styles from "./Alert.module.css";

interface Props {
  children: ReactNode;
  type: string;
}

const Alert = ({ children, type }: Props) => {
  let style = "";

  if (type.toLowerCase() == "error") {
    style = styles.error;
  }
  return <div className={style}>{children}</div>;
};

export default Alert;
