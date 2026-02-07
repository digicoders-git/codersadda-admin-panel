import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Eye,
  LayoutGrid,
  List,
  Lock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getMyCourses } from "../../apis/course";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function MyCourses() {
  const { colors } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMyCourses();
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewChange = (mode) => {
    if (mode === viewMode) return;
    setIsAnimating(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsAnimating(false);
    }, 200);
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            My Assigned Courses
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-60 truncate"
            style={{ color: colors.textSecondary }}
          >
            View and monitor your courses.
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
        </div>
      </div>

      {/* Search Bar */}
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
            placeholder="Search my courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all text-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
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
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="rounded border overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md flex flex-col"
                style={cardStyle}
              >
                <div className="relative h-44 overflow-hidden bg-gray-100 group">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <BookOpen size={48} style={{ color: colors.text }} />
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
                      {course.category?.name || "Category"}
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3">
                    {course.priceType?.toLowerCase() === "free" ? (
                      <span className="px-3 py-1 rounded bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Free
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Lock size={10} />{" "}
                        {course.price ? `₹${course.price}` : "Premium"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    className="font-semibold text-base mb-1 line-clamp-1"
                    style={{ color: colors.text }}
                  >
                    {course.title}
                  </h3>

                  <div
                    className="mt-auto flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: colors.accent + "15" }}
                  >
                    <div
                      className="flex items-center gap-3 text-[10px] font-semibold opacity-50"
                      style={{ color: colors.textSecondary }}
                    >
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {course.duration || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          navigate(
                            `/instructor-dashboard/my-courses/view/${course._id}`,
                          )
                        }
                        className="p-2 cursor-pointer rounded transition-all"
                        style={{ color: colors.primary }}
                        title="View Course"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="flex items-center gap-4 p-4 rounded border hover:shadow-sm transition-all duration-200 group"
                style={cardStyle}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={
                      course.thumbnail?.url || "https://via.placeholder.com/150"
                    }
                    className="w-full h-full object-cover"
                    alt={course.title}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: colors.primary }}
                    >
                      {course.category?.name || "Category"}
                    </span>
                    <span className="opacity-20">•</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${course.priceType?.toLowerCase() === "free" ? "text-green-500" : "text-amber-500"}`}
                    >
                      {course.priceType?.toLowerCase() === "free"
                        ? "Free"
                        : `Premium ₹${course.price || ""}`}
                    </span>
                  </div>
                  <h3
                    onClick={() =>
                      navigate(
                        `/instructor-dashboard/my-courses/view/${course._id}`,
                      )
                    }
                    className="font-semibold cursor-pointer text-base truncate"
                    style={{ color: colors.text }}
                  >
                    {course.title}
                  </h3>
                </div>
                <div
                  className="hidden md:flex items-center gap-6 text-[11px] font-semibold opacity-40 uppercase tracking-widest mr-4"
                  style={{ color: colors.textSecondary }}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} /> {course.duration || "N/A"}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 border-l pl-4"
                  style={{ borderColor: colors.accent + "20" }}
                >
                  <button
                    onClick={() =>
                      navigate(
                        `/instructor-dashboard/my-courses/view/${course._id}`,
                      )
                    }
                    className="p-2.5 cursor-pointer rounded text-primary transition-all"
                    style={{ color: colors.primary }}
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div
            className="text-center py-20 border-2 border-dashed rounded opacity-30"
            style={{ borderColor: colors.accent + "30" }}
          >
            <BookOpen size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">No Courses Found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;
