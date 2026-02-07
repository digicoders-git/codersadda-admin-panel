import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Hash,
  Phone,
  Clock,
  Award,
  Star,
  ListChecks,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById } from "../../apis/quiz";
import { getUsers } from "../../apis/user";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

function UserQuizResult() {
  const { colors } = useTheme();
  const { quizId, studentId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, usersRes] = await Promise.all([
          getQuizById(quizId),
          getUsers(),
        ]);

        if (quizRes.success) {
          const foundQuiz = quizRes.data;
          setQuiz(foundQuiz);

          // Assume usersRes is fetched to populate student details
          // If the user attempts list already has student data, good.
          // If not, we find it from users list.
          const userList = usersRes.success ? usersRes.data : [];
          setUsers(userList);

          const foundAttempt = foundQuiz.attempts?.find(
            (a) => a.studentId === studentId,
          );

          if (foundAttempt) {
            const student = userList.find((u) => u._id === studentId); // Assuming _id
            setAttempt({
              ...foundAttempt,
              studentName:
                student?.fullName || student?.name || "Unknown Student",
              mobile: student?.phone || "N/A",
              quizCode: foundQuiz.quizCode || "N/A",
              duration: foundAttempt.duration || 0,
            });
          } else {
            toast.error("Attempt not found");
            navigate(`/dashboard/quizzes/report/${quizId}`);
          }
        } else {
          toast.error("Quiz not found");
          navigate("/dashboard/quizzes");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch result data");
        navigate("/dashboard/quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, studentId, navigate]);

  const rankData = useMemo(() => {
    if (!quiz || !quiz.attempts) return { rank: "N/A", total: 0 };

    const sorted = [...quiz.attempts].sort((a, b) => {
      if (b.marks !== a.marks) return b.marks - a.marks;
      return (a.duration || 0) - (b.duration || 0);
    });

    const index = sorted.findIndex((a) => a.studentId === studentId);
    return {
      rank: index !== -1 ? index + 1 : "N/A",
      total: sorted.length,
    };
  }, [quiz, studentId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!quiz || !attempt) return null;

  const handleExportResult = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Quiz Result: ${quiz.title}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Student Name: ${attempt.studentName}`, 14, 30);
    doc.text(`Mobile: ${attempt.mobile}`, 14, 36);
    doc.text(`Quiz Code: ${attempt.quizCode}`, 14, 42);
    doc.text(`Rank: #${rankData.rank} out of ${rankData.total}`, 14, 48);
    doc.text(`Score: ${attempt.marks} / ${attempt.totalMarks}`, 14, 54);
    doc.text(`Duration: ${attempt.duration} mins`, 14, 60);

    let yPos = 75;

    quiz.questions.forEach((q, index) => {
      const studentAnsObj = attempt.answers?.find(
        (ans) => ans.questionId === q.id,
      );
      const studentOptionIndex = studentAnsObj
        ? studentAnsObj.selectedOption
        : -1;
      const isCorrect = studentOptionIndex === q.correctOption;

      // Page break check
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Q${index + 1}: ${q.question}`, 14, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      q.options.forEach((opt, optIdx) => {
        let prefix = "  [ ] ";
        if (optIdx === q.correctOption) {
          prefix = "  [Tick] ";
          doc.setTextColor(0, 150, 0);
        }
        if (optIdx === studentOptionIndex && !isCorrect) {
          prefix = "  [X] ";
          doc.setTextColor(200, 0, 0);
        }

        doc.text(`${prefix}${opt}`, 20, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 6;
      });

      yPos += 2;
      doc.setFont("helvetica", "italic");
      if (studentOptionIndex === -1) {
        doc.text("Result: Not Attempted", 20, yPos);
      } else if (!isCorrect) {
        doc.setTextColor(200, 0, 0);
        doc.text(
          `Result: Incorrect (Selected: ${["A", "B", "C", "D"][studentOptionIndex]}, Correct: ${["A", "B", "C", "D"][q.correctOption]})`,
          20,
          yPos,
        );
      } else {
        doc.setTextColor(0, 150, 0);
        doc.text(`Result: Correct`, 20, yPos);
      }
      doc.setTextColor(0, 0, 0);
      yPos += 12;
    });

    doc.save(
      `Result_${attempt.studentName.replace(/\s+/g, "_")}_${quiz.title.replace(/\s+/g, "_")}.pdf`,
    );
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/dashboard/quizzes/report/${quizId}`)}
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
              Detailed Result
            </h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
              {attempt.studentName} • {quiz.title}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportResult}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Download size={18} /> Export Result PDF
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Star className="text-yellow-500 mb-1" size={20} />
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Rank
          </span>
          <span className="font-bold text-lg">#{rankData.rank}</span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Award className="text-green-500 mb-1" size={20} />
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Score
          </span>
          <span className="font-bold text-lg">
            {attempt.marks} / {attempt.totalMarks}
          </span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Phone className="text-blue-500 mb-1" size={20} />
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Mobile
          </span>
          <span className="font-bold text-xs">{attempt.mobile}</span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Hash className="text-purple-500 mb-1" size={20} />
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Quiz Code
          </span>
          <span className="font-bold text-xs">{attempt.quizCode}</span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <Clock className="text-orange-500 mb-1" size={20} />
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Duration
          </span>
          <span className="font-bold text-lg">{attempt.duration}m</span>
        </div>
        <div
          className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
          style={{ borderColor: colors.accent + "10" }}
        >
          <ListChecks className="text-cyan-500 mb-1" size={20} />
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Accuracy
          </span>
          <span className="font-bold text-lg">
            {Math.round((attempt.marks / attempt.totalMarks) * 100)}%
          </span>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        {quiz.questions.map((q, index) => {
          const studentAnsObj = attempt.answers.find(
            (ans) => ans.questionId === q.id,
          );
          const studentOptionIndex = studentAnsObj
            ? studentAnsObj.selectedOption
            : -1;
          const isCorrect = studentOptionIndex === q.correctOption;

          return (
            <div
              key={q.id}
              className="p-6 rounded border shadow-sm transition-all"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: isCorrect
                  ? "rgba(34, 197, 94, 0.4)"
                  : "rgba(239, 68, 68, 0.4)",
                borderLeftWidth: "4px",
              }}
            >
              <div className="flex gap-4">
                <span
                  className={`text-lg font-black ${isCorrect ? "text-green-500" : "text-red-500"}`}
                >
                  Q{index + 1}.
                </span>
                <div className="flex-1 space-y-4">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    {q.question}
                  </h3>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      let optionStyle = {
                        borderColor: colors.accent + "20",
                        opacity: 0.7,
                      };
                      let icon = null;

                      if (optIdx === q.correctOption) {
                        optionStyle = {
                          borderColor: "#22c55e",
                          backgroundColor: "#22c55e10",
                          color: "#15803d",
                          fontWeight: "bold",
                        };
                        icon = (
                          <CheckCircle size={16} className="text-green-600" />
                        );
                      }
                      if (optIdx === studentOptionIndex && !isCorrect) {
                        optionStyle = {
                          borderColor: "#ef4444",
                          backgroundColor: "#ef444410",
                          color: "#b91c1c",
                          fontWeight: "bold",
                        };
                        icon = <XCircle size={16} className="text-red-600" />;
                      }

                      return (
                        <div
                          key={optIdx}
                          className="p-3 rounded border flex items-center justify-between"
                          style={optionStyle}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold opacity-40">
                              {["A", "B", "C", "D"][optIdx]}.
                            </span>
                            <span className="text-sm">{opt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {optIdx === q.correctOption && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500 text-white font-bold uppercase tracking-wider">
                                Correct Answer
                              </span>
                            )}
                            {optIdx === studentOptionIndex && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isCorrect ? "bg-blue-500" : "bg-red-500"} text-white`}
                              >
                                Your Answer
                              </span>
                            )}
                            {icon}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserQuizResult;
