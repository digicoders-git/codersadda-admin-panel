import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Construction, IndianRupee } from "lucide-react";

function Salary() {
  const { colors } = useTheme();

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8">
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: colors.primary + "20",
            color: colors.primary,
          }}
        >
          <IndianRupee size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Salary Information
          </h1>
          <p
            className="text-sm opacity-60"
            style={{ color: colors.textSecondary }}
          >
            View your payment details
          </p>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg"
        style={{
          borderColor: colors.accent + "30",
          backgroundColor: colors.sidebar || colors.background,
        }}
      >
        <Construction
          size={64}
          style={{ color: colors.primary, opacity: 0.3 }}
        />
        <h2
          className="text-xl font-bold mt-6 mb-2"
          style={{ color: colors.text }}
        >
          Salary System Under Development
        </h2>
        <p
          className="text-sm opacity-60 text-center max-w-md"
          style={{ color: colors.textSecondary }}
        >
          The instructor salary management system is currently being developed.
          <br />
          This feature will allow you to view your salary details and payment
          history.
        </p>
      </div>
    </div>
  );
}

export default Salary;
