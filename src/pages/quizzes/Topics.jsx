import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Toggle from "../../components/ui/Toggle";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllTopics,
  createTopic,
  deleteTopic,
  toggleTopicStatus,
} from "../../apis/questionTopic";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";

function Topics() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState("");

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await getAllTopics(search, page, 10, statusFilter);
      if (res.success) {
        setTopics(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error("Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [search, page, statusFilter]);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return toast.warning("Topic name is required");

    try {
      setLoading(true);
      let res;
      if (editingTopic) {
        res = await updateTopic(editingTopic._id, { topicName: newTopicName });
      } else {
        res = await createTopic({ topicName: newTopicName });
      }

      if (res.success) {
        toast.success(
          editingTopic
            ? "Topic updated successfully"
            : "Topic added successfully",
        );
        setNewTopicName("");
        setShowAddModal(false);
        setEditingTopic(null);
        fetchTopics();
      }
    } catch (err) {
      toast.error(
        editingTopic ? "Failed to update topic" : "Failed to add topic",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setNewTopicName(topic.topicName);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTopic(null);
    setNewTopicName("");
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleTopicStatus(id);
      if (res.success) {
        toast.success(res.message);
        fetchTopics();
      }
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      const res = await deleteTopic(id);
      if (res.success) {
        toast.success("Topic deleted");
        fetchTopics();
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Question Topics
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Manage quiz question categories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} /> Add Topic
        </button>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-4">
        <div className="md:col-span-2 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
            style={{ color: colors.text }}
          />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
        <div className="md:col-span-1">
          <ModernSelect
            options={[
              { label: "All Status", value: "" },
              { label: "Active Only", value: "true" },
              { label: "Disabled Only", value: "false" },
            ]}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Filter Status"
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="mx-4 overflow-hidden rounded border shadow-sm flex-1 flex flex-col"
        style={{
          borderColor: colors.accent + "20",
          backgroundColor: colors.sidebar || colors.background,
        }}
      >
        <div className="overflow-auto flex-1 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
              <Loader size={60} />
            </div>
          )}
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: colors.accent + "20",
                  backgroundColor: colors.accent + "05",
                }}
              >
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  S.No
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Topic Name
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Questions
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Created At
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right"
                  style={{ color: colors.text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, index) => (
                <tr
                  key={topic._id}
                  className="border-b transition-colors hover:bg-black/5"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <td
                    className="px-6 py-4 text-sm font-bold opacity-60"
                    style={{ color: colors.text }}
                  >
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      {topic.topicName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/quizzes/topic/${topic._id}/questions`,
                        )
                      }
                      className="px-3 py-1.5 rounded bg-transparent text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 transition-all active:scale-95 border"
                      style={{
                        color: colors.text,
                        borderColor: colors.accent + "20",
                      }}
                    >
                      <FileQuestion size={14} className="opacity-60" />
                      {topic.questions?.length || 0} Questions
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Toggle
                        active={topic.status}
                        onClick={() => handleToggleStatus(topic._id)}
                      />
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest ml-1 flex items-center gap-1.5"
                        style={{
                          color: topic.status
                            ? colors.primary
                            : colors.text + "40",
                        }}
                      >
                        {topic.status && (
                          <div
                          // className="w-1.5 h-1.5 rounded-full"
                          // style={{ backgroundColor: colors.primary }}
                          ></div>
                        )}
                        {topic.status ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-xs font-bold opacity-40"
                    style={{ color: colors.text }}
                  >
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="p-2 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all cursor-pointer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic._id)}
                        className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {topics.length === 0 && (
            <div className="p-10 text-center opacity-40 font-bold uppercase tracking-widest text-sm">
              No topics found
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ borderColor: colors.accent + "20" }}
          >
            <span className="text-xs font-bold opacity-60">
              Page {page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded border disabled:opacity-20 cursor-pointer"
                style={{
                  borderColor: colors.accent + "20",
                  color: colors.text,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded border disabled:opacity-20 cursor-pointer"
                style={{
                  borderColor: colors.accent + "20",
                  color: colors.text,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded p-8 shadow-2xl animate-in fade-in zoom-in duration-300"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              color: colors.text,
            }}
          >
            <h2 className="text-xl font-bold mb-2">
              {editingTopic ? "Edit Topic" : "Add New Topic"}
            </h2>
            <p className="text-xs opacity-60 mb-6 uppercase tracking-widest font-bold">
              Define a category for questions
            </p>

            <form onSubmit={handleAddTopic}>
              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                  Topic Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. JavaScript, Python, Logical Reasoning"
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all cursor-pointer"
                  style={{ borderColor: colors.accent + "30" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  {loading ? (
                    <Loader size={20} variant="button" />
                  ) : editingTopic ? (
                    "Update Topic"
                  ) : (
                    "Create Topic"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Topics;
