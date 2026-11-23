import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Download,
  Eye,
  Check,
  X,
  Upload,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import {
  getFreeDownloads,
  deleteFreeDownload,
} from "../../apis/freeDownload";

function FreeDownloads() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [downloads, setDownloads] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await getFreeDownloads(params);
      if (res && res.success) {
        setDownloads(res.data || []);
        if (res.categories) {
          setCategories(res.categories);
        }
      }
    } catch (error) {
      console.error("Error fetching free downloads:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const getFileUrl = (file) => {
    if (!file) return "";
    const rawUrl = file.url || file.localUrl || "";
    if (!rawUrl) return "";
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3900";
    if (rawUrl.includes("/uploads/")) {
      const relativePath = rawUrl.substring(rawUrl.indexOf("/uploads/"));
      return `${apiBase}${relativePath}`;
    }
    return rawUrl;
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This file will be permanently removed for all app users!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteFreeDownload(id);
        if (res.success) {
          toast.success("Material deleted successfully");
          fetchData();
        } else {
          toast.error(res.message || "Failed to delete");
        }
      } catch (err) {
        toast.error("Failed to delete material");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-600" />
            Free Downloads & Study Materials
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Files uploaded here are directly accessible to all users in the mobile app (Free & Paid).
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/free-downloads/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Upload New Material
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-72">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-900"
          >
            Search
          </button>
        </form>
      </div>

      {/* Downloads List / Table */}
      {loading ? (
        <Loader />
      ) : downloads.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No Materials Uploaded Yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Click "Upload New Material" to upload PDFs, Notes, or study resources.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Material / File</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-center">Downloads</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {downloads.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {item.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {item.authorName || "Admin"}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-500">
                      {item.file?.fileSize || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <Download className="w-3 h-3" />
                        {item.downloadCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(item.file?.url || item.file?.localUrl) && (
                          <a
                            href={getFileUrl(item.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View File"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default FreeDownloads;
