import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../../apis/curriculum";
import { getAllCourses } from "../../apis/course";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";
import Swal from "sweetalert2";

function AllTopics() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopic, setNewTopic] = useState({ topic: "", course: "" });

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await getAllTopics(search, page, 10, courseFilter);
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

  const fetchCourses = async () => {
    try {
      const res = await getAllCourses({ limit: 1000, isActive: true });
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [search, page, courseFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddOrUpdateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.topic.trim()) return toast.warning("Topic name is required");
    if (!newTopic.course) return toast.warning("Course selection is required");

    try {
      setLoading(true);
      let res;
      if (editingTopic) {
        res = await updateTopic(editingTopic._id, newTopic);
      } else {
        res = await createTopic(newTopic);
      }

      if (res.success) {
        toast.success(res.message || "Operation successful");
        setNewTopic({ topic: "", course: "" });
        setShowAddModal(false);
        setEditingTopic(null);
        fetchTopics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setNewTopic({
      topic: topic.topic,
      course: topic.course?._id || topic.course,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the topic and all its lectures!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteTopic(id);
          if (res.success) {
            toast.success("Topic deleted");
            fetchTopics();
          }
        } catch (err) {
          toast.error("Delete failed");
        }
      }
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTopic(null);
    setNewTopic({ topic: "", course: "" });
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Course Topics
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Manage curriculum sections for all courses
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
        <div className="md:col-span-2">
          <ModernSelect
            options={[
              { label: "All Courses", value: "" },
              ...courses.map((c) => ({ label: c.title, value: c._id })),
            ]}
            value={courseFilter}
            onChange={(val) => setCourseFilter(val)}
            placeholder="Filter by Course"
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
                  Course
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
                    {(page - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      {topic.topic}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10"
                      style={{ color: colors.primary }}
                    >
                      {topic.course?.title || "N/A"}
                    </span>
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
          {topics.length === 0 && !loading && (
            <div className="p-10 text-center opacity-40 font-bold uppercase tracking-widest text-sm flex flex-col items-center gap-3">
              <BookOpen size={40} />
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

      {/* Add/Edit Modal */}
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
              Define a category for course lectures
            </p>

            <form onSubmit={handleAddOrUpdateTopic}>
              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                  Select Course
                </label>
                <ModernSelect
                  options={courses.map((c) => ({
                    label: c.title,
                    value: c._id,
                  }))}
                  value={newTopic.course}
                  onChange={(val) => setNewTopic({ ...newTopic, course: val })}
                  placeholder="Choose a course"
                />
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                  Topic Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newTopic.topic}
                  onChange={(e) =>
                    setNewTopic({
                      ...newTopic,
                      topic: e.target.value.replace(/[0-9]/g, ""),
                    })
                  }
                  placeholder="e.g. Introduction, Advanced Setup"
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
                  onClick={closeModal}
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
                    "Update"
                  ) : (
                    "Create"
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

export default AllTopics;
