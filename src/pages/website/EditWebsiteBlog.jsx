import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getBlogById, updateBlog as apiUpdateBlog } from "../../apis/blog";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";

function EditWebsiteBlog() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Active",
    image: "", // URL for display
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await getBlogById(id);
        if (res.success && res.data) {
          setFormData(res.data);
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
        setFormData((prev) => ({ ...prev, image: reader.result }));
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
    data.append("status", formData.status);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const res = await apiUpdateBlog(id, data);
      if (res.success) {
        toast.success("Blog updated successfully!");
        navigate("/dashboard/website/blogs");
      }
    } catch (err) {
      toast.error("Failed to update blog");
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

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
          Edit Blog Post
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
                <label style={labelStyle}>Status</label>
                <ModernSelect
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Disabled", label: "Disabled" },
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
                    src={formData.image}
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
                    Change Image
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-1">
              <label style={labelStyle}>Blog Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter blog description..."
                rows={6}
                className="w-full px-4 py-2 rounded-md border outline-none text-sm resize-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
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
            Update Blog
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

export default EditWebsiteBlog;
