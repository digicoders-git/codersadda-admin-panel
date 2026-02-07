import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Layout,
  Award,
  Hash,
  Download,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById } from "../../apis/quiz";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import mainLogo from "../../assets/mainLogo.png";
import { toast } from "react-toastify";

function ViewQuiz() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await getQuizById(id);
        if (res.success && res.data) {
          setQuiz(res.data);
        } else {
          toast.error("Quiz not found");
          navigate("/dashboard/quizzes");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch quiz details");
        navigate("/dashboard/quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!quiz) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add Logo (Centered)
    const imgWidth = 40;
    const imgHeight = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;

    try {
      doc.addImage(mainLogo, "PNG", x, 10, imgWidth, imgHeight);
    } catch (e) {
      console.error("Logo add failed", e);
    }

    // Header Text
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DigiCoders Technologies", pageWidth / 2, 32, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Quiz: ${quiz.title}`, pageWidth / 2, 40, { align: "center" });

    doc.setFontSize(10);
    doc.text(
      `Duration: ${quiz.duration} mins  |  Total Marks: ${quiz.questions.length * quiz.points}`,
      pageWidth / 2,
      46,
      { align: "center" },
    );

    // Questions Table
    const tableColumn = ["Q.No", "Questions"];
    const tableRows = [];

    quiz.questions.forEach((q, index) => {
      // Format options neatly
      const optionsText = `
(A) ${q.options[0]}      (B) ${q.options[1]}
(C) ${q.options[2]}      (D) ${q.options[3]}`;

      const questionText = `${q.question}${optionsText}`;

      tableRows.push([index + 1, questionText]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 6,
        valign: "top",
        textColor: 20,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center", fontStyle: "bold" },
        1: { cellWidth: "auto" },
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });

    // Student Info Footer (Optional, for test paper feel)
    const finalY = doc.lastAutoTable.finalY || 60;
    if (finalY < 250) {
      doc.setFontSize(10);
      doc.text(
        "Student Name: __________________________   Score: ________",
        20,
        finalY + 20,
      );
    }

    doc.save(`${quiz.title.replace(/\s+/g, "_")}_TestPaper.pdf`);
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/quizzes")}
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
              View Quiz
            </h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
              Quiz Details & Questions
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer border hover:bg-black/5"
            style={{ borderColor: colors.accent + "30", color: colors.text }}
          >
            <Download size={18} /> Export PDF
          </button>
          <button
            onClick={() => navigate(`/dashboard/quizzes/report/${id}`)}
            className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <FileText size={18} /> View Attempt
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quiz Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-2"
            style={{ borderColor: colors.accent + "10" }}
          >
            <Hash size={20} className="opacity-40" />
            <span className="text-xs font-bold opacity-60 uppercase">Code</span>
            <span className="font-bold text-lg">{quiz.quizCode || "N/A"}</span>
          </div>
          <div
            className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-2"
            style={{ borderColor: colors.accent + "10" }}
          >
            <Layout size={20} className="opacity-40" />
            <span className="text-xs font-bold opacity-60 uppercase">
              Questions
            </span>
            <span className="font-bold text-lg">
              {quiz.questions?.length || 0}
            </span>
          </div>
          <div
            className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-2"
            style={{ borderColor: colors.accent + "10" }}
          >
            <Clock size={20} className="opacity-40" />
            <span className="text-xs font-bold opacity-60 uppercase">
              Duration
            </span>
            <span className="font-bold text-lg">{quiz.duration} m</span>
          </div>
          <div
            className="p-4 rounded border bg-black/5 flex flex-col items-center justify-center text-center gap-2"
            style={{ borderColor: colors.accent + "10" }}
          >
            <Award size={20} className="opacity-40" />
            <span className="text-xs font-bold opacity-60 uppercase">
              Points
            </span>
            <span className="font-bold text-lg">{quiz.points} / Q</span>
          </div>
        </div>

        {/* Description */}
        <div
          className="p-6 rounded border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-2">
            {quiz.title}
          </h3>
          <p className="text-sm opacity-80 leading-relaxed">
            {quiz.description}
          </p>
          <div className="mt-4 inline-block px-3 py-1 rounded text-xs font-bold uppercase bg-blue-100 text-blue-600">
            {quiz.level} Level
          </div>
        </div>

        {/* Questions List */}
        <div
          className="p-6 rounded border shadow-sm space-y-6"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
            <FileText size={16} /> All Questions
          </h3>

          <div className="space-y-4">
            {quiz.questions?.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded border bg-black/5 relative"
                style={{ borderColor: colors.accent + "10" }}
              >
                <div className="flex gap-3 mb-3">
                  <span className="text-sm font-black opacity-40">
                    Q{idx + 1}.
                  </span>
                  <p className="text-sm font-bold leading-relaxed">
                    {q.question}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                  {q.options.map((opt, oid) => (
                    <div
                      key={oid}
                      className={`text-xs px-3 py-2 rounded border flex items-center gap-2 ${
                        oid === q.correctOption
                          ? "bg-green-100 border-green-300 text-green-800 font-bold"
                          : "bg-white/40 border-black/5 opacity-70"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                          oid === q.correctOption
                            ? "border-green-600 bg-green-500 text-white"
                            : "border-black/20"
                        }`}
                      >
                        {["A", "B", "C", "D"][oid]}
                      </span>
                      {opt}
                      {oid === q.correctOption && (
                        <CheckCircle2 size={14} className="ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(!quiz.questions || quiz.questions.length === 0) && (
              <p className="text-center opacity-40 py-8 text-sm">
                No questions added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewQuiz;
