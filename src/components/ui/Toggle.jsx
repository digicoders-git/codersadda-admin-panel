import React from "react";
import { useTheme } from "../../context/ThemeContext";

const Toggle = ({ active, onClick, disabled = false }) => {
  const { colors, isDarkMode } = useTheme();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${active ? "bg-opacity-100" : "bg-opacity-20"}`}
      style={{
        backgroundColor: active
          ? colors.primary
          : isDarkMode
            ? "#334155"
            : "#cbd5e1",
      }}
    >
      <div
        className="w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 shadow-sm"
        style={{
          backgroundColor: active
            ? colors.primary === "#FFFFFF" || colors.primary === "#ffffff"
              ? "#000000"
              : "#FFFFFF"
            : "#FFFFFF",
          left: active ? "calc(100% - 18px)" : "2px",
        }}
      ></div>
    </button>
  );
};

export default Toggle;
