import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getServiceById, updateService } from "../../apis/service";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";

function EditWebsiteService() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const iconInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    displayPlatform: "both",
    status: "Active",
  });
  const [iconFile, setIconFile] = useState(null);
  const [preview, setPreview] = useState("https://placehold.co/150x150?text=Service+Icon");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const res = await getServiceById(id);
        if (res.success && res.service) {
          const s = res.service;
          setFormData({
            title: s.title || "",
            description: s.description || "",
            displayPlatform: s.displayPlatform || "both",
            status: s.isActive ? "Active" : "Disabled",
          });
          setPreview(s.icon?.url || s.icon?.localUrl || "https://placehold.co/150x150?text=Service+Icon");
        }
      } catch (err) {
        toast.error("Failed to load service data");
        navigate("/dashboard/website/services");
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, [id, navigate]);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Icon image size should be under 2MB");
        return;
      }
      setIconFile(file);
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
    if (iconFile) {
      data.append("icon", iconFile);
    }

    try {
      const res = await updateService(id, data);
      if (res.success) {
        toast.success("Service updated successfully!");
        navigate("/dashboard/website/services");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update service");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading service details...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard/website/services")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          style={{ color: colors.text }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Edit Service
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Update service details and platform visibility
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-xl border p-6 shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Service Icon / Banner
            </label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border overflow-hidden flex items-center justify-center bg-slate-50 p-2">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div>
                <input
                  type="file"
                  ref={iconInputRef}
                  onChange={handleIconChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border font-bold text-sm flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                  style={{ color: colors.primary, borderColor: colors.primary + "40" }}
                >
                  <Upload size={16} />
                  <span>Change Icon</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Service Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Web Development & MERN Stack Training"
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ backgroundColor: colors.background, borderColor: colors.accent + "30", color: colors.text }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Service Description *
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Write detailed description of this service offering..."
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ backgroundColor: colors.background, borderColor: colors.accent + "30", color: colors.text }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
                Display Platform
              </label>
              <ModernSelect
                value={formData.displayPlatform}
                onChange={(val) => setFormData({ ...formData, displayPlatform: val })}
                options={[
                  { label: "Both (App & Website)", value: "both" },
                  { label: "Website Only", value: "website" },
                  { label: "App Only", value: "app" },
                  { label: "None (Hidden)", value: "none" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
                Status
              </label>
              <ModernSelect
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Disabled", value: "Disabled" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/website/services")}
            className="px-6 py-2.5 rounded-lg border font-bold text-sm cursor-pointer"
            style={{ color: colors.textSecondary, borderColor: colors.accent + "40" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-white font-bold text-sm flex items-center gap-2 shadow hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: colors.primary }}
          >
            <Save size={16} />
            <span>Update Service</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditWebsiteService;
