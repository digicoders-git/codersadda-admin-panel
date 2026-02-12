import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Layers,
  BookOpen,
  Download,
  Lock,
  Eye,
  User,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";
import {
  getEbookCategories,
  createEbookCategory,
  updateEbookCategory,
  deleteEbookCategory,
} from "../../apis/ebookCategory";
import { getEbooks, deleteEbook, updateEbook } from "../../apis/ebook";

function EBooks() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "ebooks";
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [ebookCategories, setEbookCategories] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Category specific states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [newCatStatus, setNewCatStatus] = useState("Active");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, ebooksRes] = await Promise.all([
        getEbookCategories(),
        getEbooks(),
      ]);

      if (catsRes && catsRes.success) setEbookCategories(catsRes.data);
      if (ebooksRes && ebooksRes.success) setEbooks(ebooksRes.data);
    } catch (error) {
      console.error("Error fetching ebook data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering
  const filteredCategories = ebookCategories.filter((cat) =>
    (cat.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredEbooks = ebooks.filter(
    (book) =>
      (book.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof book.category === "object"
        ? book.category?.name || ""
        : book.category || ""
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (book.authorName &&
        book.authorName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Category Actions
  const handleAddCategory = async () => {
    if (newCatName.trim()) {
      try {
        setActionLoading("adding");
        const res = await createEbookCategory({
          name: newCatName,
          status: newCatStatus,
        });
        if (res.success) {
          setEbookCategories([...ebookCategories, res.data]);
          toast.success("Category added successfully!");
          setNewCatName("");
          setNewCatStatus("Active");
          setIsCatModalOpen(false);
        } else {
          toast.error(res.message || "Failed to add category");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error adding category");
      } finally {
        setActionLoading(null);
      }
    } else {
      toast.error("Please enter a category name");
    }
  };

  const startEditCat = (cat) => {
    setEditingCatId(cat._id);
    setEditingCatName(cat.name);
  };

  const saveEditCat = async (id) => {
    if (editingCatName.trim()) {
      try {
        setActionLoading(id);
        const res = await updateEbookCategory(id, { name: editingCatName });
        if (res.success) {
          setEbookCategories((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, name: editingCatName } : c,
            ),
          );
          toast.success("Category updated successfully!");
          setEditingCatId(null);
        }
      } catch (err) {
        toast.error("Failed to update category");
      } finally {
        setActionLoading(null);
      }
    } else {
      toast.error("Category name cannot be empty");
    }
  };

  const handleDeleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting this category will not remove the books assigned to it.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete category!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await deleteEbookCategory(id);
          if (res.success) {
            setEbookCategories((prev) => prev.filter((c) => c._id !== id));
            toast.success("Category deleted!");
          }
        } catch (err) {
          toast.error("Failed to delete category");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleDeleteEbook = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this book record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete ebook!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await deleteEbook(id);
          if (res.success) {
            setEbooks((prev) => prev.filter((b) => b._id !== id));
            toast.success("E-Book deleted successfully!");
          }
        } catch (err) {
          toast.error("Failed to delete ebook");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const toggleCatStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
    try {
      setActionLoading(id);
      const res = await updateEbookCategory(id, { status: newStatus });
      if (res.success) {
        setEbookCategories((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)),
        );
        toast.info(`Category ${newStatus}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleEbookStatus = async (id, currentIsActive) => {
    const newIsActive = !currentIsActive;
    try {
      setActionLoading(id);
      const res = await updateEbook(id, { isActive: newIsActive });
      if (res.success) {
        setEbooks((prev) =>
          prev.map((b) => (b._id === id ? { ...b, isActive: newIsActive } : b)),
        );
        toast.info(`E-Book ${newIsActive ? "Activated" : "Disabled"}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* {actionLoading === "global" && <Loader size={128} fullPage={true} />} */}
      {/* Header Section */}
      <div className="shrink-0 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ color: colors.text }}
          >
            {activeTab === "categories" ? "E-Book Categories" : "All E-Books"}
          </h1>
          <p
            className="text-xs opacity-50 font-medium"
            style={{ color: colors.textSecondary }}
          >
            Manage your digital library and resources
          </p>
        </div>
      </div>

      {/* Search and Add Section */}
      <div
        className="shrink-0 mb-6 flex flex-col sm:flex-row gap-4 sticky top-0 z-30 pb-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="flex-1 relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30"
            style={{ color: colors.text }}
          />
          <input
            type="text"
            placeholder={
              activeTab === "categories"
                ? "Search categories..."
                : "Search E-Books..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all text-sm font-medium"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>

        {activeTab === "categories" ? (
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Plus size={16} /> New Category
          </button>
        ) : (
          <button
            onClick={() => navigate("/dashboard/ebooks/add")}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Plus size={16} /> Add E-Book
          </button>
        )}
      </div>

      {/* Content Area */}
      <div
        className="flex-1 min-h-0 flex flex-col rounded border shadow-sm w-full overflow-hidden"
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
            <div className="flex items-center justify-center h-64">
              <Loader size={80} />
            </div>
          ) : activeTab === "categories" ? (
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
                    className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest w-16 text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Sr.
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textSecondary }}
                  >
                    Category Name
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right"
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
                {filteredCategories.map((cat, idx) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-opacity-5 transition-colors"
                    style={{ color: colors.text }}
                  >
                    <td className="px-4 py-4 text-xs font-bold opacity-30 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      {editingCatId === cat._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="px-3 py-1.5 rounded border outline-none text-sm font-semibold w-full max-w-xs"
                            style={{
                              backgroundColor: colors.background,
                              color: colors.text,
                              borderColor: colors.primary,
                            }}
                            autoFocus
                            onKeyPress={(e) =>
                              e.key === "Enter" && saveEditCat(cat._id)
                            }
                          />
                          <button
                            onClick={() => saveEditCat(cat._id)}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 cursor-pointer"
                          >
                            {actionLoading === cat._id ? (
                              <Loader size={18} />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: colors.primary + "10",
                              color: colors.primary,
                            }}
                          >
                            <Layers size={16} />
                          </div>
                          <span className="text-sm font-bold">{cat.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <Toggle
                          active={cat.status === "Active"}
                          onClick={() => toggleCatStatus(cat._id, cat.status)}
                        />
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider ${cat.status === "Active" ? "text-green-500" : "text-red-500"}`}
                        >
                          {cat.status || "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingCatId !== cat._id && (
                          <>
                            <button
                              onClick={() => startEditCat(cat)}
                              className="w-9 h-9 flex items-center justify-center rounded cursor-pointer transition-all hover:bg-opacity-20"
                              style={{
                                color: colors.primary,
                                backgroundColor: colors.primary + "10",
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="w-9 h-9 flex items-center justify-center rounded cursor-pointer transition-all hover:bg-opacity-20"
                              style={{
                                color: "#ef4444",
                                backgroundColor: "#ef444415",
                              }}
                            >
                              {actionLoading === cat._id ? (
                                <Loader size={16} />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-20 text-center opacity-30">
                      <Layers size={48} className="mx-auto mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        No Categories Found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
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
                    className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest w-16 text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Sr.
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textSecondary }}
                  >
                    E-Book Name
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textSecondary }}
                  >
                    Author
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textSecondary }}
                  >
                    Price
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textSecondary }}
                  >
                    Category
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textSecondary }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right"
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
                {filteredEbooks.map((book, idx) => (
                  <tr
                    key={book._id}
                    className="hover:bg-opacity-5 transition-colors"
                    style={{ color: colors.text }}
                  >
                    <td className="px-4 py-4 text-xs font-bold opacity-30 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: "#ef444410",
                            color: "#ef4444",
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold truncate max-w-[150px]">
                            {book.title}
                          </span>
                          <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider">
                            {book.fileSize || "2.4 MB"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="opacity-30" />
                        <span className="text-sm font-semibold opacity-70">
                          {book.authorName || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold opacity-80">
                        {book.priceType === "paid" ? `₹${book.price}` : "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: colors.primary + "15",
                          color: colors.primary,
                        }}
                      >
                        {typeof book.category === "object"
                          ? book.category?.name
                          : book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Toggle
                          active={book.isActive}
                          onClick={() =>
                            toggleEbookStatus(book._id, book.isActive)
                          }
                        />
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider ${book.isActive ? "text-green-500" : "text-red-500"}`}
                        >
                          {book.isActive ? "ACTIVE" : "DISABLED"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/ebooks/view/${book._id}`)
                          }
                          className="w-9 h-9 flex items-center justify-center rounded cursor-pointer transition-all hover:bg-opacity-20"
                          style={{
                            color: colors.primary,
                            backgroundColor: colors.primary + "15",
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/ebooks/edit/${book._id}`)
                          }
                          className="w-9 h-9 flex items-center justify-center rounded cursor-pointer transition-all hover:bg-opacity-20"
                          style={{
                            color: colors.accent,
                            backgroundColor: colors.accent + "15",
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEbook(book._id)}
                          className="w-9 h-9 flex items-center justify-center rounded cursor-pointer transition-all hover:bg-opacity-20"
                          style={{
                            color: "#ef4444",
                            backgroundColor: "#ef444415",
                          }}
                        >
                          {actionLoading === book._id ? (
                            <Loader size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEbooks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center opacity-30">
                      <FileText size={48} className="mx-auto mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        No E-Books Found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCatModalOpen(false)}
          />
          <div
            className="relative w-full max-w-md rounded p-8 shadow-2xl border"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                Create E-Book Category
              </h2>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-2 rounded-lg hover:bg-black/10 transition-all cursor-pointer"
                style={{ color: colors.text }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest opacity-50"
                  style={{ color: colors.text }}
                >
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Technical Books"
                  className="w-full px-4 py-3 rounded border outline-none font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "20",
                    color: colors.text,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) =>
                    (e.target.style.borderColor = colors.accent + "20")
                  }
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest opacity-50"
                  style={{ color: colors.text }}
                >
                  Initial Status
                </label>
                <div className="flex gap-4">
                  {["Active", "Disabled"].map((stat) => (
                    <button
                      key={stat}
                      type="button"
                      onClick={() => setNewCatStatus(stat)}
                      className={`flex-1 py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        newCatStatus === stat
                          ? "bg-primary text-white border-primary"
                          : "bg-transparent opacity-40 border-accent/20"
                      }`}
                      style={{
                        backgroundColor:
                          newCatStatus === stat
                            ? colors.primary
                            : "transparent",
                        borderColor:
                          newCatStatus === stat
                            ? colors.primary
                            : colors.accent + "20",
                      }}
                    >
                      {stat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 py-3 rounded font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  {actionLoading === "adding" ? (
                    <Loader size={18} variant="button" />
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-3 rounded font-bold uppercase tracking-widest text-xs transition-all border opacity-60 cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                    color: colors.text,
                    borderColor: colors.accent + "20",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EBooks;
