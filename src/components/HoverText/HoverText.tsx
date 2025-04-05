import React, { useState, ReactNode } from "react";

interface HoverTextProps {
  children: ReactNode; // Content to wrap
  onHoverText: string; // Tooltip or hover description
  onTop?: boolean;
}

const HoverText: React.FC<HoverTextProps> = ({
  children,
  onHoverText,
  onTop = true,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && onTop && (
        <div
          style={{
            position: "absolute",
            top: "-150%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            zIndex: 1,
          }}
        >
          {onHoverText}
        </div>
      )}
      {children}
      {isHovering && !onTop && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            zIndex: 1,
          }}
        >
          {onHoverText}
        </div>
      )}
    </div>
  );
};

export default HoverText;
