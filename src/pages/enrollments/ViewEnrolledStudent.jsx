import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { ArrowLeft, Construction } from "lucide-react";

function ViewEnrolledStudent() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg transition-all cursor-pointer border"
          style={{
            color: colors.text,
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Student Enrollment Details
        </h1>
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
          Enrollment Details Under Development
        </h2>
        <p
          className="text-sm opacity-60 text-center max-w-md"
          style={{ color: colors.textSecondary }}
        >
          The student enrollment details view is currently being developed.
          <br />
          This feature will allow you to view comprehensive information about
          student enrollments.
        </p>
      </div>
    </div>
  );
}

export default ViewEnrolledStudent;
