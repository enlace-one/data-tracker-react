import React, { useState } from "react";

// Define the types for the component props
interface HoverTextProps {
  text: string; // The text to display (e.g., label or heading)
  onHoverText: string; // The content to show on hover (e.g., description or tooltip)
}

const HoverText: React.FC<HoverTextProps> = ({
  text,
  onHoverText: content,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {text}
      {isHovering && (
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
            zIndex: 1,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default HoverText;
