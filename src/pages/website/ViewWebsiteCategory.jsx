import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Tag, Globe, FileText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
// import {
//   getCategoryById,
//   deleteCategory as apiDeleteCategory,
// } from "../../apis/courseCategory";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ViewWebsiteCategory() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await getCategoryById(id);
        if (res.success && res.data) {
          setCategory(res.data);
        } else {
          toast.error("Category not found");
          navigate("/dashboard/website/categories");
        }
      } catch (error) {
        toast.error("Failed to fetch category details");
        navigate("/dashboard/website/categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${category.technology}" category?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await apiDeleteCategory(id);
        if (res.success) {
          toast.success("Category deleted successfully!");
          navigate("/dashboard/website/categories");
        }
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "#22C55E" : "#EF4444";
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Category not found
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
            <Tag size={24} style={{ color: colors.primary }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                Category Details
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Website category information
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dashboard/website/categories/edit/${id}`)}
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

      {/* Category Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Image */}
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
                  src={category.image}
                  alt={category.technology}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 rounded text-sm font-bold text-white"
                    style={{ backgroundColor: getStatusColor(category.status) }}
                  >
                    {category.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Details */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg border shadow-sm p-6"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: colors.text }}
              >
                {category.technology}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Globe
                    size={20}
                    style={{ color: colors.primary }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Technology Stack
                    </p>
                    <p
                      className="font-semibold text-lg"
                      style={{ color: colors.text }}
                    >
                      {category.technology}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={20}
                    style={{ color: colors.primary }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Description
                    </p>
                    <p
                      className="leading-relaxed"
                      style={{ color: colors.text }}
                    >
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.primary + "10" }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    Technology
                  </div>
                  <div
                    className="text-sm font-semibold mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Category Type
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: getStatusColor(category.status) + "20",
                  }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: getStatusColor(category.status) }}
                  >
                    {category.status}
                  </div>
                  <div
                    className="text-sm font-semibold mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Current Status
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

export default ViewWebsiteCategory;
