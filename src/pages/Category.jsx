import {
  Plus,
  X,
  Edit2,
  Trash2,
  Check,
  Search,
  Layers,
  ChevronRight,
  Hash,
  ChartBarStacked,
  School,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  getCourseCategories,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
} from "../apis/courseCategory";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../components/ui/Toggle";
import Loader from "../components/Loader";
import ModernSelect from "../components/ModernSelect";

function Category() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Filter and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [totalItems, setTotalItems] = useState(0);

  // Form States
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCourseCategories({
        search: searchQuery,
        isActive: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: limit,
      });
      if (res.success) {
        setCategories(res.data);
        setTotalItems(res.total);
        setTotalPages(Math.ceil(res.total / limit));
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage, limit]);

  useEffect(() => {
    setLoading(true); // Show loader immediately on any change
    if (!searchQuery) {
      // Immediate fetch for pagination and status changes when not searching
      fetchCategories();
    } else {
      // Debounce only for search queries
      const delayDebounceFn = setTimeout(() => {
        fetchCategories();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, statusFilter, currentPage, fetchCategories]);

  // Add or Update Category
  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setGlobalLoading(true);
      if (editingId) {
        const res = await updateCourseCategory(editingId, {
          name: categoryName,
        });
        if (res.success) {
          toast.success("Category updated successfully!");
          setEditingId(null);
          setCategoryName("");
          fetchCategories();
        }
      } else {
        const res = await createCourseCategory({ name: categoryName });
        if (res.success) {
          toast.success("Category added successfully!");
          setCategoryName("");
          fetchCategories();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing category");
    } finally {
      setGlobalLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await deleteCourseCategory(id);
          if (res.success) {
            toast.success("Category deleted successfully!");
            fetchCategories();
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error deleting category",
          );
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleEditStart = (category) => {
    setEditingId(category._id);
    setCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryName("");
  };

  const toggleStatus = async (id, currentIsActive) => {
    const newIsActive = !currentIsActive;
    try {
      setActionLoading(id);
      const res = await updateCourseCategory(id, { isActive: newIsActive });
      if (res.success) {
        toast.success(`Category ${newIsActive ? "activated" : "disabled"}`);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    } finally {
      setActionLoading(null);
    }
  };

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
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
            Course Categories
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-50 mt-1"
            style={{ color: colors.text }}
          >
            Manage and organize your course taxonomy
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search categories..."
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
              placeholder="Filter by Status"
            />
          </div>
        </div>
      </div>

      {/* Main Content Split Layout */}
      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
        {/* Left Side: Table */}
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
            {loading ? (
              <div className="flex items-center justify-center p-20 h-full min-h-[400px]">
                <Loader size={80} />
              </div>
            ) : categories.length > 0 ? (
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
                      Category Name
                    </th>
                    <th
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ divideColor: colors.accent + "08" }}
                >
                  {categories.map((category, index) => (
                    <tr
                      key={category._id}
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
                          <span className="text-sm font-bold">
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center items-center gap-2 relative">
                          {actionLoading === category._id ? (
                            <div className="flex items-center gap-2">
                              <Loader size={12} variant="button" />
                              <span className="text-[9px] font-black uppercase tracking-wider opacity-50">
                                Wait...
                              </span>
                            </div>
                          ) : (
                            <>
                              <Toggle
                                active={category.isActive}
                                onClick={() =>
                                  toggleStatus(category._id, category.isActive)
                                }
                              />
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider ${category.isActive ? "text-green-500" : "text-red-500"}`}
                              >
                                {category.isActive ? "ACTIVE" : "DISABLED"}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditStart(category)}
                            className="p-2 cursor-pointer rounded-xl transition-all hover:bg-opacity-20"
                            style={{
                              color: colors.primary,
                              backgroundColor: colors.primary + "10",
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            disabled={actionLoading === category._id}
                            onClick={() => handleDeleteCategory(category._id)}
                            className="p-2 cursor-pointer rounded-xl transition-all hover:bg-opacity-20 disabled:opacity-50 flex items-center justify-center min-w-[36px] min-h-[36px]"
                            style={{
                              color: "#ef4444",
                              backgroundColor: "#ef444415",
                            }}
                          >
                            {actionLoading === category._id ? (
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
                <Layers size={64} className="mb-4" />
                <p className="text-xl font-bold uppercase tracking-widest">
                  No Categories Found
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
                    <ArrowLeft size={14} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first page, last page, and pages around current page
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
                    <ArrowRight size={14} />
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
                {editingId ? "Edit Category" : "Add New Category"}
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
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Frontend Development"
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
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={globalLoading}
                  className="w-full py-3 rounded font-bold uppercase tracking-widest text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  {globalLoading ? (
                    <Loader size={16} variant="button" />
                  ) : editingId ? (
                    <>
                      <Check size={16} /> Update
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Create
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
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

          {/* Quick Stats or Tips Box */}
          <div
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
              <Layers size={16} /> Quick Tip
            </h3>
            <p
              className="text-xs leading-relaxed opacity-70"
              style={{ color: colors.text }}
            >
              Categories help students find your courses faster. Keep them
              descriptive and concise for better searchability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Category;
