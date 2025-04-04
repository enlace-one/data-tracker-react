import React from "react";
import styles from "./LoadingSymbol.module.css"; // Import CSS

interface LoadingSymbolProps {
  size?: number;
  color?: string;
  text?: string;
}

const LoadingSymbol: React.FC<LoadingSymbolProps> = ({
  size = 40,
  color = "grey",
  text = "",
}) => {
  return (
    <div className={styles.loadingContainer}>
      <div
        className={styles.spinner}
        style={{
          width: size,
          height: size,
          borderWidth: size / 10,
          borderTopColor: color,
        }}
      ></div>
      {text && (
        <span
          className={styles.loadingText}
          style={{
            color, // Match text color to spinner border color
            fontSize: size / 2.5, // Scale text size relative to spinner
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSymbol;
