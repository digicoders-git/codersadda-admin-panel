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
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getQuizById, updateQuiz as apiUpdateQuiz } from "../../apis/quiz";
import { getAllTopics } from "../../apis/questionTopic";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ModernSelect from "../../components/ModernSelect";
import Loader from "../../components/Loader";

function EditQuiz() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [formData, setFormData] = useState(null);
  const [questions, setQuestions] = useState([]);

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
    const fetchTopics = async () => {
      try {
        const res = await getAllTopics("", 1, 100, "true");
        if (res.success) {
          setTopics(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      }
    };
    fetchQuiz();
    fetchTopics();
  }, [id, navigate]);

  useEffect(() => {
    if (formData && topics.length > 0) {
      const topicId =
        formData.questionTopicId?._id || formData.questionTopicId || "";
      if (topicId) {
        const topic = topics.find((t) => t._id === topicId);
        if (topic) {
          const mappedQuestions = (topic.questions || []).map((q) => {
            const optionsArr = [
              q.options.a,
              q.options.b,
              q.options.c,
              q.options.d,
            ];
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
        }
      }
    }
  }, [formData, topics]);

  const handleTopicChange = (topicId) => {
    const topic = topics.find((t) => t._id === topicId);
    if (topic) {
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
      setFormData((prev) => ({ ...prev, questionTopicId: topicId }));
    } else {
      setQuestions([]);
      setFormData((prev) => ({ ...prev, questionTopicId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.duration || !formData.questionTopicId) {
      toast.warning("Please fill essential quiz details including Topic");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title: formData.title,
        quizCode: formData.quizCode,
        description: formData.description,
        duration: Number(formData.duration),
        level: formData.level,
        points: Number(formData.points),
        status: formData.status === "Active" || formData.status === true,
        questionTopicId:
          formData.questionTopicId?._id || formData.questionTopicId,
      };

      const res = await apiUpdateQuiz(id, payload);
      if (res.success) {
        toast.success("Quiz updated successfully!");
        navigate("/dashboard/quizzes");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update quiz");
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
      {/* {actionLoading && <Loader size={128} fullPage={true} />} */}
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
            className="p-8 rounded-2xl border shadow-sm space-y-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b"
              style={{ borderColor: colors.accent + "10" }}
            >
              <div style={{ color: colors.text }}>
                <h3 className="text-sm font-black uppercase tracking-wider opacity-60">
                  Quiz Content
                </h3>
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black mt-1">
                  Select a topic to link all its questions
                </p>
              </div>

              <div className="w-full md:w-96">
                <label
                  style={{ ...labelStyle, fontSize: "10px", opacity: 0.6 }}
                >
                  Question Topic
                </label>
                <ModernSelect
                  options={topics.map((t) => ({
                    label: `${t.topicName} (${t.questions?.length || 0} Questions)`,
                    value: t._id,
                  }))}
                  value={
                    formData.questionTopicId?._id || formData.questionTopicId
                  }
                  onChange={handleTopicChange}
                  placeholder="Choose a topic"
                />
              </div>
            </div>

            {/* Questions Preview */}
            {questions.length > 0 ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                  <h4
                    className="text-[10px] font-black uppercase tracking-widest opacity-40"
                    style={{ color: colors.text }}
                  >
                    Preview: {questions.length} Questions linked from topic
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-none">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border bg-black/5 flex items-start gap-4 transition-all hover:bg-black/[0.07]"
                      style={{ borderColor: colors.accent + "10" }}
                    >
                      <span className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center text-xs font-black opacity-40 shrink-0 shadow-sm">
                        {idx + 1}
                      </span>
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
                              className={`text-[11px] px-4 py-2.5 rounded-xl border font-bold transition-all flex items-center gap-3 ${oid === q.correctOption ? "bg-green-500/10 border-green-500/30 text-green-700" : "bg-white/40 border-black/5 opacity-60"}`}
                            >
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${oid === q.correctOption ? "bg-green-500 text-white" : "bg-black/10 opacity-40"}`}
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
                className="py-20 text-center border-2 border-dashed rounded-3xl flex flex-col items-center gap-4 transition-all"
                style={{
                  borderColor: colors.accent + "20",
                  backgroundColor: colors.accent + "05",
                }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center shadow-inner">
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              {actionLoading ? (
                <Loader size={18} variant="button" />
              ) : (
                <>
                  <Save size={18} /> Update Quiz
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
      ) : (
        <div className="text-center p-20 opacity-40">Quiz not found</div>
      )}
    </div>
  );
}

export default EditQuiz;
