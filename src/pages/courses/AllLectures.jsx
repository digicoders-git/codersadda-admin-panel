import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Video as VideoIcon,
  Clock,
  Trash2,
  Edit2,
  Eye,
  LayoutGrid,
  List,
  BookOpen,
  Monitor as MonitorIcon,
  Hash,
  Lock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllLectures,
  deleteLecture as apiDeleteLecture,
} from "../../apis/lecture";
import { getAllCourses } from "../../apis/course";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

function AllLectures() {
  const { colors, isDarkMode } = useTheme();
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lecturesRes, coursesRes] = await Promise.all([
        getAllLectures(),
        getAllCourses(),
      ]);

      if (lecturesRes.success) {
        setLectures(lecturesRes.data);
      }
      if (coursesRes.success) {
        setCourses(coursesRes.data);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently remove the lecture video and data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await apiDeleteLecture(id);
          if (res.success) {
            setLectures((prev) => prev.filter((l) => l._id !== id));
            toast.success("Lecture deleted successfully!");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error deleting lecture",
          );
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleViewChange = (mode) => {
    if (mode === viewMode) return;
    setIsAnimating(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsAnimating(false);
    }, 200);
  };

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch = lecture.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourse === "All" ||
      lecture.course?._id === selectedCourse ||
      lecture.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const cardStyle = {
    backgroundColor: colors.sidebar || colors.background,
    borderColor: colors.accent + "30",
  };

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div
        className="shrink-0 p-2 md:p-6 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="min-w-0">
          <h1
            className="text-xl md:text-2xl font-bold truncate"
            style={{ color: colors.text }}
          >
            All Lectures
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-60 truncate"
            style={{ color: colors.textSecondary }}
          >
            Manage all course lectures in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex bg-opacity-10 rounded p-1 border"
            style={{
              backgroundColor: colors.sidebar,
              borderColor: colors.accent + "20",
            }}
          >
            <button
              onClick={() => handleViewChange("grid")}
              className={`p-2 rounded transition-all cursor-pointer duration-200 ${viewMode === "grid" ? "shadow-sm" : "opacity-50 hover:opacity-100"}`}
              style={{
                backgroundColor:
                  viewMode === "grid" ? colors.accent : "transparent",
                color: viewMode === "grid" ? colors.background : colors.text,
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className={`p-2 rounded transition-all cursor-pointer duration-200 ${viewMode === "list" ? "shadow-sm" : "opacity-50 hover:opacity-100"}`}
              style={{
                backgroundColor:
                  viewMode === "list" ? colors.accent : "transparent",
                color: viewMode === "list" ? colors.background : colors.text,
              }}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => navigate("/dashboard/lectures/create")}
            className="flex items-center cursor-pointer gap-2 px-4 md:px-6 py-2 rounded font-semibold transition-all shadow-md active:scale-95"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Plus size={18} />{" "}
            <span className="text-sm md:text-base">Add Lecture</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div
        className="shrink-0 px-2 md:px-6 flex flex-col sm:flex-row gap-4 mb-6 sticky top-0 z-30 pb-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            size={16}
            style={{ color: colors.text }}
          />
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-1 py-2.5 rounded border outline-none transition-all text-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 rounded border outline-none cursor-pointer text-sm font-semibold sm:min-w-[200px]"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
            color: colors.text,
          }}
        >
          <option value="All">All Courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`flex-1 overflow-auto p-2 md:px-6 pb-6 transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
      >
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader size={80} />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture._id}
                className="rounded border overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md flex flex-col"
                style={cardStyle}
              >
                <div
                  onClick={() =>
                    navigate(
                      `/dashboard/courses/view/${lecture.course?._id}/lecture/${lecture._id}`,
                    )
                  }
                  className="relative cursor-pointer h-44 overflow-hidden bg-gray-100 group"
                >
                  {lecture.thumbnail?.url ? (
                    <img
                      src={lecture.thumbnail.url}
                      alt={lecture.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center opacity-10"
                      style={{ backgroundColor: colors.accent + "10" }}
                    >
                      <VideoIcon size={48} style={{ color: colors.text }} />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div
                      className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20"
                      style={{
                        backgroundColor: colors.primary + "CC",
                        color: colors.background,
                      }}
                    >
                      Sr No: {lecture.srNo}
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${lecture.privacy === "locked" ? "border-amber-500/50 bg-amber-500" : "border-green-500/50 bg-green-500"} text-white shadow-sm`}
                    >
                      {lecture.privacy}
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2 py-1 rounded border border-white/10">
                    <Clock size={12} className="text-white" />
                    <span className="text-white text-[10px] font-bold tracking-wider">
                      {lecture.duration}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3
                    className="font-semibold text-sm mb-1 line-clamp-2"
                    style={{ color: colors.text }}
                  >
                    {lecture.title}
                  </h3>
                  <p
                    className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1 mb-4"
                    style={{ color: colors.textSecondary }}
                  >
                    {lecture.course?.title || "Unknown Course"}
                  </p>

                  <div
                    className="mt-auto flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: colors.accent + "15" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${lecture.isActive ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        {lecture.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/courses/view/${lecture.course?._id}/lecture/${lecture._id}`,
                          )
                        }
                        className="p-1.5 cursor-pointer rounded transition-all"
                        style={{ color: colors.primary }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/courses/view/${lecture.course?._id}/lecture/edit/${lecture._id}`,
                          )
                        }
                        className="p-1.5 cursor-pointer rounded transition-all"
                        style={{ color: colors.primary }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lecture._id)}
                        disabled={actionLoading === lecture._id}
                        className="p-1.5 cursor-pointer rounded transition-all"
                        style={{ color: "#ef4444" }}
                      >
                        {actionLoading === lecture._id ? (
                          <Loader size={12} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture._id}
                className="flex items-center gap-4 p-4 rounded border hover:shadow-sm transition-all duration-200"
                style={cardStyle}
              >
                <div className="w-16 h-10 rounded border overflow-hidden shrink-0">
                  {lecture.thumbnail?.url ? (
                    <img
                      src={lecture.thumbnail.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 opacity-20">
                      <VideoIcon size={16} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: colors.primary + "15",
                        color: colors.primary,
                      }}
                    >
                      {lecture.course?.title || "General"}
                    </span>
                    <span className="opacity-20">•</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                      Sr: {lecture.srNo}
                    </span>
                  </div>
                  <h3
                    className="font-semibold text-sm truncate"
                    style={{ color: colors.text }}
                  >
                    {lecture.title}
                  </h3>
                </div>

                <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {lecture.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {lecture.privacy === "locked" ? (
                      <Lock size={14} className="text-amber-500" />
                    ) : (
                      <Eye size={14} className="text-green-500" />
                    )}
                    {lecture.privacy}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1 border-l pl-4"
                  style={{ borderColor: colors.accent + "15" }}
                >
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/courses/view/${lecture.course?._id}/lecture/${lecture._id}`,
                      )
                    }
                    className="p-2 cursor-pointer text-primary"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/courses/view/${lecture.course?._id}/lecture/edit/${lecture._id}`,
                      )
                    }
                    className="p-2 cursor-pointer text-primary"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(lecture._id)}
                    className="p-2 cursor-pointer text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLectures.length === 0 && (
          <div
            className="text-center py-20 border-2 border-dashed rounded opacity-30"
            style={{ borderColor: colors.accent + "30" }}
          >
            <MonitorIcon size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">No Lectures Found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllLectures;
