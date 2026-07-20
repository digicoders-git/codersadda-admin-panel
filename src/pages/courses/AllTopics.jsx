import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  BookOpen,
  Layout,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
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
import Toggle from "../../components/ui/Toggle";
import Swal from "sweetalert2";

function AllTopics() {
  const { colors } = useTheme();

  // Data States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [limit] = useState(10);

  // Form States
  const [topicName, setTopicName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search,
        page: currentPage,
        limit,
        courseId: courseFilter === "all" ? "" : courseFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter,
      };

      const res = await getAllTopics(params);
      if (res.success) {
        setTopics(res.data);
        setTotalItems(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setActiveCount(res.activeCount || 0);
        setInactiveCount(res.inactiveCount || 0);
      }
    } catch (err) {
      toast.error("Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  }, [search, currentPage, limit, courseFilter, statusFilter]);

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
    const timer = setTimeout(
      () => {
        fetchTopics();
      },
      search ? 500 : 0,
    );
    return () => clearTimeout(timer);
  }, [search, currentPage, courseFilter, statusFilter, fetchTopics]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!topicName.trim() || !selectedCourse) {
      return toast.warning("Topic name and course are required");
    }

    try {
      setLoading(true);
      let res;
      if (editingId) {
        res = await updateTopic(editingId, {
          topic: topicName,
          course: selectedCourse,
        });
      } else {
        res = await createTopic({ topic: topicName, course: selectedCourse });
      }

      if (res.success) {
        toast.success(res.message);
        resetForm();
        fetchTopics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingId(topic._id);
    setTopicName(topic.topic);
    setSelectedCourse(topic.course?._id);
  };

  const resetForm = () => {
    setEditingId(null);
    setTopicName("");
    setSelectedCourse("");
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(id);
      const res = await updateTopic(id, { isActive: !currentStatus });
      if (res.success) {
        toast.info(`Topic ${!currentStatus ? "activated" : "disabled"}`);
        fetchTopics();
      }
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setActionLoading(null);
    }
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
          setActionLoading(id);
          const res = await deleteTopic(id);
          if (res.success) {
            toast.success("Topic deleted");
            fetchTopics();
          }
        } catch (err) {
          toast.error("Delete failed");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  // Dropdown Options
  const courseOptions = [
    { label: "All Courses", value: "all" },
    ...courses.map((c) => ({ label: c.title, value: c._id })),
  ];

  const statusOptions = [
    { label: `All Status (${activeCount + inactiveCount})`, value: "all" },
    { label: `Active (${activeCount})`, value: "true" },
    { label: `Inactive (${inactiveCount})`, value: "false" },
  ];

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header Section */}
      <div
        className="shrink-0 mb-6 sticky top-0 z-30 pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        style={{ backgroundColor: colors.background }}
      >
        <div className="relative hidden md:block">
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full"
            style={{ backgroundColor: colors.primary }}
          ></div>
          <h1
            className="text-2xl md:text-3xl font-semibold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            Course Topics
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-50 mt-1"
            style={{ color: colors.text }}
          >
            Manage curriculum sections and content hierarchy for all courses.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 group min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-300"
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search topics..."
              className="w-full pl-9 pr-3 py-2 rounded outline-none border transition-all text-xs font-medium backdrop-blur-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "15",
                color: colors.text,
              }}
            />
          </div>
          <div className="w-40">
            <ModernSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Side: Table Area */}
        <div
          className="flex-1 flex flex-col rounded border shadow-sm overflow-hidden"
          style={{
            borderColor: colors.accent + "15",
            backgroundColor: colors.sidebar || colors.background,
          }}
        >
          <div
            className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-rounded-full"
            style={{ scrollbarColor: `${colors.accent}40 transparent` }}
          >
            {loading && !topics.length ? (
              <div className="flex items-center justify-center p-20 h-full min-h-[400px]">
                <Loader size={80} />
              </div>
            ) : topics.length > 0 ? (
              <table className="w-full text-left border-collapse table-auto">
                <thead
                  className="sticky top-0 z-30"
                  style={{
                    backgroundColor: colors.sidebar || colors.background,
                  }}
                >
                  <tr
                    style={{
                      borderBottom: `2px solid ${colors.accent}15`,
                      backgroundColor: colors.sidebar || colors.background,
                    }}
                  >
                    <th
                      className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest w-16 text-center whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      Sr.
                    </th>
                    <th
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      TOPIC DETAILS
                    </th>
                    <th
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      STATUS
                    </th>
                    <th
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ divideColor: colors.accent + "08" }}
                >
                  {topics.map((topic, index) => (
                    <tr
                      key={topic._id}
                      className="hover:bg-opacity-10 transition-colors"
                      style={{ color: colors.text }}
                    >
                      <td className="px-4 py-4 text-xs font-bold opacity-30 text-center whitespace-nowrap">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: colors.primary + "10",
                              color: colors.primary,
                            }}
                          >
                            <BookOpen size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">
                              {topic.topic}
                            </span>
                            <span
                              className="text-[10px] font-bold opacity-40 uppercase tracking-tighter"
                              style={{ color: colors.textSecondary }}
                            >
                              {topic.course?.title || "N/A"} •{" "}
                              {topic.lectureCount || 0} Lectures
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center items-center gap-2 relative">
                          {actionLoading === topic._id ? (
                            <div className="flex items-center gap-2">
                              <Loader size={12} variant="button" />
                              <span className="text-[9px] font-black uppercase tracking-wider opacity-50">
                                Wait...
                              </span>
                            </div>
                          ) : (
                            <>
                              <Toggle
                                active={topic.isActive}
                                onClick={() =>
                                  toggleStatus(topic._id, topic.isActive)
                                }
                              />
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider ${topic.isActive ? "text-green-500" : "text-red-500"}`}
                              >
                                {topic.isActive ? "ACTIVE" : "DISABLED"}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(topic)}
                            className="p-2 cursor-pointer rounded-xl transition-all hover:bg-opacity-20"
                            style={{
                              color: colors.primary,
                              backgroundColor: colors.primary + "10",
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            disabled={actionLoading === topic._id}
                            onClick={() => handleDelete(topic._id)}
                            className="p-2 cursor-pointer rounded-xl transition-all hover:bg-opacity-20 disabled:opacity-50 flex items-center justify-center min-w-[36px] min-h-[36px]"
                            style={{
                              color: "#ef4444",
                              backgroundColor: "#ef444415",
                            }}
                          >
                            {actionLoading === topic._id ? (
                              <Loader size={16} variant="button" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 opacity-30 h-full min-h-[400px]">
                <Layout size={64} className="mb-4" />
                <p className="text-xl font-bold uppercase tracking-widest">
                  No Topics Found
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {(totalPages > 1 || totalItems > 0) && (
            <div
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: colors.accent + "10" }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: colors.textSecondary }}
              >
                Total <b>{totalItems}</b> items • Page {currentPage} of{" "}
                {totalPages}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-2 rounded-lg border transition-all disabled:opacity-30 cursor-pointer hover:bg-black/5"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum ? "shadow-sm" : "hover:bg-black/5"}`}
                          style={{
                            backgroundColor:
                              currentPage === pageNum
                                ? colors.primary
                                : "transparent",
                            color:
                              currentPage === pageNum
                                ? colors.background
                                : colors.text,
                            border:
                              currentPage === pageNum
                                ? "none"
                                : `1px solid ${colors.accent}20`,
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-1 opacity-40 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="p-2 rounded-lg border transition-all disabled:opacity-30 cursor-pointer hover:bg-black/5"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Add/Edit Box (Fixed) */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
          <div
            className="rounded p-6 border shadow-sm sticky top-0"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                {editingId ? "Update Topic" : "Add New Topic"}
              </h2>
              <div
                className="w-12 h-1 rounded-full mt-2"
                style={{ backgroundColor: colors.primary }}
              ></div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  COURSE NAME
                </label>
                <ModernSelect
                  options={courses.map((c) => ({
                    label: c.title,
                    value: c._id,
                  }))}
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  placeholder="Select target course"
                />
              </div>

              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  TOPIC NAME
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Fundamental Concepts"
                  className="w-full px-4 py-3 rounded outline-none border transition-all font-semibold text-sm"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.accent + "20",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) =>
                    (e.target.style.borderColor = colors.accent + "20")
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleFormSubmit(e)}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="w-full py-3 rounded font-bold uppercase tracking-widest text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  {loading ? (
                    <Loader size={16} variant="button" />
                  ) : editingId ? (
                    <>
                      <Check size={16} /> UPDATE
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> CREATE
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="w-full py-3 rounded font-bold uppercase tracking-widest text-xs transition-all border opacity-60 hover:opacity-100 cursor-pointer"
                    style={{
                      backgroundColor: "transparent",
                      color: colors.text,
                      borderColor: colors.accent + "30",
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tip Box */}
          {/* <div
            className="rounded p-6 border shadow-sm bg-opacity-5"
            style={{
              backgroundColor: colors.primary + "05",
              borderColor: colors.primary + "15",
            }}
          >
            <h3
              className="text-sm font-bold mb-3 flex items-center gap-2"
              style={{ color: colors.primary }}
            >
              <Video size={16} /> Quick Tip
            </h3>
            <p
              className="text-xs leading-relaxed opacity-70"
              style={{ color: colors.text }}
            >
              Topics act as chapters for your course. Organize them logically so
              students can follow the learning path easily.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default AllTopics;
