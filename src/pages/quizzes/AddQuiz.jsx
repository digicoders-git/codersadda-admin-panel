import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Download,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { createQuiz } from "../../apis/quiz";
import { getAllTopics } from "../../apis/questionTopic";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ModernSelect from "../../components/ModernSelect";
import Loader from "../../components/Loader";

function AddQuiz() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    quizCode: "",
    description: "",
    duration: "",
    points: "1",
    level: "Beginner",
    status: "Active",
    questionTopicId: "",
  });

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [newManualQ, setNewManualQ] = useState({
    question: "",
    options: { a: "", b: "", c: "", d: "" },
    correctAnswer: "a",
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setPageLoading(true);
        const res = await getAllTopics("", 1, 100, "true"); // Fetch active topics
        if (res.success) {
          setTopics(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleTopicChange = (topicId) => {
    const topic = topics.find((t) => t._id === topicId);
    if (topic) {
      // Map topic questions for preview
      const mappedQuestions = (topic.questions || []).map((q) => {
        const optionsArr = [q.options.a, q.options.b, q.options.c, q.options.d];
        const correctIdx = ["a", "b", "c", "d"].indexOf(
          q.correctAnswer.toLowerCase(),
        );
        return {
          id: q._id,
          question: q.question,
          options: optionsArr,
          correctOption: correctIdx !== -1 ? correctIdx : 0,
        };
      });
      setQuestions(mappedQuestions);
      setSelectedQuestionIds(mappedQuestions.map((q) => q.id));
      setFormData((prev) => ({ ...prev, questionTopicId: topicId }));
    } else {
      setQuestions([]);
      setSelectedQuestionIds([]);
      setFormData((prev) => ({ ...prev, questionTopicId: "" }));
    }
  };

  const toggleQuestionSelection = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id],
    );
  };

  const addManualQuestion = () => {
    if (
      !newManualQ.question ||
      !newManualQ.options.a ||
      !newManualQ.options.b ||
      !newManualQ.options.c ||
      !newManualQ.options.d
    ) {
      return toast.warning("Complete all question fields");
    }
    setManualQuestions([
      ...manualQuestions,
      { ...newManualQ, id: `manual-${Date.now()}` },
    ]);
    setNewManualQ({
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      correctAnswer: "a",
    });
    setShowManualForm(false);
    toast.success("Manual question added!");
  };

  const removeManualQuestion = (id) => {
    setManualQuestions(manualQuestions.filter((q) => (q._id || q.id) !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.duration ||
      !formData.quizCode ||
      !formData.questionTopicId
    ) {
      toast.warning("Please fill all quiz details including Topic");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        points: Number(formData.points),
        status: formData.status === "Active", // Backend likely expects boolean
        selectedQuestions: selectedQuestionIds,
        customQuestions: manualQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      };

      const res = await createQuiz(payload);
      if (res.success) {
        toast.success("Quiz created successfully!");
        navigate("/dashboard/quizzes");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* {loading && <Loader size={128} fullPage={true} />} */}
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
            Create New Quiz
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Setup assessment details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-full space-y-6">
        {/* Basic Details */}
        <div
          className="p-8 rounded border shadow-sm space-y-6"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-wider opacity-60 mb-2"
            style={{ color: colors.text }}
          >
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
                    setFormData({
                      ...formData,
                      title: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                    })
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
                    value={formData.quizCode}
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
                    setFormData({
                      ...formData,
                      duration: Math.max(0, parseInt(e.target.value) || 0),
                    })
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
                <ModernSelect
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advance", label: "Advance" },
                  ]}
                  value={formData.level}
                  onChange={(value) =>
                    setFormData({ ...formData, level: value })
                  }
                  placeholder="Select Level"
                />
              </div>
              <div>
                <label style={labelStyle}>Points per Question</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: Math.max(0, parseInt(e.target.value) || 0),
                    })
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
                <ModernSelect
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Disable", label: "Disable" },
                  ]}
                  value={formData.status || "Active"}
                  onChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  placeholder="Select Status"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Manager */}
        <div
          className="p-8 rounded border shadow-sm space-y-6"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-wider opacity-60 mb-2"
            style={{ color: colors.text }}
          >
            Quiz Content
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Question Topic</label>
                <ModernSelect
                  options={topics.map((t) => ({
                    label: `${t.topicName} (${t.questions?.length || 0} Questions)`,
                    value: t._id,
                  }))}
                  value={formData.questionTopicId}
                  onChange={handleTopicChange}
                  placeholder="Choose a topic"
                />
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black mt-2">
                  Select a topic to link all its questions
                </p>
              </div>
            </div>

            {/* Questions Preview */}
            {questions.length > 0 ? (
              <div
                className="space-y-4 pt-6 border-t"
                style={{ borderColor: colors.accent + "10" }}
              >
                <div className="flex items-center justify-between px-2">
                  <h4
                    className="text-[10px] font-black uppercase tracking-widest opacity-40"
                    style={{ color: colors.text }}
                  >
                    Select Questions ({selectedQuestionIds.length} of{" "}
                    {questions.length} selected)
                  </h4>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedQuestionIds(questions.map((q) => q.id))
                      }
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="opacity-20 text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIds([])}
                      className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-tighter cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-none">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-5 rounded border flex items-start gap-4 transition-all cursor-pointer ${
                        selectedQuestionIds.includes(q.id)
                          ? "bg-black/5"
                          : "bg-transparent opacity-40 grayscale"
                      }`}
                      style={{
                        borderColor: selectedQuestionIds.includes(q.id)
                          ? colors.primary + "30"
                          : colors.accent + "10",
                      }}
                    >
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <span className="w-8 h-8 rounded bg-white/50 flex items-center justify-center text-xs font-black opacity-40 shadow-sm">
                          {idx + 1}
                        </span>
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${
                            selectedQuestionIds.includes(q.id)
                              ? "bg-primary border-primary"
                              : "border-black/10"
                          }`}
                          style={{
                            backgroundColor: selectedQuestionIds.includes(q.id)
                              ? colors.primary
                              : "transparent",
                            borderColor: selectedQuestionIds.includes(q.id)
                              ? colors.primary
                              : colors.accent + "20",
                          }}
                        >
                          {selectedQuestionIds.includes(q.id) && (
                            <CheckCircle2 size={14} className="text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-sm font-bold mb-4 leading-relaxed"
                          style={{ color: colors.text }}
                        >
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oid) => (
                            <div
                              key={oid}
                              className={`text-[11px] px-4 py-2.5 rounded border font-bold transition-all flex items-center gap-3 ${
                                oid === q.correctOption &&
                                selectedQuestionIds.includes(q.id)
                                  ? "bg-green-500/10 border-green-500/30 text-green-700"
                                  : "bg-white/40 border-black/5 opacity-60"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                                  oid === q.correctOption &&
                                  selectedQuestionIds.includes(q.id)
                                    ? "bg-green-500 text-white"
                                    : "bg-black/10 opacity-40"
                                }`}
                              >
                                {["A", "B", "C", "D"][oid]}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="py-20 text-center border-2 border-dashed rounded flex flex-col items-center gap-4 transition-all"
                style={{
                  borderColor: colors.accent + "20",
                  backgroundColor: colors.accent + "05",
                }}
              >
                <div className="w-16 h-16 rounded bg-white/50 flex items-center justify-center shadow-inner">
                  <BookOpen
                    size={32}
                    className="opacity-20"
                    style={{ color: colors.text }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black opacity-30 uppercase tracking-widest">
                    No Topic Selected
                  </p>
                  <p className="text-[10px] font-bold opacity-20 uppercase tracking-widest">
                    Select a topic above to link questions to this quiz
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Questions Manager */}
        <div
          className="p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-2">
                Manual Questions (Ad-hoc)
              </h3>
              <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">
                Add extra questions directly to this quiz
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 border"
              style={{
                borderColor: colors.accent + "30",
                color: colors.primary,
              }}
            >
              {showManualForm ? (
                <X size={14} />
              ) : (
                <>
                  <Plus size={14} /> Add Manual
                </>
              )}
            </button>
          </div>

          {showManualForm && (
            <div
              className="p-5 rounded border space-y-4 shadow-inner"
              style={{
                borderColor: colors.primary + "20",
                backgroundColor: colors.primary + "05",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-12">
                  <label style={{ ...labelStyle, marginBottom: "4px" }}>
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={newManualQ.question}
                    onChange={(e) =>
                      setNewManualQ({ ...newManualQ, question: e.target.value })
                    }
                    placeholder="Enter your question here..."
                    className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  />
                </div>

                <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["a", "b", "c", "d"].map((opt) => (
                    <div key={opt}>
                      <label
                        style={{
                          ...labelStyle,
                          fontSize: "9px",
                          marginBottom: "2px",
                        }}
                      >
                        Option {opt.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={newManualQ.options[opt]}
                        onChange={(e) =>
                          setNewManualQ({
                            ...newManualQ,
                            options: {
                              ...newManualQ.options,
                              [opt]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className="w-full px-3 py-2 rounded border outline-none text-[11px] font-semibold"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "15",
                          color: colors.text,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="md:col-span-8">
                  <label
                    style={{
                      ...labelStyle,
                      fontSize: "9px",
                      marginBottom: "2px",
                    }}
                  >
                    Correct Answer
                  </label>
                  <ModernSelect
                    options={[
                      { label: "Option A", value: "a" },
                      { label: "Option B", value: "b" },
                      { label: "Option C", value: "c" },
                      { label: "Option D", value: "d" },
                    ]}
                    value={newManualQ.correctAnswer}
                    onChange={(val) =>
                      setNewManualQ({ ...newManualQ, correctAnswer: val })
                    }
                  />
                </div>

                <div className="md:col-span-4">
                  <button
                    type="button"
                    onClick={addManualQuestion}
                    className="w-full py-3.5 rounded font-black text-[10px] uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Add to Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {manualQuestions.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {manualQuestions.map((q, idx) => (
                <div
                  key={q._id || q.id || idx}
                  className="p-4 rounded border bg-black/5 flex items-start gap-3"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <span className="w-6 h-6 rounded bg-white/50 flex items-center justify-center text-[10px] font-black opacity-40 shrink-0 shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p
                        className="text-xs font-bold leading-relaxed"
                        style={{ color: colors.text }}
                      >
                        {q.question}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          removeManualQuestion(q._id || q.id || idx)
                        }
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {["a", "b", "c", "d"].map((optKey) => (
                        <div
                          key={optKey}
                          className={`text-[10px] px-3 py-2 rounded border font-bold flex items-center gap-2 ${
                            optKey === q.correctAnswer
                              ? "bg-green-500/10 border-green-500/30 text-green-700"
                              : "bg-white/40 border-black/5 opacity-60"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                              optKey === q.correctAnswer
                                ? "bg-green-500 text-white"
                                : "bg-black/10 opacity-40"
                            }`}
                          >
                            {optKey.toUpperCase()}
                          </span>
                          {q.options[optKey]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            {loading ? (
              <Loader size={18} variant="button" />
            ) : (
              <>
                <Save size={18} /> Publish Quiz
              </>
            )}
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
    </div>
  );
}

export default AddQuiz;
