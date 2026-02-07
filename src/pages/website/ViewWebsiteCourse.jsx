import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Globe,
  User,
  Clock,
  BarChart3,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getCourseById,
  deleteCourse as apiDeleteCourse,
} from "../../apis/course";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ViewWebsiteCourse() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await getCourseById(id);
        if (res.success && res.data) {
          setCourse(res.data);
        } else {
          toast.error("Course not found");
          navigate("/dashboard/website/courses");
        }
      } catch (error) {
        toast.error("Failed to fetch course details");
        navigate("/dashboard/website/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${course.title}"?`,
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
          toast.success("Course deleted successfully");
          navigate("/dashboard/website/courses");
        }
      } catch (err) {
        toast.error("Failed to delete course");
      }
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

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Course not found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-all cursor-pointer border"
            style={{
              color: colors.text,
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Globe size={24} style={{ color: colors.primary }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                Course Details
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Website course information
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dashboard/website/courses/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary + "20",
              color: colors.primary,
            }}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Image */}
          <div className="lg:col-span-1">
            <div
              className="rounded-lg border shadow-sm overflow-hidden"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className="px-3 py-1 rounded text-sm font-bold text-white"
                    style={{ backgroundColor: getTypeColor(course.courseType) }}
                  >
                    {course.courseType}
                  </span>
                  <span
                    className="px-3 py-1 rounded text-sm font-bold text-white"
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
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 rounded text-sm font-bold text-white"
                    style={{ backgroundColor: getStatusColor(course.status) }}
                  >
                    {course.status}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Course Progress
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: colors.primary }}
                  >
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      backgroundColor: colors.primary,
                      width: `${course.progress}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg border shadow-sm p-6"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                {course.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={20} style={{ color: colors.primary }} />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        Instructor
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={course.instructorImage}
                          alt={course.instructor}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span
                          className="font-semibold"
                          style={{ color: colors.text }}
                        >
                          {course.instructor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} style={{ color: colors.primary }} />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        Badge
                      </p>
                      <span
                        className="inline-block px-2 py-1 rounded text-sm font-bold text-white mt-1"
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
                  </div>

                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} style={{ color: colors.primary }} />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        Course Level
                      </p>
                      <span
                        className="inline-block px-2 py-1 rounded text-sm font-bold text-white mt-1"
                        style={{
                          backgroundColor: getTypeColor(course.courseType),
                        }}
                      >
                        {course.courseType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe size={20} style={{ color: colors.primary }} />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        Technology Stack
                      </p>
                      <p
                        className="font-semibold mt-1"
                        style={{ color: colors.text }}
                      >
                        {course.technology}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={20} style={{ color: colors.primary }} />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        Status
                      </p>
                      <span
                        className="inline-block px-2 py-1 rounded text-sm font-bold text-white mt-1"
                        style={{
                          backgroundColor: getStatusColor(course.status),
                        }}
                      >
                        {course.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.primary + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {course.progress}%
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Completion
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.accent + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {course.courseType}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Level
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: getStatusColor(course.status) + "20",
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getStatusColor(course.status) }}
                  >
                    {course.status}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Status
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewWebsiteCourse;
