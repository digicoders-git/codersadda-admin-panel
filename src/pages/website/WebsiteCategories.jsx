import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Search, Grid, List, Tag } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function WebsiteCategories() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // UI Only - No API calls
  useEffect(() => {
    setLoading(false);
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.technology?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id, technology) => {
    // UI Only - No API Integration
    toast.info("Website section is UI only - No backend integration");
  };

  const handleStatusToggle = async (id, currentStatus) => {
    // UI Only - No API Integration
    toast.info("Website section is UI only - No backend integration");
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "#22C55E" : "#EF4444";
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Tag size={24} style={{ color: colors.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Website Categories
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Manage technology categories for website
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/website/categories/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} />
          Add Category
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
            placeholder="Search categories..."
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

      {/* Categories Content */}
      <div className="flex-1 overflow-auto">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Tag
              size={48}
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              No categories found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.technology}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() =>
                        handleStatusToggle(category._id, category.status)
                      }
                      className="px-2 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80"
                      style={{
                        backgroundColor: getStatusColor(category.status),
                      }}
                    >
                      {category.status}
                    </button>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-4">
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: colors.text }}
                  >
                    {category.technology}
                  </h3>

                  <p
                    className="text-sm mb-4 line-clamp-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {category.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/website/categories/view/${category._id}`,
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
                          `/dashboard/website/categories/edit/${category._id}`,
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
                      onClick={() =>
                        handleDelete(category._id, category.technology)
                      }
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
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="rounded-lg border shadow-sm p-4 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Category Image */}
                  <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={category.image}
                      alt={category.technology}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-bold text-lg mb-1"
                          style={{ color: colors.text }}
                        >
                          {category.technology}
                        </h3>
                        <p
                          className="text-sm mb-2 line-clamp-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {category.description}
                        </p>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleStatusToggle(category._id, category.status)
                          }
                          className="px-3 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80"
                          style={{
                            backgroundColor: getStatusColor(category.status),
                          }}
                        >
                          {category.status}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/categories/view/${category._id}`,
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
                                `/dashboard/website/categories/edit/${category._id}`,
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
                              handleDelete(category._id, category.technology)
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

export default WebsiteCategories;
