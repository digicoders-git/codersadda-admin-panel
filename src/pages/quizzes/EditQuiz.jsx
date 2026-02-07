import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Upload,
  FileSpreadsheet,
  Hash,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById, updateQuiz as apiUpdateQuiz } from "../../apis/quiz";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Loader from "../../components/Loader";

function EditQuiz() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await getQuizById(id);
        if (res.success && res.data) {
          setFormData(res.data);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.warning("Excel file is empty");
          return;
        }

        const parsedQuestions = data.map((row) => {
          const options = [
            row["Option A"] || "",
            row["Option B"] || "",
            row["Option C"] || "",
            row["Option D"] || "",
          ];

          let correctIdx = 0;
          const correctVal = (row["Correct Option"] || "").toString().trim();

          if (
            correctVal.toLowerCase() === "option a" ||
            correctVal.toLowerCase() === "a"
          )
            correctIdx = 0;
          else if (
            correctVal.toLowerCase() === "option b" ||
            correctVal.toLowerCase() === "b"
          )
            correctIdx = 1;
          else if (
            correctVal.toLowerCase() === "option c" ||
            correctVal.toLowerCase() === "c"
          )
            correctIdx = 2;
          else if (
            correctVal.toLowerCase() === "option d" ||
            correctVal.toLowerCase() === "d"
          )
            correctIdx = 3;
          else {
            const matchIdx = options.findIndex(
              (opt) => opt.trim() === correctVal,
            );
            if (matchIdx !== -1) correctIdx = matchIdx;
          }

          return {
            id: Date.now() + Math.random().toString(),
            question: row["Question"] || "Untitled Question",
            options: options,
            correctOption: correctIdx,
          };
        });

        setFormData((prev) => ({
          ...prev,
          questions: [...(prev.questions || []), ...parsedQuestions],
        }));

        toast.success(`Added ${parsedQuestions.length} questions from Excel!`);
      } catch (error) {
        console.error(error);
        toast.error("Error parsing Excel file. Check format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAddQuestion = () => {
    if (
      !currentQuestion.question ||
      currentQuestion.options.some((opt) => !opt)
    ) {
      toast.warning("Please fill question and all 4 options");
      return;
    }

    setFormData({
      ...formData,
      questions: [
        ...(formData.questions || []),
        { ...currentQuestion, id: Date.now().toString() },
      ],
    });

    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.duration) {
      toast.warning("Please fill basic quiz details");
      return;
    }
    if (formData.questions.length === 0) {
      toast.warning("Please add at least one question");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        points: Number(formData.points),
        totalQuestions: formData.questions.length,
        questions: formData.questions.map((q) => {
          // Remove frontend temporary id if present, keep _id if exists
          const { id, ...rest } = q;
          return rest;
        }),
      };

      const res = await apiUpdateQuiz(id, payload);
      if (res.success) {
        toast.success("Quiz updated successfully!");
        navigate("/dashboard/quizzes");
      }
    } catch (err) {
      toast.error("Failed to update quiz");
    } finally {
      setActionLoading(false);
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {actionLoading && <Loader size={128} fullPage={true} />}
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
            Edit Quiz
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Update assessment data
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : formData ? (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Basic Details */}
          <div
            className="p-8 rounded border shadow-sm space-y-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-2">
              Quiz Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Quiz Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. React.js Fundamentals"
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Quiz Code</label>
                  <div className="relative">
                    <Hash
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                    />
                    <input
                      type="text"
                      value={formData.quizCode || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, quizCode: e.target.value })
                      }
                      placeholder="e.g. QZ-101"
                      className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "30",
                        color: colors.text,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Short description of the quiz..."
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all resize-none"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label style={labelStyle}>Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="15"
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advance">Advance</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Points per Question</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    placeholder="5"
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status || "Active"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Disable">Disable</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Manager */}
          <div
            className="p-8 rounded border shadow-sm space-y-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
                  Questions ({formData.questions?.length || 0})
                </h3>
                <p className="text-[10px] opacity-40">
                  Questions are added unlimited
                </p>
              </div>

              {/* Excel Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-green-500 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-green-600 transition-colors"
                >
                  <FileSpreadsheet size={16} /> Upload Excel
                </button>
              </div>
            </div>

            {/* Added Questions List */}
            {formData.questions?.length > 0 && (
              <div className="space-y-3">
                {formData.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded border bg-black/5 flex items-start gap-3 relative group"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <span className="text-xs font-black opacity-40 mt-1">
                      Q{idx + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-2">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oid) => (
                          <div
                            key={oid}
                            className={`text-xs px-2 py-1 rounded border ${oid === q.correctOption ? "bg-green-100 border-green-200 text-green-800" : "bg-white/50 border-black/5 opacity-60"}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded hover:bg-red-100 text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Question Form */}
            <div
              className="p-4 rounded border-2 border-dashed"
              style={{
                borderColor: colors.accent + "30",
                backgroundColor: colors.background,
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60">
                Add Question manually
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      question: e.target.value,
                    })
                  }
                  placeholder="Enter question text here..."
                  className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                  style={{
                    borderColor: colors.accent + "30",
                    color: colors.text,
                    backgroundColor: "transparent",
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer border ${currentQuestion.correctOption === idx ? "bg-green-500 text-white border-green-500" : "border-gray-300 opacity-40"}`}
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctOption: idx,
                          })
                        }
                      >
                        {["A", "B", "C", "D"][idx]}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...currentQuestion.options];
                          newOpts[idx] = e.target.value;
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: newOpts,
                          });
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 rounded border outline-none text-xs font-semibold"
                        style={{
                          borderColor: colors.accent + "20",
                          color: colors.text,
                          backgroundColor: "transparent",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 rounded bg-black/5 hover:bg-black/10 text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-2"
                    style={{ color: colors.text }}
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              <Save size={18} /> Update Quiz
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/quizzes")}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-3 cursor-pointer"
              style={{ borderColor: colors.accent + "30", color: colors.text }}
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-20 opacity-40">Quiz not found</div>
      )}
    </div>
  );
}

export default EditQuiz;
