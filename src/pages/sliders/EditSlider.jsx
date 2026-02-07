import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getSliders, updateSlider as apiUpdateSlider } from "../../apis/slider";
import { toast } from "react-toastify";

function EditSlider() {
  const { colors } = useTheme();
  // const { sliders, updateSlider } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await getSliders(); // Ideally we should have getSliderById, but getSliders works for now
        if (res.success) {
          const slider = res.data.find((s) => s._id === id);
          if (slider) {
            setFormData(slider);
            setImagePreview(slider.image?.url);
          } else {
            toast.error("Slider not found");
            navigate("/dashboard/slider");
          }
        }
      } catch (error) {
        toast.error("Failed to fetch slider");
      } finally {
        setLoading(false);
      }
    };
    fetchSlider();
  }, [id, navigate]);

  if (!formData) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be under 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview) {
      toast.warning("Please select an image");
      return;
    }
    const data = new FormData();
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    try {
      const res = await apiUpdateSlider(id, data);
      if (res.success) {
        toast.success("Slider updated successfully!");
        navigate("/dashboard/slider");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating slider");
    }
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded transition-all cursor-pointer border"
          style={{
            color: colors.text,
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Edit Slider
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Update slider image
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div
          className="p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 pt-4">
            Slider Image
          </h3>

          <div
            onClick={() => fileInputRef.current.click()}
            className="relative h-96 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-black/5"
            style={{
              borderColor: colors.accent + "30",
              backgroundColor: colors.background,
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center opacity-40">
                <Upload size={48} className="mx-auto mb-2" />
                <p className="text-sm font-bold">Click to upload image</p>
                <p className="text-xs mt-1">Max size: 5MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Save size={18} /> Update Slider
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/slider")}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-3 cursor-pointer"
            style={{ borderColor: colors.accent + "30", color: colors.text }}
          >
            <X size={18} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSlider;
