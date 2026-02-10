import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Eye, Upload, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSliders,
  createSlider,
  updateSlider as apiUpdateSlider,
  deleteSlider as apiDeleteSlider,
  toggleSliderStatus as apiToggleSliderStatus,
} from "../../apis/slider";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";

function Slider() {
  const { colors } = useTheme();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchSliders = async () => {
    try {
      const res = await getSliders();
      if (res.success) {
        setSliders(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const filteredSliders = sliders;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be under 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlider = async () => {
    if (!selectedFile) {
      toast.warning("Please select an image");
      return;
    }

    try {
      setActionLoading("adding");
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await createSlider(formData);
      if (res.success) {
        setSliders((prev) => [res.data, ...prev]);
        toast.success("Slider image added successfully!");
        setSelectedFile(null);
        setSelectedImagePreview(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding slider");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await apiToggleSliderStatus(id);
      if (res.success) {
        setSliders((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s)),
        );
        toast.info("Slider status updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Slider?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await apiDeleteSlider(id);
          if (res.success) {
            setSliders((prev) => prev.filter((s) => s._id !== id));
            toast.success("Slider deleted successfully!");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error deleting slider");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleImagePreview = (image) => {
    setPreviewImage(image);
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Slider Management
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Manage homepage slider images
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} /> Add Slider
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSliders.map((slider) => (
          <div
            key={slider._id}
            className="rounded border overflow-hidden shadow-sm transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div
              className="relative h-48 bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => handleImagePreview(slider.image?.url)}
            >
              <img
                src={slider.image?.url}
                alt={slider.title}
                className={`w-full h-full object-cover transition-transform hover:scale-105 ${!slider.isActive ? "grayscale opacity-70" : ""}`}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                <Eye
                  className="opacity-0 hover:opacity-100 text-white"
                  size={32}
                />
              </div>
              <div className="absolute top-2 right-2">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded ${slider.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}
                >
                  {slider.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                {/* <span className="text-sm font-bold opacity-60">
                  Slider Image
                </span> */}
                <Toggle
                  active={slider.isActive}
                  onClick={() =>
                    handleToggleStatus(slider._id, slider.isActive)
                  }
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={
                    () => navigate(`/dashboard/slider/edit/${slider._id}`) // Ideally verify this route exists or consider a modal for edit too
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-black/5"
                  style={{
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(slider._id)}
                  disabled={actionLoading === slider._id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  style={{ borderColor: "#EF444420", color: "#EF4444" }}
                >
                  {actionLoading === slider._id ? (
                    <Loader size={14} variant="button" />
                  ) : (
                    <>
                      <Trash2 size={14} /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSliders.length === 0 && (
        <div className="text-center py-20">
          <Upload size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold opacity-40">No sliders found</p>
          <p className="text-sm opacity-30">
            Add your first slider image to get started
          </p>
        </div>
      )}

      {/* Add Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsModalOpen(false)}
        />
        <div
          className={`relative w-full max-w-md rounded border shadow-xl transition-all duration-300 transform ${isModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: colors.accent + "20" }}
          >
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              Add Slider Image
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedFile(null);
                setSelectedImagePreview(null);
              }}
              className="p-1 rounded hover:bg-black/10 cursor-pointer transition-colors"
              style={{ color: colors.text }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative h-64 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-black/5"
              style={{
                borderColor: colors.accent + "30",
                backgroundColor: colors.sidebar,
              }}
            >
              {selectedImagePreview ? (
                <img
                  src={selectedImagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="text-center opacity-40"
                  style={{ color: colors.text }}
                >
                  <Upload size={48} className="mx-auto mb-2" />
                  <p className="text-sm font-bold">Click to upload image</p>
                  <p className="text-xs mt-1">Max size: 5MB</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddSlider}
                disabled={actionLoading === "adding"}
                className="flex-1 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                {actionLoading === "adding" ? (
                  <Loader size={18} variant="button" />
                ) : (
                  "Add Slider"
                )}
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                  setSelectedImagePreview(null);
                }}
                className="flex-1 py-3 rounded font-bold text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all cursor-pointer"
                style={{
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              <X size={24} className="text-white" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Slider;
