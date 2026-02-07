import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Video, Play, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getShorts, updateShort as apiUpdateShort } from "../../apis/short";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function EditShort() {
  const { colors } = useTheme();
  // const { shorts, updateShort } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const videoInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchShort = async () => {
      try {
        const res = await getShorts();
        if (res.success) {
          const short = res.data.find((s) => s._id === id);
          if (short) {
            setFormData({
              instructorName: short.instructorName,
              caption: short.caption,
              videoPreview: short.video?.url,
              videoFile: null,
            });
          } else {
            toast.error("Short not found");
            navigate("/dashboard/shorts");
          }
        }
      } catch (error) {
        toast.error("Failed to fetch short");
      } finally {
        setLoading(false);
      }
    };
    fetchShort();
  }, [id, navigate]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
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
    if (formData.videoFile) {
      data.append("video", formData.videoFile);
    }

    try {
      setActionLoading(true);
      const res = await apiUpdateShort(id, data);
      if (res.success) {
        toast.success("Short updated successfully!");
        navigate("/dashboard/shorts");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating short");
    } finally {
      setActionLoading(false);
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
      {actionLoading && <Loader size={128} fullPage={true} />}
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
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Edit Short
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : formData ? (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
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
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-6">
              Video Asset
            </h3>
            <div>
              <div
                onClick={() => videoInputRef.current.click()}
                className="relative aspect-9/16 max-w-[240px] rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5 overflow-hidden"
                style={{
                  borderColor: colors.accent + "30",
                  backgroundColor: colors.background,
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
                  <div className="text-center opacity-40 p-4">
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
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              <Save size={18} /> Update Short
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
      ) : (
        <div className="text-center p-20 opacity-40">Short not found</div>
      )}
    </div>
  );
}

export default EditShort;
