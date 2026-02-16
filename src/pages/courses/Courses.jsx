import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Users,
  Trash2,
  Edit2,
  Eye,
  LayoutGrid,
  List,
  Lock,
  ArrowLeft,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllCourses,
  deleteCourse as apiDeleteCourse,
  toggleCourseStatus,
  getCategoriesWithCount,
} from "../../apis/course";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";

function Courses() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  // Data States
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [limit] = useState(10);

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesWithCount();
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        category: selectedCategory === "all" ? "" : selectedCategory,
        isActive: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit,
      };

      const res = await getAllCourses(params);
      if (res.success) {
        setCourses(res.data);
        setTotalItems(res.total || 0);
        setTotalPages(Math.ceil((res.total || 0) / limit));
        setActiveCount(res.activeCount || 0);
        setInactiveCount(res.inactiveCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(
      () => {
        fetchData();
      },
      searchQuery ? 500 : 0,
    );

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, statusFilter, currentPage, fetchData]);

  const toggleStatus = async (id) => {
    try {
      setActionLoading(id);
      const res = await toggleCourseStatus(id);
      if (res.success) {
        toast.info(res.message);
        fetchData(); // Reload to update counts
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently remove the course and its curriculum.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete course!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await apiDeleteCourse(id);
          if (res.success) {
            toast.success("Course deleted successfully!");
            fetchData();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error deleting course");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  // Dropdown Options
  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...categories.map((cat) => ({
      label: `${cat.name} (${cat.courseCount})`,
      value: cat._id,
    })),
  ];

  const statusOptions = [
    { label: `All Status (${activeCount + inactiveCount})`, value: "all" },
    { label: `Active Only (${activeCount})`, value: "true" },
    { label: `Inactive Only (${inactiveCount})`, value: "false" },
  ];

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
        className="shrink-0 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ backgroundColor: colors.background }}
      >
        <div>
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ color: colors.text }}
          >
            Course Management
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-60"
            style={{ color: colors.textSecondary }}
          >
            Design and organize your learning content.
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
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-all cursor-pointer ${viewMode === "grid" ? "shadow-sm" : "opacity-50"}`}
              style={{
                backgroundColor:
                  viewMode === "grid" ? colors.accent : "transparent",
                color: viewMode === "grid" ? colors.background : colors.text,
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-all cursor-pointer ${viewMode === "list" ? "shadow-sm" : "opacity-50"}`}
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
            onClick={() => navigate("/dashboard/courses/add")}
            className="flex items-center cursor-pointer gap-2 px-6 py-2 rounded font-semibold transition-all shadow-md active:scale-95"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Plus size={18} /> <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="shrink-0 px-4 md:px-6 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by title, technology or instructor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all text-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-56">
            <ModernSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              placeholder="Filter by Category"
            />
          </div>
          <div className="w-full sm:w-56">
            <ModernSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              placeholder="Filter by Status"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-auto px-4 md:px-6 pb-6 scrollbar-thin scrollbar-thumb-rounded-full"
        style={{ scrollbarColor: `${colors.accent}40 transparent` }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
            <Loader size={80} />
            <p className="mt-4 text-sm font-medium opacity-40 animate-pulse">
              Fetching courses...
            </p>
          </div>
        ) : courses.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-3"
            }
          >
            {courses.map((course) =>
              viewMode === "grid" ? (
                <div
                  key={course._id}
                  className="rounded border overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md flex flex-col"
                  style={cardStyle}
                >
                  <div
                    onClick={() =>
                      navigate(`/dashboard/courses/view/${course._id}`)
                    }
                    className="relative cursor-pointer h-44 overflow-hidden bg-gray-100 group"
                  >
                    {course.thumbnail?.url ? (
                      <img
                        src={course.thumbnail.url}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <BookOpen size={48} />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 bg-black/40 text-white">
                        {course.category?.name || "Uncategorized"}
                      </div>
                      <div className="flex items-center gap-2 backdrop-blur-md bg-black/40 p-1 px-2 rounded-full border border-white/10 w-fit">
                        {actionLoading === course._id ? (
                          <Loader size={12} variant="button" />
                        ) : (
                          <Toggle
                            active={course.isActive}
                            onClick={() => toggleStatus(course._id)}
                          />
                        )}
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider ${course.isActive ? "text-green-400" : "text-red-400"}`}
                        >
                          {course.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 text-white">
                      {course.priceType?.toLowerCase() === "free" ? (
                        <span className="px-3 py-1 rounded bg-green-500 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          Free
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded bg-amber-500 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
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
                    <p
                      className="text-xs font-medium opacity-60 mb-6"
                      style={{ color: colors.textSecondary }}
                    >
                      {course.instructor?.fullName || "No Instructor"}
                    </p>
                    <div
                      className="mt-auto flex items-center justify-between pt-4 border-t"
                      style={{ borderColor: colors.accent + "15" }}
                    >
                      <div
                        className="flex items-center gap-3 text-[10px] font-semibold opacity-50"
                        style={{ color: colors.textSecondary }}
                      >
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {course.duration || "0h"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {course.studentsCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/courses/view/${course._id}`)
                          }
                          className="p-2 cursor-pointer rounded hover:bg-black/5"
                          style={{ color: colors.primary }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/courses/edit/${course._id}`)
                          }
                          className="p-2 cursor-pointer rounded hover:bg-black/5"
                          style={{ color: colors.primary }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          disabled={actionLoading === course._id}
                          className="p-2 cursor-pointer rounded hover:bg-black/5 disabled:opacity-50"
                          style={{ color: "#ef4444" }}
                        >
                          {actionLoading === course._id ? (
                            <Loader size={18} variant="button" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={course._id}
                  className="flex items-center gap-4 p-4 rounded border hover:shadow-sm transition-all duration-200"
                  style={cardStyle}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={
                        course.thumbnail?.url ||
                        "https://via.placeholder.com/150"
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: colors.primary }}
                      >
                        {course.category?.name || "No Category"}
                      </span>
                      <span className="opacity-20">•</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${course.priceType?.toLowerCase() === "free" ? "text-green-500" : "text-amber-500"}`}
                      >
                        {course.priceType?.toLowerCase() === "free"
                          ? "Free"
                          : `₹${course.price || ""}`}
                      </span>
                      <span className="opacity-20">•</span>
                      <div className="flex items-center gap-2">
                        {actionLoading === course._id ? (
                          <Loader size={12} variant="button" />
                        ) : (
                          <Toggle
                            active={course.isActive}
                            onClick={() => toggleStatus(course._id)}
                          />
                        )}
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider ${course.isActive ? "text-green-500" : "text-red-500"}`}
                        >
                          {course.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <h3
                      onClick={() =>
                        navigate(`/dashboard/courses/view/${course._id}`)
                      }
                      className="font-semibold cursor-pointer text-base truncate"
                      style={{ color: colors.text }}
                    >
                      {course.title}
                    </h3>
                    <p
                      className="text-xs font-medium opacity-60"
                      style={{ color: colors.textSecondary }}
                    >
                      {course.instructor?.fullName || "No Instructor"}
                    </p>
                  </div>
                  <div
                    className="hidden md:flex items-center gap-6 text-[11px] font-semibold opacity-40 uppercase tracking-widest mr-4"
                    style={{ color: colors.textSecondary }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} /> {course.duration || "0h"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={16} /> {course.studentsCount || 0}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 border-l pl-4"
                    style={{ borderColor: colors.accent + "20" }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/dashboard/courses/view/${course._id}`)
                      }
                      className="p-2 cursor-pointer rounded hover:bg-black/5"
                      style={{ color: colors.primary }}
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/courses/edit/${course._id}`)
                      }
                      className="p-2 cursor-pointer rounded hover:bg-black/5"
                      style={{ color: colors.primary }}
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={actionLoading === course._id}
                      className="p-2 cursor-pointer rounded hover:bg-black/5 disabled:opacity-50 text-red-500"
                    >
                      {actionLoading === course._id ? (
                        <Loader size={20} variant="button" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div
            className="text-center py-32 rounded-3xl border-4 border-dashed flex flex-col items-center justify-center gap-6 opacity-30"
            style={{
              borderColor: colors.accent + "15",
              color: colors.textSecondary,
            }}
          >
            <BookOpen size={64} className="animate-pulse" />
            <div>
              <p className="text-2xl font-bold uppercase tracking-widest">
                No course in this category
              </p>
              <p className="text-sm font-medium mt-2 text-center max-w-sm">
                Try searching for something else or check another status filter.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div
            className="mt-8 px-6 py-4 border rounded-xl flex items-center justify-between"
            style={{
              borderColor: colors.accent + "10",
              backgroundColor: colors.sidebar || colors.background,
            }}
          >
            <span
              className="text-xs font-semibold"
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
                  <ArrowLeft size={14} />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === p ? "shadow-sm" : "hover:bg-black/5"}`}
                        style={{
                          backgroundColor:
                            currentPage === p ? colors.primary : "transparent",
                          color:
                            currentPage === p ? colors.background : colors.text,
                          border:
                            currentPage === p
                              ? "none"
                              : `1px solid ${colors.accent}20`,
                        }}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === currentPage - 2 || p === currentPage + 2)
                    return (
                      <span key={p} className="opacity-40 text-xs">
                        ...
                      </span>
                    );
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
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
