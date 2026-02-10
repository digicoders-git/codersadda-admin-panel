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
  School,
  User,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById, exportResultPDF } from "../../apis/quiz";
import { getUsers } from "../../apis/user";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function UserQuizResult() {
  const { colors } = useTheme();
  const { quizId, studentId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

          const userList = usersRes.success ? usersRes.data : [];
          const foundStudent = userList.find((u) => u._id === studentId);
          setStudent(foundStudent);

          const foundAttempt = foundQuiz.attempts?.find(
            (a) => (a.studentId?._id || a.studentId) === studentId,
          );

          if (foundAttempt) {
            setAttempt({
              ...foundAttempt,
              studentName:
                foundStudent?.fullName ||
                foundStudent?.name ||
                "Unknown Student",
              mobile: foundStudent?.mobile || foundStudent?.phone || "N/A",
              college: foundStudent?.college || "N/A",
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

  const questions = useMemo(() => {
    if (!quiz?.questionTopicId?.questions) return [];
    return quiz.questionTopicId.questions.map((q) => {
      const optionsArr = [q.options.a, q.options.b, q.options.c, q.options.d];
      const correctIdx = ["a", "b", "c", "d"].indexOf(
        q.correctAnswer.toLowerCase(),
      );
      return {
        ...q,
        id: q._id?.toString() || q._id || q.id,
        options: optionsArr,
        correctOption: correctIdx !== -1 ? correctIdx : 0,
      };
    });
  }, [quiz]);

  const attemptStats = useMemo(() => {
    if (!questions.length || !attempt)
      return { attempted: 0, notAttempted: 0, correct: 0, wrong: 0 };

    let attempted = 0;
    let correct = 0;
    let wrong = 0;

    questions.forEach((q) => {
      const studentAnsObj = attempt.answers?.find(
        (ans) =>
          String(ans.questionId) === String(q._id) ||
          String(ans.questionId) === String(q.id),
      );

      const charToIdx = { a: 0, b: 1, c: 2, d: 3 };
      const studentOptionIndex = studentAnsObj
        ? (charToIdx[studentAnsObj.selectedOption?.toLowerCase()] ?? -1)
        : -1;

      if (studentOptionIndex !== -1) {
        attempted++;
        if (studentOptionIndex === q.correctOption) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    return {
      total: questions.length,
      attempted,
      notAttempted: questions.length - attempted,
      correct,
      wrong,
    };
  }, [questions, attempt]);

  const rankData = useMemo(() => {
    if (!quiz || !quiz.attempts) return { rank: "N/A", total: 0 };

    const sorted = [...quiz.attempts].sort((a, b) => {
      if (b.marks !== a.marks) return b.marks - a.marks;
      return (a.duration || 0) - (b.duration || 0);
    });

    const index = sorted.findIndex(
      (a) => (a.studentId?._id || a.studentId) === studentId,
    );
    return {
      rank: index !== -1 ? index + 1 : "N/A",
      total: sorted.length,
    };
  }, [quiz, studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader size={80} />
      </div>
    );
  }

  if (!quiz || !attempt) return null;

  const handleExportResult = async () => {
    try {
      setIsExporting(true);
      const response = await exportResultPDF(quizId, studentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Result_${attempt.studentName.replace(/\s+/g, "_")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Result PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF result");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto text-current">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/dashboard/quizzes/report/${quizId}`)}
            className="p-2 rounded transition-all cursor-pointer border hover:bg-black/5"
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
              Detailed Quiz Result
            </h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
              Review performance metrics
            </p>
          </div>
        </div>
        <button
          onClick={handleExportResult}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all cursor-pointer border disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ borderColor: colors.accent + "30", color: colors.text }}
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isExporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Student Profile Card */}
        <div
          className="lg:col-span-1 p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div
            className="flex items-center gap-4 pb-4 border-b"
            style={{ borderColor: colors.accent + "10" }}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: colors.text }}>
                {attempt.studentName}
              </h2>
              <p className="text-xs font-bold opacity-40 uppercase tracking-tighter">
                Student Information
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone size={14} className="opacity-40" />
              <span className="text-sm font-semibold">{attempt.mobile}</span>
            </div>
            <div className="flex items-center gap-3">
              <School size={14} className="opacity-40" />
              <span className="text-sm font-semibold">{attempt.college}</span>
            </div>
            {/* <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded bg-black/5 text-[10px] font-bold uppercase tracking-widest">
                ID: {studentId.slice(-6).toUpperCase()}
              </span>
            </div> */}
          </div>
        </div>

        {/* Performance Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            {
              icon: Star,
              label: "Rank",
              value: `#${rankData.rank}`,
              color: "#f59e0b",
            },
            {
              icon: Award,
              label: "Score",
              value: `${attempt.marks}/${attempt.totalMarks}`,
              color: "#10b981",
            },
            {
              icon: ListChecks,
              label: "Attempted",
              value: attemptStats.attempted,
              color: "#6366f1",
            },
            {
              icon: XCircle,
              label: "Skipped",
              value: attemptStats.notAttempted,
              color: "#94a3b8",
            },
            {
              icon: CheckCircle,
              label: "Correct",
              value: attemptStats.correct,
              color: "#22c55e",
            },
            {
              icon: XCircle,
              label: "Wrong",
              value: attemptStats.wrong,
              color: "#ef4444",
            },
            {
              icon: Clock,
              label: "Time Taken",
              value: `${attempt.duration}m`,
              color: "#f43f5e",
            },
            {
              icon: ListChecks,
              label: "Accuracy",
              value: `${Math.round((attempt.marks / attempt.totalMarks) * 100)}%`,
              color: "#8b5cf6",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-1"
              style={{ borderColor: colors.accent + "10" }}
            >
              <stat.icon
                size={18}
                style={{ color: stat.color }}
                className="opacity-70 mb-1"
              />
              <span className="text-[10px] font-bold opacity-50 uppercase">
                {stat.label}
              </span>
              <span
                className="font-bold text-lg"
                style={{ color: colors.text }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
          <ListChecks size={18} /> Question Review
        </h3>
        {questions.map((q, index) => {
          const studentAnsObj = attempt.answers?.find(
            (ans) =>
              String(ans.questionId) === String(q._id) ||
              String(ans.questionId) === String(q.id),
          );

          const charToIdx = { a: 0, b: 1, c: 2, d: 3 };
          const studentOptionIndex = studentAnsObj
            ? (charToIdx[studentAnsObj.selectedOption?.toLowerCase()] ?? -1)
            : -1;

          const isAttempted = studentOptionIndex !== -1;
          const isCorrect =
            isAttempted && studentOptionIndex === q.correctOption;

          return (
            <div
              key={q.id}
              className="p-6 rounded border shadow-sm transition-all"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "10",
                borderLeftWidth: "4px",
                borderLeftColor: !isAttempted
                  ? "#9ca3af"
                  : isCorrect
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              <div className="flex gap-4">
                <span
                  className={`text-lg font-black ${!isAttempted ? "text-gray-400" : isCorrect ? "text-green-500" : "text-red-500"}`}
                >
                  Q{index + 1}.
                </span>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className="text-sm font-bold leading-relaxed"
                      style={{ color: colors.text }}
                    >
                      {q.question}
                    </h3>
                    <div className="shrink-0">
                      {!isAttempted ? (
                        <span className="text-[9px] px-2 py-1 rounded bg-gray-100 text-gray-500 font-black uppercase tracking-widest">
                          Not Attempted
                        </span>
                      ) : isCorrect ? (
                        <span className="text-[9px] px-2 py-1 rounded bg-green-100 text-green-700 font-black uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle size={10} /> Correct
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-1 rounded bg-red-100 text-red-700 font-black uppercase tracking-widest flex items-center gap-1">
                          <XCircle size={10} /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isCorrectOpt = optIdx === q.correctOption;
                      const isStudentOpt = optIdx === studentOptionIndex;

                      let variantStyle = "bg-white border-black/5 opacity-60";
                      if (isCorrectOpt)
                        variantStyle =
                          "bg-green-100 border-green-300 text-green-800 font-bold opacity-100";
                      if (isStudentOpt && !isCorrect)
                        variantStyle =
                          "bg-red-100 border-red-300 text-red-800 font-bold opacity-100";

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded border flex items-center justify-between text-xs transition-all ${variantStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center border font-bold ${isCorrectOpt ? "bg-green-500 text-white border-green-600" : "bg-black/5 border-black/10 opacity-40"}`}
                            >
                              {["A", "B", "C", "D"][optIdx]}
                            </span>
                            <span>{opt}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isCorrectOpt && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500 text-white font-bold uppercase">
                                Answer
                              </span>
                            )}
                            {isStudentOpt && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded ${isCorrect ? "bg-green-600" : "bg-red-500"} text-white font-bold uppercase`}
                              >
                                {isCorrect ? "Correct" : "Wrong"}
                              </span>
                            )}
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
