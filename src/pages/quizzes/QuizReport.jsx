import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  Search,
  FileText,
  Hash,
  Phone,
  Clock,
  Award,
  Star,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getQuizById,
  getAttemptsByQuiz,
  exportReportExcel,
} from "../../apis/quiz";
import { getUsers } from "../../apis/user";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function QuizReport() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, usersRes, attemptsRes] = await Promise.all([
          getQuizById(id),
          getUsers(),
          getAttemptsByQuiz(id),
        ]);

        if (quizRes.success) {
          setQuiz(quizRes.data);
        } else {
          toast.error("Quiz not found");
          navigate("/dashboard/quizzes");
          return;
        }

        if (usersRes.success) {
          setUsers(usersRes.data);
        }

        if (attemptsRes.success) {
          setAttempts(attemptsRes.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load report data");
        navigate("/dashboard/quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const processedAttempts = useMemo(() => {
    if (!quiz || !attempts) return [];

    // Map attempts to include extra data
    const attemptsWithData = attempts.map((attempt) => {
      // studentId is populated object from backend
      const student = attempt.studentId;
      return {
        ...attempt,
        studentName: student?.fullName || student?.name || "Unknown Student",
        mobile: student?.mobile || student?.phone || "N/A",
        quizCode: quiz.quizCode || "N/A",
        // Default duration if missing for dummy data
        duration: attempt.duration || 0,
      };
    });

    // Sort: Marks DESC, Duration ASC
    const sorted = attemptsWithData.sort((a, b) => {
      if (b.marks !== a.marks) {
        return b.marks - a.marks;
      }
      return a.duration - b.duration;
    });

    // Assign Rank
    return sorted.map((attempt, index) => ({
      ...attempt,
      rank: index + 1,
    }));
  }, [quiz, attempts]);

  const filteredAttempts = processedAttempts.filter(
    (attempt) =>
      attempt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.mobile.includes(searchQuery),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader size={80} />
      </div>
    );
  }
  if (!quiz) return null;

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      const response = await exportReportExcel(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Quiz_Report_${quiz.title.replace(/\s+/g, "_")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel report downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded transition-all cursor-pointer border"
            style={{
              color: colors.text,
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Quiz Report
            </h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
              {quiz.title}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportReport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.text, color: colors.background }}
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isExporting ? "Exporting..." : "Export Full Report"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Attempts",
            value: processedAttempts.length,
            icon: <Star size={20} className="text-yellow-500" />,
          },
          {
            label: "Average Score",
            value:
              processedAttempts.length > 0
                ? Math.round(
                    processedAttempts.reduce(
                      (acc, curr) => acc + curr.marks,
                      0,
                    ) / processedAttempts.length,
                  )
                : 0,
            icon: <Award size={20} className="text-green-500" />,
          },
          {
            label: "Avg. Duration",
            value:
              (processedAttempts.length > 0
                ? Math.round(
                    processedAttempts.reduce(
                      (acc, curr) => acc + (curr.duration || 0),
                      0,
                    ) / processedAttempts.length,
                  )
                : 0) + "m",
            icon: <Clock size={20} className="text-blue-500" />,
          },
          {
            label: "Quiz Code",
            value: quiz.quizCode || "N/A",
            icon: <Hash size={20} className="text-purple-500" />,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 rounded border flex flex-col items-center justify-center text-center gap-1"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "15",
            }}
          >
            {item.icon}
            <span
              className="text-[10px] font-bold opacity-60 uppercase mt-1"
              style={{ color: colors.textSecondary }}
            >
              {item.label}
            </span>
            <span className="font-bold text-lg" style={{ color: colors.text }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            size={18}
          />
          <input
            type="text"
            placeholder="Search student or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded border overflow-hidden shadow-sm"
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "20",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{
                  backgroundColor: colors.accent + "05",
                  borderBottom: `1px solid ${colors.accent}15`,
                }}
              >
                <th
                  className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Rank
                </th>
                <th
                  className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Student Name
                </th>
                <th
                  className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Details
                </th>
                <th
                  className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Performance
                </th>
                <th
                  className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right"
                  style={{ color: colors.text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: colors.accent + "10" }}
            >
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt) => (
                  <tr
                    key={`${attempt.studentId}-${attempt.rank}`}
                    className="transition-colors hover:bg-white/5"
                    style={{ borderBottom: `1px solid ${colors.accent}10` }}
                  >
                    <td className="p-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all`}
                        style={{
                          backgroundColor:
                            attempt.rank === 1
                              ? "#fef3c7"
                              : attempt.rank === 2
                                ? "#f3f4f6"
                                : attempt.rank === 3
                                  ? "#ffedd5"
                                  : colors.accent + "10",
                          color:
                            attempt.rank === 1
                              ? "#b45309"
                              : attempt.rank === 2
                                ? "#374151"
                                : attempt.rank === 3
                                  ? "#c2410c"
                                  : colors.textSecondary,
                        }}
                      >
                        {attempt.rank}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-sm"
                          style={{ color: colors.text }}
                        >
                          {attempt.studentName}
                        </span>
                        <div className="flex items-center gap-2 opacity-50">
                          <Phone size={10} />
                          <span className="text-[10px] font-semibold">
                            {attempt.mobile}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 opacity-70">
                          <Hash size={10} />
                          <span className="text-[10px] font-bold">
                            {quiz.quizCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-70">
                          <Clock size={10} />
                          <span className="text-[10px] font-bold">
                            {attempt.duration}m duration
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`w-fit px-2 py-1 rounded text-[10px] font-black uppercase`}
                          style={{
                            backgroundColor:
                              attempt.marks >= attempt.totalMarks * 0.5
                                ? "rgba(34, 197, 94, 0.1)"
                                : "rgba(239, 68, 68, 0.1)",
                            color:
                              attempt.marks >= attempt.totalMarks * 0.5
                                ? "#22c55e"
                                : "#ef4444",
                          }}
                        >
                          {attempt.marks} / {attempt.totalMarks}
                        </span>
                        <span className="text-[9px] opacity-40 font-bold">
                          % Accuracy
                        </span>
                        {attempt.certificateGenerated && (
                          <div className="flex items-center gap-1 mt-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle size={10} />
                            <span className="text-[9px] font-bold uppercase tracking-wide">
                              Certificate Generated
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/quizzes/report/${quiz._id}/result/${attempt.studentId}`,
                          )
                        }
                        className="p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-all cursor-pointer text-blue-500"
                        title="View Detailed Result"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center opacity-30 font-bold uppercase tracking-widest text-xs"
                  >
                    No attempts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default QuizReport;
