import React from "react";
import styles from "./LoadingSymbol.module.css"; // Import CSS

interface LoadingSymbolProps {
  size?: number;
  color?: string;
}

const LoadingSymbol: React.FC<LoadingSymbolProps> = ({
  size = 40,
  color = "grey",
}) => {
  return (
    <div
      className={styles.spinner}
      style={{
        width: size,
        height: size,
        borderWidth: size / 10,
        borderTopColor: color,
      }}
    />
  );
};

export default LoadingSymbol;
