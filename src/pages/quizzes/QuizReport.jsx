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
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById } from "../../apis/quiz";
import { getUsers } from "../../apis/user";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

function QuizReport() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, usersRes] = await Promise.all([
          getQuizById(id),
          getUsers(),
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
    if (!quiz || !quiz.attempts) return [];

    // Map attempts to include extra data
    const attemptsWithData = quiz.attempts.map((attempt) => {
      const student = users.find((u) => u._id === attempt.studentId); // Assuming _id
      return {
        ...attempt,
        studentName: student?.fullName || student?.name || "Unknown Student",
        mobile: student?.phone || "N/A",
        quizCode: quiz.quizCode || "N/A",
        // Default duration if missing for dummy data
        duration: attempt.duration || Math.floor(Math.random() * 20) + 5,
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
  }, [quiz, users]);

  const filteredAttempts = processedAttempts.filter(
    (attempt) =>
      attempt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.mobile.includes(searchQuery),
  );

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!quiz) return null;

  const handleExportReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Quiz Performance Report", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Quiz Title: ${quiz.title}`, 14, 30);
    doc.text(`Quiz Code: ${quiz.quizCode || "N/A"}`, 14, 36);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 42);
    doc.text(`Total Attempts: ${quiz.attempts?.length || 0}`, 14, 48);

    if (filteredAttempts.length === 0) {
      toast.info("No attempts data available to export.");
      return;
    }

    // Table
    const tableColumn = [
      "Rank",
      "Student Name",
      "Mobile",
      "Quiz Code",
      "Marks",
      "Duration",
    ];
    const tableRows = filteredAttempts.map((attempt) => [
      `#${attempt.rank}`,
      attempt.studentName,
      attempt.mobile,
      attempt.quizCode,
      `${attempt.marks}/${attempt.totalMarks}`,
      `${attempt.duration}m`,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [66, 133, 244],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", fontStyle: "bold" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save(
      `Quiz_Report_${quiz.title.substring(0, 15).replace(/\s+/g, "_")}_${Date.now()}.pdf`,
    );
    toast.success("Report downloaded successfully!");
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
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Download size={18} /> Export Full Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Star className="text-yellow-500 mb-1" size={20} />
          <span
            className="text-[10px] font-bold opacity-60 uppercase"
            style={{ color: colors.text }}
          >
            Total Attempts
          </span>
          <span className="font-bold text-lg" style={{ color: colors.text }}>
            {processedAttempts.length}
          </span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Award className="text-green-500 mb-1" size={20} />
          <span
            className="text-[10px] font-bold opacity-60 uppercase"
            style={{ color: colors.text }}
          >
            Average Score
          </span>
          <span className="font-bold text-lg" style={{ color: colors.text }}>
            {processedAttempts.length > 0
              ? Math.round(
                  processedAttempts.reduce((acc, curr) => acc + curr.marks, 0) /
                    processedAttempts.length,
                )
              : 0}
          </span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Clock className="text-blue-500 mb-1" size={20} />
          <span
            className="text-[10px] font-bold opacity-60 uppercase"
            style={{ color: colors.text }}
          >
            Avg. Duration
          </span>
          <span className="font-bold text-lg" style={{ color: colors.text }}>
            {processedAttempts.length > 0
              ? Math.round(
                  processedAttempts.reduce(
                    (acc, curr) => acc + (curr.duration || 0),
                    0,
                  ) / processedAttempts.length,
                )
              : 0}
            m
          </span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Hash className="text-purple-500 mb-1" size={20} />
          <span
            className="text-[10px] font-bold opacity-60 uppercase"
            style={{ color: colors.text }}
          >
            Quiz Code
          </span>
          <span className="font-bold text-lg" style={{ color: colors.text }}>
            {quiz.quizCode || "N/A"}
          </span>
        </div>
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
                <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Rank
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Student Name
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Details
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Performance
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">
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
                    className="hover:bg-black/[0.01] transition-colors"
                  >
                    <td className="p-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          attempt.rank === 1
                            ? "bg-yellow-100 text-yellow-700"
                            : attempt.rank === 2
                              ? "bg-gray-100 text-gray-700"
                              : attempt.rank === 3
                                ? "bg-orange-100 text-orange-700"
                                : "bg-black/5 text-black/40"
                        }`}
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
                          className={`w-fit px-2 py-1 rounded text-[10px] font-black uppercase ${attempt.marks >= attempt.totalMarks * 0.5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {attempt.marks} / {attempt.totalMarks}
                        </span>
                        <span className="text-[9px] opacity-40 font-bold">
                          {Math.round(
                            (attempt.marks / attempt.totalMarks) * 100,
                          )}
                          % Accuracy
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/quizzes/report/${quiz._id}/result/${attempt.studentId}`,
                          )
                        }
                        className="p-2 rounded hover:bg-black/5 transition-all cursor-pointer text-blue-500"
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
