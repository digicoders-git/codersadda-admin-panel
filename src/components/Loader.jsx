import React from "react";
import mainLogoo from "../assets/logoo.png";
import { useTheme } from "../context/ThemeContext";

const Loader = ({ size = 128, fullPage = false }) => {
  // size prop controls the outer ring size in pixels.
  // Other elements scale proportionally.
  const { colors } = useTheme();

  // Calculate proportional sizes
  const outerSize = size;
  const middleSize = Math.round(size * 0.75);
  const innerSize = Math.round(size * 0.625);

  const containerStyle = fullPage
    ? "flex h-screen w-full items-center justify-center bg-black/40 backdrop-blur-sm fixed inset-0 z-9999"
    : "flex items-center justify-center w-full h-full p-4";

  return (
    <div className={containerStyle}>
      <div className="relative flex items-center justify-center">
        {/* Dynamic Styles for Ease-In-Out Spin */}
        <style>{`
          @keyframes spin-ease-in-out {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse-ease {
            0% { transform: rotate(360deg); }
            50% { transform: rotate(180deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-spin-dynamic {
             animation: spin-ease-in-out 1s linear infinite;
          }
          .animate-spin-reverse-dynamic {
             animation: spin-reverse-ease 1s linear infinite;
          }
        `}</style>

        {/* Outer Rotating Ring */}
        <div
          className="absolute rounded-full border-t-transparent animate-spin-dynamic"
          style={{
            height: `${outerSize}px`,
            width: `${outerSize}px`,
            borderWidth: size < 40 ? "2px" : "4px",
            borderColor: `${colors.primary}20`,
            borderTopColor: colors.primary,
          }}
        />

        {/* Middle Ring - Only show if size is large enough */}
        {size >= 40 && (
          <div
            className="absolute rounded-full border-2 border-b-transparent animate-spin-reverse-dynamic opacity-60"
            style={{
              height: `${middleSize}px`,
              width: `${middleSize}px`,
              borderColor: `${colors.accent}40`,
              borderBottomColor: colors.accent,
            }}
          />
        )}

        {/* Inner Logo - Only show if size is large enough */}
        {size >= 60 ? (
          <div
            className="relative z-10 flex items-center justify-center rounded-full bg-white shadow-lg p-3 animate-pulse"
            style={{
              height: `${innerSize}px`,
              width: `${innerSize}px`,
            }}
          >
            <img
              src={mainLogoo}
              alt="Loading..."
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div
            className="relative z-10 flex items-center justify-center rounded-full animate-pulse"
            style={{
              height: `${innerSize}px`,
              width: `${innerSize}px`,
              backgroundColor: colors.primary + "10",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Loader;
