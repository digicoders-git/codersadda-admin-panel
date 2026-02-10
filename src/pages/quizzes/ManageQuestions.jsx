import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  FileSpreadsheet,
  Download,
  X,
  FileQuestion,
  HelpCircle,
  Edit,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getTopicById, updateTopic } from "../../apis/questionTopic";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Loader from "../../components/Loader";

function ManageQuestions() {
  const { id } = useParams();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: { a: "", b: "", c: "", d: "" },
    correctAnswer: "a",
  });

  const fetchTopicDetails = async () => {
    try {
      setLoading(true);
      const res = await getTopicById(id);
      if (res.success) {
        setTopic(res.data);
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      toast.error("Failed to load topic details");
      navigate("/dashboard/quizzes/topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicDetails();
  }, [id]);

  const handleAddManual = () => {
    if (
      !currentQuestion.question.trim() ||
      !currentQuestion.options.a.trim() ||
      !currentQuestion.options.b.trim() ||
      !currentQuestion.options.c.trim() ||
      !currentQuestion.options.d.trim()
    ) {
      return toast.warning("Please fill question and all 4 options");
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = {
        ...currentQuestion,
        tempId: questions[editingIndex].tempId,
      };
      setQuestions(updated);
      setEditingIndex(null);
      toast.success("Question updated in list");
    } else {
      const newQuestion = {
        ...currentQuestion,
        tempId: Date.now() + Math.random(),
      };
      setQuestions([...questions, newQuestion]);
      toast.success("Question added to list");
    }

    // Reset form
    setCurrentQuestion({
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      correctAnswer: "a",
    });
  };

  const handleEditQuestion = (idx) => {
    setEditingIndex(idx);
    setCurrentQuestion({ ...questions[idx] });
    // Scroll to top to see the edit form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        Question: "Example: What is the capital of France?",
        "Option A": "Paris",
        "Option B": "London",
        "Option C": "Berlin",
        "Option D": "Madrid",
        "Correct Answer": "A",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "question_template.xlsx");
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) return toast.warning("File is empty");

        const parsed = data.map((row) => ({
          tempId: Math.random().toString(16),
          question: row["Question"] || "Untitled",
          options: {
            a: String(row["Option A"] || ""),
            b: String(row["Option B"] || ""),
            c: String(row["Option C"] || ""),
            d: String(row["Option D"] || ""),
          },
          correctAnswer: String(row["Correct Answer"] || "a")
            .toLowerCase()
            .trim(),
        }));

        setQuestions([...questions, ...parsed]);
        toast.success(`Parsed ${parsed.length} questions from excel!`);
      } catch (err) {
        toast.error("Invalid Excel format");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input
  };

  const handleSave = async () => {
    if (questions.length === 0)
      return toast.warning("Please add at least one question");

    try {
      setLoading(true);
      // Remove tempId before sending to backend
      const cleanQuestions = questions.map(({ tempId, ...rest }) => ({
        ...rest,
        // Ensure options are strings
        options: {
          a: String(rest.options.a),
          b: String(rest.options.b),
          c: String(rest.options.c),
          d: String(rest.options.d),
        },
      }));

      const res = await updateTopic(id, { questions: cleanQuestions });
      if (res.success) {
        toast.success("All questions saved successfully!");
        navigate("/dashboard/quizzes/topics");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save questions");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto scrollbar-hide relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
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
            Manage Questions
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Topic: {topic ? topic.topicName : "Loading..."}
          </p>
        </div>
      </div>

      {!topic && loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader size={100} />
        </div>
      ) : (
        <div className="max-w-full space-y-6 animate-in fade-in duration-500">
          {/* Main Interface Box */}
          <div
            className="p-8 rounded border shadow-sm space-y-8"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            {/* Top Section: Title & Excel Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3
                  className="text-sm font-bold uppercase tracking-wider opacity-80"
                  style={{ color: colors.text }}
                >
                  QUESTIONS ({questions.length})
                </h3>
                <p
                  className="text-[10px] opacity-60 uppercase tracking-widest font-bold"
                  style={{ color: colors.textSecondary }}
                >
                  Questions are added unlimited
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="px-4 py-2 rounded border-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
                  style={{
                    borderColor: colors.primary + "30",
                    color: colors.primary,
                  }}
                >
                  <Download size={16} /> Sample Excel
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
                    style={{ backgroundColor: colors.primary, color: colors.background }}
                  >
                    <FileSpreadsheet size={16} /> Upload Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Add Box (Dashed) */}
            <div
              className="p-6 rounded border-2 border-dashed"
              style={{
                borderColor: colors.accent + "30",
                backgroundColor: colors.background + "50",
              }}
            >
              <h4
                className="text-[10px] items-center font-bold uppercase tracking-widest mb-6 opacity-80 flex gap-2"
                style={{ color: colors.text }}
              >
                <Plus size={14} /> Add Question manually
              </h4>

              <div className="space-y-6">
                {/* Question Input */}
                <div>
                  <textarea
                    rows={2}
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        question: e.target.value,
                      })
                    }
                    placeholder="Enter question text here..."
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all resize-none"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["a", "b", "c", "d"].map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                          currentQuestion.correctAnswer === key
                            ? "bg-green-500 text-white border-green-500"
                            : "opacity-40"
                        }`}
                        style={{
                          cursor: "default",
                          borderColor:
                            currentQuestion.correctAnswer === key
                              ? "transparent"
                              : colors.accent + "30",
                        }}
                      >
                        {key.toUpperCase()}
                      </div>
                      <input
                        type="text"
                        value={currentQuestion.options[key]}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: {
                              ...currentQuestion.options,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Option ${key.toUpperCase()}`}
                        className="flex-1 px-4 py-2.5 rounded border outline-none text-xs font-semibold"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "20",
                          color: colors.text,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Selection & Button */}
                <div
                  className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-dashed"
                  style={{ borderColor: colors.accent + "20" }}
                >
                  <div className="flex flex-col gap-2">
                    <span style={labelStyle}>Choose Correct Answer</span>
                    <div className="flex flex-wrap gap-6">
                      {["a", "b", "c", "d"].map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === key}
                            onChange={() =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                correctAnswer: key,
                              })
                            }
                            className="w-4 h-4 cursor-pointer accent-green-600"
                          />
                          <span
                            className={`text-sm font-bold transition-colors ${currentQuestion.correctAnswer === key ? "text-green-600" : ""}`}
                            style={{
                              color:
                                currentQuestion.correctAnswer === key
                                  ? ""
                                  : colors.text,
                            }}
                          >
                            Option {key.toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 gap-2">
                    {editingIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(null);
                          setCurrentQuestion({
                            question: "",
                            options: { a: "", b: "", c: "", d: "" },
                            correctAnswer: "a",
                          });
                        }}
                        className="px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer border transition-all"
                        style={{
                          color: colors.text,
                          backgroundColor: colors.accent + "10",
                          borderColor: colors.accent + "10",
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddManual}
                      className="px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-2 border transition-all"
                      style={{
                        color: colors.text,
                        backgroundColor: colors.primary + "20",
                        borderColor: colors.primary + "30",
                      }}
                    >
                      <Plus size={14} />{" "}
                      {editingIndex !== null
                        ? "Update Question"
                        : "Add Question"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* List of Added Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3
                className="text-sm font-bold uppercase tracking-wider opacity-80"
                style={{ color: colors.text }}
              >
                Added List ({questions.length})
              </h3>
              {questions.length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 rounded text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all cursor-pointer"
                  style={{ backgroundColor: colors.primary, color: colors.background }}
                >
                  {loading ? (
                    <Loader size={16} variant="button" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save All to Topic
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {questions.map((q, idx) => (
                <div
                  key={q.tempId || idx}
                  className="p-6 rounded border flex items-start gap-4 relative group transition-all"
                  style={{
                    backgroundColor: colors.sidebar || colors.background,
                    borderColor: colors.accent + "20",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-xs font-black shrink-0"
                    style={{ color: colors.primary }}
                  >
                    Q{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-bold mb-4 pr-10"
                      style={{ color: colors.text }}
                    >
                      {q.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.entries(q.options).map(([key, val]) => (
                        <div
                          key={key}
                          className={`text-[11px] px-3 py-2 rounded border font-semibold flex items-center gap-2 transition-all`}
                          style={{
                            backgroundColor:
                              key === q.correctAnswer
                                ? "rgba(34, 197, 94, 0.1)"
                                : colors.background,
                            borderColor:
                              key === q.correctAnswer
                                ? "rgba(34, 197, 94, 0.3)"
                                : colors.accent + "10",
                            color:
                              key === q.correctAnswer ? "#22c55e" : colors.text,
                          }}
                        >
                          <span className="opacity-50 uppercase">{key}:</span>{" "}
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(idx)}
                      className="p-2 rounded hover:bg-blue-50 text-blue-500 transition-all cursor-pointer"
                      title="Edit Question"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-2 rounded hover:bg-red-50 text-red-500 transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div
                  className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded"
                  style={{
                    borderColor: colors.accent + "30",
                    color: colors.text,
                    opacity: 0.4,
                  }}
                >
                  <HelpCircle size={48} />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest">
                    No questions added yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Global Save Button */}
          {questions.length > 0 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full max-w-xl py-5 rounded flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all cursor-pointer"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                {loading ? (
                  <Loader size={24} variant="button" />
                ) : (
                  <Save size={20} />
                )}
                Final Submit Questions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManageQuestions;
