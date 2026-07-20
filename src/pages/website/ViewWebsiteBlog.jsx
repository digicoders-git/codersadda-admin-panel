import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getBlogById, deleteBlog as apiDeleteBlog } from "../../apis/blog";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ViewWebsiteBlog() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await getBlogById(id);
        if (res.success && res.data) {
          setBlog(res.data);
        } else {
          toast.error("Blog not found");
          navigate("/dashboard/website/blogs");
        }
      } catch (error) {
        toast.error("Failed to fetch blog details");
        navigate("/dashboard/website/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${blog.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await apiDeleteBlog(id);
        if (res.success) {
          toast.success("Blog deleted successfully");
          navigate("/dashboard/website/blogs");
        }
      } catch (err) {
        toast.error("Failed to delete blog");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!blog) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Blog not found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
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
            <FileText size={24} style={{ color: colors.primary }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                Blog Details
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Blog post information
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dashboard/website/blogs/edit/${id}`)}
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

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded text-sm font-bold text-white ${
                      blog.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} style={{ color: colors.primary }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Created At
                  </span>
                </div>
                <p className="font-semibold" style={{ color: colors.text }}>
                  {formatDate(blog.createdAt)}
                </p>
              </div>
            </div>
          </div>

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
                {blog.title}
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar size={20} style={{ color: colors.primary }} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Publication Date
                    </p>
                    <p className="font-semibold" style={{ color: colors.text }}>
                      {formatDate(blog.createdAt)}
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
                      className={`inline-block px-2 py-1 rounded text-sm font-bold text-white mt-1 ${
                        blog.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.primary }}
                  >
                    Blog Content
                  </h3>
                  <div
                    className="p-4 rounded-lg leading-relaxed"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.text,
                      border: `1px solid ${colors.accent}30`,
                    }}
                  >
                    {blog.description}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.primary + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {blog.title.split(" ").length}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Title Words
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
                    {blog.description.split(" ").length}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Content Words
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor:
                      blog.status === "Active" ? "#22C55E20" : "#EF444420",
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: blog.status === "Active" ? "#22C55E" : "#EF4444",
                    }}
                  >
                    {blog.status}
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

export default ViewWebsiteBlog;
