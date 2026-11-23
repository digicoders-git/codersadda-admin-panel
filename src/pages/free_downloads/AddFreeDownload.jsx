import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { ChevronLeft, Upload, FileText } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { createFreeDownload } from "../../apis/freeDownload";

function AddFreeDownload() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "Study Material",
    authorName: "Admin",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [fileSize, setFileSize] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Study Material",
    "Notes",
    "Source Code",
    "Syllabus",
    "Question Paper",
    "E-Books",
    "Cheat Sheet",
    "Other",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileSize((selectedFile.size / (1024 * 1024)).toFixed(2) + " MB");
    }
  };

  const handleImageChange = (e) => {
    const selectedImg = e.target.files[0];
    if (selectedImg) {
      setImage(selectedImg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.warning("Title is required");
    if (!file) return toast.warning("Please upload a file (PDF, Doc, Zip)");

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("category", formData.category);
      data.append("authorName", formData.authorName);
      data.append("description", formData.description);
      data.append("fileSize", fileSize);
      data.append("file", file);
      if (image) {
        data.append("image", image);
      }

      const res = await createFreeDownload(data);
      if (res && res.success) {
        toast.success("Material uploaded successfully! It is now live in the mobile app.");
        navigate("/dashboard/free-downloads");
      } else {
        toast.error(res.message || "Failed to upload material");
      }
    } catch (err) {
      console.error("Error creating material:", err);
      toast.error("Error uploading material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/free-downloads")}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Upload Free Study Material / Download
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Files added here will be downloadable by all app users immediately.
          </p>
        </div>
      </div>

      {loading && <Loader />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
            Material Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Flutter Complete Notes PDF, Python Cheat Sheet"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category & Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Author / Uploader Name
            </label>
            <input
              type="text"
              placeholder="e.g. DigiCoders, CodersAdda Team"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
            Description
          </label>
          <textarea
            rows="3"
            placeholder="Brief info about what this file contains..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* File Upload Box */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
            Upload File (PDF, ZIP, DOC, etc.) <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              required
            />
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-blue-500 mb-2" />
              {file ? (
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">{fileSize}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-700">
                    Click or drag file here to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports PDF, Documents, Archives</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Optional Cover Image */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
            Cover Image / Thumbnail (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {image && (
            <p className="text-xs text-green-600 mt-1 font-medium">Selected: {image.name}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/dashboard/free-downloads")}
            className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload & Publish to App
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFreeDownload;
