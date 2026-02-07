import {
  Plus,
  X,
  Edit2,
  Trash2,
  Check,
  Search,
  Layers,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getEbookCategories,
  createEbookCategory,
  updateEbookCategory,
  deleteEbookCategory,
} from "../../apis/ebookCategory";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";

function EbookCategory() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getEbookCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => setShowModalContent(true), 10);
    } else {
      setShowModalContent(false);
    }
  }, [isModalOpen]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setShowModalContent(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setCategoryName("");
    }, 300);
  };

  const handleAddCategory = async () => {
    if (categoryName.trim()) {
      try {
        setGlobalLoading(true);
        const res = await createEbookCategory({ name: categoryName });
        if (res.success) {
          await fetchCategories();
          toast.success("Category added successfully!");
          handleCloseModal();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error adding category");
      } finally {
        setGlobalLoading(false);
      }
    } else {
      toast.error("Please enter a category name");
    }
  };

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
          const res = await deleteEbookCategory(id);
          if (res.success) {
            setCategories((prev) => prev.filter((cat) => cat._id !== id));
            toast.success("Category deleted successfully!");
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
    setEditingName(category.name);
  };

  const handleEditSave = async (id) => {
    if (editingName.trim()) {
      try {
        setActionLoading(id);
        const res = await updateEbookCategory(id, { name: editingName });
        if (res.success) {
          await fetchCategories();
          toast.success("Category updated successfully!");
          setEditingId(null);
          setEditingName("");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error updating category");
      } finally {
        setActionLoading(null);
      }
    } else {
      toast.error("Category name cannot be empty");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const toggleStatus = async (id, currentIsActive) => {
    const newIsActive = !currentIsActive;
    try {
      setActionLoading(id);
      const res = await updateEbookCategory(id, { isActive: newIsActive });
      if (res.success) {
        await fetchCategories();
        toast.success(`Category ${newIsActive ? "activated" : "disabled"}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {globalLoading && <Loader size={128} fullPage={true} />}
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
            E-Book Categories
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-50 mt-1"
            style={{ color: colors.text }}
          >
            Manage your E-Book content taxonomies
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-300"
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded outline-none border transition-all text-xs font-medium"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "15",
                color: colors.text,
              }}
            />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex-none px-4 py-2 cursor-pointer rounded font-semibold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Plus size={16} /> <span className="text-xs">New</span>
          </button>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 flex flex-col rounded border shadow-sm w-full overflow-hidden"
        style={{
          borderColor: colors.accent + "15",
          backgroundColor: colors.sidebar || colors.background,
        }}
      >
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center p-20 h-64">
              <Loader size={80} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-auto">
              <thead
                className="sticky top-0 z-30"
                style={{ backgroundColor: colors.sidebar || colors.background }}
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
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category._id}
                    className="hover:bg-opacity-10 transition-colors"
                    style={{ color: colors.text }}
                  >
                    <td className="px-4 py-4 text-xs font-bold opacity-30 text-center whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === category._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-3 py-1.5 rounded border outline-none text-sm font-semibold w-full max-w-xs"
                            style={{
                              backgroundColor: colors.background,
                              color: colors.text,
                              borderColor: colors.primary,
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditSave(category._id)}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === category._id ? (
                              <Loader size={18} />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>
                          <button
                            onClick={handleEditCancel}
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
                            <BookOpen size={16} />
                          </div>
                          <span className="text-sm font-bold">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
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
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {editingId !== category._id && (
                          <>
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
                              onClick={() => handleDeleteCategory(category._id)}
                              className="p-2 cursor-pointer rounded-xl transition-all hover:bg-opacity-20 disabled:opacity-50"
                              style={{
                                color: "#ef4444",
                                backgroundColor: "#ef444415",
                              }}
                            >
                              {actionLoading === category._id ? (
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
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${showModalContent ? "opacity-100" : "opacity-0"}`}
            onClick={handleCloseModal}
          />
          <div
            className={`relative rounded p-10 w-full max-w-lg border transition-all duration-500 transform ${showModalContent ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-90"}`}
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  Create E-Book Category
                </h2>
                <div
                  className="w-12 h-1.5 rounded-full mt-2"
                  style={{ backgroundColor: colors.primary }}
                ></div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-12 h-12 cursor-pointer rounded-2xl transition-all flex items-center justify-center border hover:rotate-90"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "20",
                  backgroundColor: colors.background,
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-8">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Programming"
                className="w-full px-6 py-4 rounded outline-none border-2 transition-all font-bold text-lg"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.accent + "20",
                }}
                autoFocus
              />
              <div
                className="flex gap-4 pt-6 border-t"
                style={{ borderColor: colors.accent + "10" }}
              >
                <button
                  onClick={handleAddCategory}
                  className="flex-1 py-4 cursor-pointer rounded font-bold uppercase tracking-widest text-sm transition-all"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-8 py-4 cursor-pointer rounded font-bold uppercase tracking-widest text-[10px] transition-all border opacity-60"
                  style={{
                    backgroundColor: "transparent",
                    color: colors.text,
                    borderColor: colors.accent + "30",
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

export default EbookCategory;
