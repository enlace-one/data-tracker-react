import { ReactNode } from "react";
import styles from "./Alert.module.css";
import { Button } from "@aws-amplify/ui-react";
import { SetActionMessageFunction } from "../../types";

interface Props {
  children: ReactNode;
  type?: "success" | "error" | "warning" | "default" | "";
  setActionMessage: SetActionMessageFunction;
}

const Alert = ({ children, setActionMessage, type = "default" }: Props) => {
  const alertStyles = {
    success: styles.success,
    error: styles.error,
    warning: styles.warning,
    default: styles.default,
  };
  if (type == "") {
    return;
  }

  const handleClose = () => {
    setActionMessage({ message: "", type: "" }, 0);
  };

  const className = `${styles.alert} ${alertStyles[type]}`;

  return (
    <div className={className}>
      {children}
      <Button className={styles.button} onClick={handleClose}>
        x
      </Button>
    </div>
  );
};

export default Alert;
