import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { createBlog } from "../../apis/blog";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";
import RichTextEditor from "../../components/RichTextEditor";

function AddWebsiteBlog() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    displayPlatform: "both",
    status: "Active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("https://placehold.co/400x250?text=Blog+Image");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be under 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.warning("Please fill in all required fields");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("displayPlatform", formData.displayPlatform || "both");
    data.append("status", formData.status);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const res = await createBlog(data);
      if (res.success) {
        toast.success("Blog added successfully!");
        navigate("/dashboard/website/blogs");
      }
    } catch (err) {
      toast.error("Failed to add blog");
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8">
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
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Add Blog Post
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div
          className="p-6 rounded-lg border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h2
            className="text-lg font-bold mb-6"
            style={{ color: colors.primary }}
          >
            Blog Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Blog Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter blog title"
                  className="w-full px-4 py-2 rounded-md border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Display Platform</label>
                <ModernSelect
                  options={[
                    { value: "both", label: "Both (App & Website)" },
                    { value: "app", label: "App Only" },
                    { value: "website", label: "Website Only" },
                    { value: "none", label: "None (Hide Everywhere)" },
                  ]}
                  value={formData.displayPlatform || "both"}
                  onChange={(value) =>
                    setFormData({ ...formData, displayPlatform: value })
                  }
                  placeholder="Select Display Platform"
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Status (Approval Status)</label>
                <ModernSelect
                  options={[
                    { value: "Active", label: "Active (Approved)" },
                    { value: "Disabled", label: "Disabled (Pending Approval)" },
                  ]}
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  placeholder="Select Status"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Blog Image</label>
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={preview}
                    alt="Blog"
                    className="w-full h-32 object-cover rounded-lg border"
                    style={{ borderColor: colors.accent + "30" }}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current.click()}
                    className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    Upload Image
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <p
                    className="text-xs text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Recommended: 400x250px, Max size: 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-1">
              <label style={labelStyle}>Blog Description *</label>
              <RichTextEditor
                value={formData.description}
                onChange={(content) =>
                  setFormData({ ...formData, description: content })
                }
                placeholder="Enter blog description..."
                colors={colors}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Save size={18} />
            Add Blog
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/website/blogs")}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all cursor-pointer"
            style={{ color: colors.text, borderColor: colors.accent + "30" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddWebsiteBlog;
