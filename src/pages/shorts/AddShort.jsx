import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Video, Play, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { createShort } from "../../apis/short";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function AddShort() {
  const { colors } = useTheme();
  // const { addShort } = useData(); // Removed
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const videoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    instructorName: "",
    caption: "",
    videoFile: null,
    videoPreview: "",
  });

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast.error("Video size too large (Max 50MB)");
        return;
      }
      const url = URL.createObjectURL(file);
      setFormData({
        ...formData,
        videoFile: file,
        videoPreview: url,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("instructorName", formData.instructorName);
    data.append("caption", formData.caption);
    data.append("video", formData.videoFile);

    try {
      setLoading(true);
      const res = await createShort(data);
      if (res.success) {
        toast.success("Short added successfully!");
        navigate("/dashboard/shorts");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding short");
    } finally {
      setLoading(false);
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
      {/* {loading && <Loader size={128} />} */}
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
            Add New Short
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Upload short video content
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-full space-y-6">
        <div
          className="p-8 rounded border shadow-sm space-y-6"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label style={labelStyle}>Instructor Name</label>
              <input
                type="text"
                value={formData.instructorName}
                onChange={(e) =>
                  setFormData({ ...formData, instructorName: e.target.value })
                }
                placeholder="e.g. Abhay Vishwakarma"
                className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label style={labelStyle}>Description / Caption</label>
            <textarea
              rows={3}
              value={formData.caption}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })
              }
              placeholder="Write a catchy caption..."
              className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all resize-none"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            />
          </div>
        </div>

        {/* Video Upload Section */}
        <div
          className="p-6 rounded border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-wider opacity-60 mb-6"
            style={{ color: colors.text }}
          >
            Video Asset
          </h3>
          <div>
            <div
              onClick={() => videoInputRef.current.click()}
              className="relative aspect-9/16 max-w-[240px] rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5 overflow-hidden"
              style={{
                borderColor: colors.accent + "30",
                backgroundColor: colors.sidebar,
              }}
            >
              {formData.videoPreview ? (
                <>
                  <video
                    src={formData.videoPreview}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play size={48} className="text-white opacity-80" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({
                        ...formData,
                        videoPreview: "",
                        videoFile: null,
                      });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded text-white"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div
                  className="text-center opacity-40 p-4"
                  style={{ color: colors.text }}
                >
                  <Video size={48} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Select Vertical Video
                  </p>
                  <p className="text-[10px] mt-1">9:16 Aspect Ratio</p>
                </div>
              )}
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            {loading ? (
              <Loader size={18} variant="button" />
            ) : (
              <>
                <Save size={18} /> Publish Short
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/shorts")}
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

export default AddShort;
