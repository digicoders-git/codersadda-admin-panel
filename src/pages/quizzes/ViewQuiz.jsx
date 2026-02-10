import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Layout,
  Award,
  Hash,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById } from "../../apis/quiz";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import mainLogo from "../../assets/mainLogo.png";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import CertificatePreviewCanvas from "../../components/CertificatePreviewCanvas";

function ViewQuiz() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showFullCert, setShowFullCert] = useState(false);

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

  const questions = useMemo(() => {
    if (!quiz?.questionTopicId?.questions) return [];
    return quiz.questionTopicId.questions.map((q) => {
      const optionsArr = [q.options.a, q.options.b, q.options.c, q.options.d];
      const correctIdx = ["a", "b", "c", "d"].indexOf(
        q.correctAnswer.toLowerCase(),
      );
      return {
        ...q,
        options: optionsArr,
        correctOption: correctIdx !== -1 ? correctIdx : 0,
      };
    });
  }, [quiz]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader size={80} />
      </div>
    );
  }

  if (!quiz) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;

    try {
      doc.addImage(mainLogo, "PNG", x, 10, imgWidth, imgHeight);
    } catch (e) {
      console.error("Logo add failed", e);
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DigiCoders Technologies", pageWidth / 2, 32, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Quiz: ${quiz.title}`, pageWidth / 2, 40, { align: "center" });

    doc.setFontSize(10);
    doc.text(
      `Duration: ${quiz.duration} mins  |  Total Marks: ${questions.length * quiz.points}`,
      pageWidth / 2,
      46,
      { align: "center" },
    );

    const tableColumn = ["Q.No", "Questions"];
    const tableRows = questions.map((q, index) => [
      index + 1,
      `${q.question}\n(A) ${q.options[0]}      (B) ${q.options[1]}\n(C) ${q.options[2]}      (D) ${q.options[3]}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
    });

    doc.save(`${quiz.title.replace(/\s+/g, "_")}_TestPaper.pdf`);
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/quizzes")}
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
              View Quiz Details
            </h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
              Review and preview content
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all cursor-pointer border"
            style={{ borderColor: colors.accent + "30", color: colors.text }}
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={() => navigate(`/dashboard/quizzes/report/${id}`)}
            className="flex items-center gap-2 px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <FileText size={16} /> Attempts
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Hash, label: "Code", value: quiz.quizCode },
            { icon: Layout, label: "Questions", value: questions.length },
            { icon: Clock, label: "Duration", value: `${quiz.duration} m` },
            { icon: Award, label: "Points", value: `${quiz.points} / Q` },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded border bg-black/5 flex flex-col gap-1 items-center justify-center text-center"
              style={{ borderColor: colors.accent + "10" }}
            >
              <stat.icon size={18} className="opacity-40 mb-1" />
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

        {/* Basic Info */}
        <div
          className="p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>
              {quiz.title}
            </h3>
            <p className="text-sm opacity-70 mt-1">{quiz.description}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-600">
              {quiz.level}
            </span>
            {quiz.questionTopicId && (
              <span className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-600">
                Topic: {quiz.questionTopicId.topicName}
              </span>
            )}
          </div>
        </div>

        {/* Certificate Section */}
        {quiz.certificateTemplate ? (
          <div
            className="p-6 rounded border shadow-sm space-y-4"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-sm font-black uppercase tracking-[2px]"
                  style={{ color: colors.textSecondary }}
                >
                  Quiz Certificate
                </h3>
                <p className="text-xs opacity-50 mt-1 font-bold">
                  Template: {quiz.certificateTemplate.certificateName}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate("/dashboard/quizzes/generate-certificate", {
                    state: { quizId: id },
                  })
                }
                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
                style={{ color: colors.primary }}
              >
                Edit Design
              </button>
            </div>

            <div
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-black/5 max-w-md mx-auto aspect-3/2 shadow-md hover:shadow-xl transition-all"
              onClick={() => setShowFullCert(true)}
            >
              <CertificatePreviewCanvas
                template={quiz.certificateTemplate}
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                <Maximize2 size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Click to View Full
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="p-8 rounded border border-dashed text-center space-y-4"
            style={{
              borderColor: colors.accent + "20",
              backgroundColor: colors.sidebar || colors.background,
            }}
          >
            <Award size={48} className="mx-auto opacity-10" />
            <div>
              <p className="text-sm font-bold opacity-40 uppercase tracking-widest">
                No Certificate Linked
              </p>
              <p className="text-[10px] opacity-30 mt-1">
                Students will not receive a certificate for this quiz.
              </p>
            </div>
            <button
              onClick={() =>
                navigate("/dashboard/quizzes/generate-certificate", {
                  state: { quizId: id },
                })
              }
              className="px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: colors.primary }}
            >
              Create Certificate
            </button>
          </div>
        )}

        {/* Questions Section - Toggleable */}
        <div
          className="rounded border overflow-hidden shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div
            className="p-4 flex items-center justify-between cursor-pointer border-b"
            style={{ borderColor: colors.accent + "10" }}
            onClick={() => setShowQuestions(!showQuestions)}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className="opacity-40" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
                  All Questions
                </h3>
                {quiz.questionTopicId && (
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">
                    Topic: {quiz.questionTopicId.topicName} ({questions.length})
                  </p>
                )}
              </div>
            </div>
            {showQuestions ? (
              <ChevronUp size={20} className="opacity-40" />
            ) : (
              <ChevronDown size={20} className="opacity-40" />
            )}
          </div>

          {showQuestions && (
            <div className="p-6 space-y-6">
              {questions.length > 0 ? (
                questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded border bg-black/5"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <div className="flex gap-3 mb-4">
                      <span className="text-sm font-bold opacity-40">
                        Q{idx + 1}.
                      </span>
                      <p
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {q.question}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                      {q.options.map((opt, oid) => (
                        <div
                          key={oid}
                          className={`text-xs px-3 py-2 rounded border flex items-center gap-3 ${
                            oid === q.correctOption
                              ? "bg-green-100 border-green-300 text-green-800"
                              : "bg-white border-black/5 opacity-80"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                              oid === q.correctOption
                                ? "border-green-600 bg-green-500 text-white"
                                : "border-black/20"
                            }`}
                          >
                            {["A", "B", "C", "D"][oid]}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-40">
                  <p className="text-sm">No questions found for this topic.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Preview Modal */}
      {showFullCert && quiz.certificateTemplate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowFullCert(false)}
          />

          <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setShowFullCert(false)}
              className="absolute -top-12 right-0 md:top-2 md:-right-12 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10 cursor-pointer shadow-xl"
            >
              <X size={24} />
            </button>
            <div className="rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden bg-white flex items-center justify-center">
              <CertificatePreviewCanvas
                template={quiz.certificateTemplate}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewQuiz;
