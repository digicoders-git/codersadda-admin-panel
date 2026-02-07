import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileQuestion,
  Clock,
  Layout,
  Award,
  MoreVertical,
  Hash,
  Eye,
  Copy,
  FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getQuizzes,
  deleteQuiz as apiDeleteQuiz,
  updateQuiz as apiUpdateQuiz,
  toggleQuizStatus as apiToggleQuizStatus,
} from "../../apis/quiz";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";

function Quizzes() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await getQuizzes();
      if (res.success) {
        setQuizzes(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = (quizzes || []).filter(
    (quiz) =>
      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Quiz Code copied to clipboard!");
  };

  const toggleStatus = async (id, currentStatus) => {
    // Backend uses "Active" / "Disable".
    // If current is "Active", new is "Disable". Else "Active".
    const newStatus = currentStatus === "Active" ? "Disable" : "Active";
    setActionLoading(true);

    // Optimistic update
    setQuizzes((prev) =>
      prev.map((q) => (q._id === id ? { ...q, status: newStatus } : q)),
    );
    try {
      const res = await apiToggleQuizStatus(id);
      if (res.success) {
        toast.info(`Quiz ${newStatus === "Active" ? "Activated" : "Disabled"}`);
      }
    } catch (err) {
      // Revert
      setQuizzes((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: currentStatus } : q)),
      );
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Quiz?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(true);
          await apiDeleteQuiz(id);
          toast.success("Quiz deleted successfully!");
          fetchQuizzes();
        } catch (err) {
          toast.error("Failed to delete quiz");
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {actionLoading && <Loader size={128} fullPage={true} />}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Quizzes
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Manage assessments
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/quizzes/add")}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} /> Add Quiz
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
            size={18}
          />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
              color: colors.text,
            }}
          />
        </div>
      </div>

      {/* Table View */}
      <div
        className="rounded border overflow-hidden shadow-sm"
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "20",
        }}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader size={80} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="text-xs font-black uppercase tracking-widest opacity-60 border-b"
                  style={{
                    borderColor: colors.accent + "20",
                    color: colors.text,
                  }}
                >
                  <th className="p-4">Quiz Title</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center opacity-60">
                      <div className="max-h-[300px] flex items-center justify-center">
                        <Loader size={80} />
                      </div>
                    </td>
                  </tr>
                ) : filteredQuizzes.length > 0 ? (
                  filteredQuizzes.map((quiz) => (
                    <tr
                      key={quiz._id}
                      className="border-b last:border-0 hover:bg-black/5 transition-colors"
                      style={{
                        borderColor: colors.accent + "10",
                        color: colors.text,
                      }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <FileQuestion size={20} />
                          </div>
                          <div>
                            <p className="font-bold line-clamp-1">
                              {quiz.title}
                            </p>
                            <p className="text-xs opacity-50 line-clamp-1 max-w-[200px]">
                              {quiz.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 opacity-70">
                            <Hash size={12} />
                            <span>{quiz.quizCode || "N/A"}</span>
                          </div>
                          {quiz.quizCode && (
                            <button
                              onClick={() => copyToClipboard(quiz.quizCode)}
                              className="p-1.5 rounded hover:bg-black/5 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
                              title="Copy Code"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs opacity-70">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {quiz.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={12} /> {quiz.points || 1} Pts
                          </span>
                          <span className="flex items-center gap-1">
                            <Layout size={12} /> {quiz.level}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Toggle
                            active={(quiz.status || "Active") === "Active"}
                            onClick={() => toggleStatus(quiz._id, quiz.status)}
                          />
                          <span
                            className={`text-[9px] font-bold uppercase tracking-widest ${
                              (quiz.status || "Active") === "Active"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {quiz.status || "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/quizzes/report/${quiz._id}`)
                            }
                            className="p-2 rounded border hover:bg-purple-50 text-purple-600 cursor-pointer transition-colors"
                            style={{ borderColor: colors.accent + "30" }}
                            title="View Attempts"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/dashboard/quizzes/view/${quiz._id}`)
                            }
                            className="p-2 rounded border hover:bg-black/5 text-gray-600 cursor-pointer transition-colors"
                            style={{ borderColor: colors.accent + "30" }}
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/dashboard/quizzes/edit/${quiz._id}`)
                            }
                            className="p-2 rounded border hover:bg-black/5 text-blue-500 cursor-pointer transition-colors"
                            style={{ borderColor: colors.accent + "30" }}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(quiz._id)}
                            className="p-2 rounded border hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
                            style={{ borderColor: colors.accent + "30" }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center opacity-40">
                      <FileQuestion size={48} className="mx-auto mb-2" />
                      <p>No quizzes found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quizzes;
