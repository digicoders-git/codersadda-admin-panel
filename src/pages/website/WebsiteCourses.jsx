import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Globe,
  Grid,
  List,
  MoreVertical,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllCourses,
  deleteCourse as apiDeleteCourse,
  toggleCourseStatus as apiToggleCourseStatus,
} from "../../apis/course";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function WebsiteCourses() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getAllCourses();
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.technology?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "All" || course.courseType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await apiDeleteCourse(id);
        if (res.success) {
          toast.success("Course deleted successfully!");
          setCourses((prev) => prev.filter((c) => c._id !== id));
        }
      } catch (err) {
        toast.error("Failed to delete course");
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await apiToggleCourseStatus(id);
      if (res.success) {
        const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
        setCourses((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)),
        );
        toast.success(`Course status updated successfully`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "#22C55E" : "#EF4444";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Beginner":
        return "#3B82F6";
      case "Intermediate":
        return "#F59E0B";
      case "Advance":
        return "#EF4444";
      default:
        return colors.primary;
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Globe size={24} style={{ color: colors.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Website Courses
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Manage courses displayed on website
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/website/courses/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
              color: colors.text,
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-lg border outline-none text-sm cursor-pointer"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
            color: colors.text,
          }}
        >
          <option value="All">All Types</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advance">Advance</option>
        </select>

        {/* View Toggle */}
        <div
          className="flex rounded-lg border"
          style={{ borderColor: colors.accent + "30" }}
        >
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-l-lg transition-all ${
              viewMode === "grid" ? "opacity-100" : "opacity-50"
            }`}
            style={{
              backgroundColor:
                viewMode === "grid" ? colors.primary : "transparent",
              color: viewMode === "grid" ? colors.background : colors.text,
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-r-lg transition-all ${
              viewMode === "list" ? "opacity-100" : "opacity-50"
            }`}
            style={{
              backgroundColor:
                viewMode === "list" ? colors.primary : "transparent",
              color: viewMode === "list" ? colors.background : colors.text,
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Courses Content */}
      <div className="flex-1 overflow-auto">
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Globe
              size={48}
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              No courses found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold text-white"
                      style={{
                        backgroundColor: getTypeColor(course.courseType),
                      }}
                    >
                      {course.courseType}
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold text-white"
                      style={{
                        backgroundColor:
                          course.badge === "popular"
                            ? "#3B82F6"
                            : course.badge === "trending"
                              ? "#10B981"
                              : course.badge === "top"
                                ? "#F59E0B"
                                : "#6B7280",
                      }}
                    >
                      {course.badge?.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() =>
                        handleStatusToggle(course._id, course.status)
                      }
                      className="px-2 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80"
                      style={{ backgroundColor: getStatusColor(course.status) }}
                    >
                      {course.status}
                    </button>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-4">
                  <h3
                    className="font-bold text-lg mb-2 line-clamp-2"
                    style={{ color: colors.text }}
                  >
                    {course.title}
                  </h3>

                  <p
                    className="text-sm mb-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {course.technology}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        Progress
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: colors.primary }}
                      >
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: colors.primary,
                          width: `${course.progress}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={course.instructorImage}
                      alt={course.instructor}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      {course.instructor}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/website/courses/view/${course._id}`,
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: colors.primary + "20",
                        color: colors.primary,
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/website/courses/edit/${course._id}`,
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: colors.accent + "20",
                        color: colors.text,
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id, course.title)}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="rounded-lg border shadow-sm p-4 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Course Image */}
                  <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-bold text-lg mb-1"
                          style={{ color: colors.text }}
                        >
                          {course.title}
                        </h3>
                        <p
                          className="text-sm mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {course.technology}
                        </p>

                        {/* Course Type & Instructor */}
                        <div className="flex items-center gap-4 mb-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-bold text-white"
                            style={{
                              backgroundColor: getTypeColor(course.courseType),
                            }}
                          >
                            {course.courseType}
                          </span>
                          <span
                            className="px-2 py-1 rounded text-xs font-bold text-white"
                            style={{
                              backgroundColor:
                                course.badge === "popular"
                                  ? "#3B82F6"
                                  : course.badge === "trending"
                                    ? "#10B981"
                                    : course.badge === "top"
                                      ? "#F59E0B"
                                      : "#6B7280",
                            }}
                          >
                            {course.badge?.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            <img
                              src={course.instructorImage}
                              alt={course.instructor}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span
                              className="text-sm font-semibold"
                              style={{ color: colors.text }}
                            >
                              {course.instructor}
                            </span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 max-w-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: colors.textSecondary }}
                              >
                                Progress
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: colors.primary }}
                              >
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  backgroundColor: colors.primary,
                                  width: `${course.progress}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleStatusToggle(course._id, course.status)
                          }
                          className="px-3 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80"
                          style={{
                            backgroundColor: getStatusColor(course.status),
                          }}
                        >
                          {course.status}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/courses/view/${course._id}`,
                              )
                            }
                            className="p-2 rounded transition-all"
                            style={{
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            }}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/courses/edit/${course._id}`,
                              )
                            }
                            className="p-2 rounded transition-all"
                            style={{
                              backgroundColor: colors.accent + "20",
                              color: colors.text,
                            }}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(course._id, course.title)
                            }
                            className="p-2 rounded transition-all text-red-600 bg-red-50 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteCourses;
