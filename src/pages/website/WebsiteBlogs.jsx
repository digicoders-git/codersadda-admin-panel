import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getBlogs,
  deleteBlog as apiDeleteBlog,
  toggleBlogStatus as apiToggleBlogStatus,
} from "../../apis/blog";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function WebsiteBlogs() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogs();
      if (res.success) {
        setBlogs(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${title}"?`,
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
          toast.success("Blog deleted successfully!");
          setBlogs((prev) => prev.filter((b) => b._id !== id));
        }
      } catch (err) {
        toast.error("Failed to delete blog");
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await apiToggleBlogStatus(id);
      if (res.success) {
        // Assuming API returns updated object or we just toggle locally
        const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
        setBlogs((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)),
        );
        toast.success(`Blog status updated successfully`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText size={24} style={{ color: colors.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Website Blogs
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Manage blog posts and articles
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/website/blogs/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} />
          Add Blog
        </button>
      </div>

      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search blogs..."
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

      <div className="flex-1 overflow-auto">
        {filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText
              size={48}
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              No blogs found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleStatusToggle(blog._id, blog.status)}
                      className={`px-2 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                        blog.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {blog.status}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div
                    className="text-xs mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    {formatDate(blog.createdAt)}
                  </div>

                  <h3
                    className="font-bold text-lg mb-2 line-clamp-2"
                    style={{ color: colors.text }}
                  >
                    {blog.title}
                  </h3>

                  <p
                    className="text-sm mb-4 line-clamp-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {blog.description}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/website/blogs/view/${blog._id}`)
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
                        navigate(`/dashboard/website/blogs/edit/${blog._id}`)
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
                      onClick={() => handleDelete(blog._id, blog.title)}
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
          <div className="space-y-4">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="rounded-lg border shadow-sm p-4 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className="text-xs mb-1"
                          style={{ color: colors.textSecondary }}
                        >
                          {formatDate(blog.createdAt)}
                        </div>
                        <h3
                          className="font-bold text-lg mb-1"
                          style={{ color: colors.text }}
                        >
                          {blog.title}
                        </h3>
                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {blog.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleStatusToggle(blog._id, blog.status)
                          }
                          className={`px-3 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                            blog.status === "Active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {blog.status}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/blogs/view/${blog._id}`,
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
                                `/dashboard/website/blogs/edit/${blog._id}`,
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
                            onClick={() => handleDelete(blog._id, blog.title)}
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

export default WebsiteBlogs;
