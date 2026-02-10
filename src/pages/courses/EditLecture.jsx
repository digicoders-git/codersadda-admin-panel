import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Save,
  X,
  Monitor,
  FileText,
  Clock,
  Layout,
  Hash,
  Play,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../components/Loader";
import { getCourseById } from "../../apis/course";
import { getLectureById, updateLecture } from "../../apis/lecture";
import { toast } from "react-toastify";

function EditLecture() {
  const { colors } = useTheme();
  // const { courses, updateCourse } = useData(); // Removed
  const { id, lectureId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    sectionId: "",
    description: "",
    duration: "",
    videoFileName: "",
    videoUrl: "",
    thumbnailUrl: "",
    pdfFileName: "",
    pdfUrl: "",
    isLocked: false,
    lectureSrNo: "",
    status: "Active",
  });

  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const [courseRes, lectureRes] = await Promise.all([
          getCourseById(id),
          getLectureById(lectureId),
        ]);

        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        if (lectureRes.success) {
          const l = lectureRes.data;
          setFormData({
            title: l.title || "",
            sectionId: l.topic?._id || l.topic || "",
            description: l.description || "",
            duration: l.duration || "",
            videoFileName: l.video?.public_id || "",
            videoUrl: l.video?.url || "",
            thumbnailUrl: l.thumbnail?.url || "",
            pdfFileName: l.resource?.public_id || "",
            pdfUrl: l.resource?.url || "",
            isLocked: l.privacy === "locked",
            lectureSrNo: l.srNo || "",
            status: l.isActive ? "Active" : "Disabled",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        navigate(`/dashboard/courses/view/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEverything();
  }, [id, lectureId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.sectionId) {
      toast.warning("Title and Section are required");
      return;
    }

    try {
      setActionLoading(true);
      const payload = new FormData();
      payload.append("course", id);
      payload.append("topic", formData.sectionId);
      payload.append("srNo", formData.lectureSrNo);
      payload.append("title", formData.title);
      payload.append("duration", formData.duration);
      payload.append("description", formData.description);
      payload.append("privacy", formData.isLocked ? "locked" : "free");
      payload.append("isActive", formData.status === "Active");

      if (videoInputRef.current?.files[0]) {
        payload.append("video", videoInputRef.current.files[0]);
      }
      if (thumbnailInputRef.current?.files[0]) {
        payload.append("thumbnail", thumbnailInputRef.current.files[0]);
      }
      if (pdfInputRef.current?.files[0]) {
        payload.append("resource", pdfInputRef.current.files[0]);
      }

      const res = await updateLecture(lectureId, payload);
      if (res.success) {
        toast.success("Lecture updated successfully!");
        navigate(`/dashboard/courses/view/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update lecture");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      const videoElement = document.createElement("video");
      videoElement.src = videoUrl;

      videoElement.onloadedmetadata = () => {
        const seconds = Math.floor(videoElement.duration);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const durationStr =
          h > 0
            ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
            : `${m}:${s.toString().padStart(2, "0")}`;

        setFormData((prev) => ({
          ...prev,
          videoFileName: file.name,
          videoUrl: videoUrl,
          duration: durationStr,
        }));
        toast.info(`Video updated: ${file.name}`);
      };
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnailUrl: URL.createObjectURL(file) });
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        pdfFileName: file.name,
        pdfUrl: URL.createObjectURL(file),
      });
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "10px",
    fontWeight: "bold",
    uppercase: "uppercase",
    tracking: "0.05em",
    marginBottom: "4px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8 max-w-4xl">
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
            Edit Lecture
          </h1>
          <p
            className="text-xs font-bold opacity-40 uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            {course?.title || "Course"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : course ? (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Lecture Details */}
          <div className="space-y-6">
            <div
              className="p-8 rounded border shadow-sm flex flex-col"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
                Lecture Details
              </h3>
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label style={labelStyle}>Sr. No.</label>
                    <div className="relative">
                      <Hash
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                        size={18}
                      />
                      <input
                        type="number"
                        value={formData.lectureSrNo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lectureSrNo: e.target.value,
                          })
                        }
                        placeholder="01"
                        className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label style={labelStyle}>Lecture Title</label>
                    <div className="relative">
                      <Layout
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                        size={18}
                      />
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter lecture title"
                        className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label style={labelStyle}>Select Module (Unit)</label>
                    <div className="relative">
                      <Hash
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                        size={18}
                      />
                      <select
                        required
                        value={formData.sectionId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sectionId: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      >
                        {course.curriculum?.map((section) => (
                          <option key={section._id} value={section._id}>
                            {section.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label style={labelStyle}>Duration (e.g. 10:45)</label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                        size={18}
                      />
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: e.target.value,
                          })
                        }
                        placeholder="00:00"
                        className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label style={labelStyle}>Lecture Description</label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter what this lecture is about..."
                    className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all resize-none"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label style={labelStyle}>Lecture Privacy</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, isLocked: false })
                        }
                        className="flex-1 cursor-pointer py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all"
                        style={{
                          backgroundColor: !formData.isLocked
                            ? colors.primary
                            : "transparent",
                          color: !formData.isLocked
                            ? colors.background
                            : colors.text,
                          borderColor: !formData.isLocked
                            ? colors.primary
                            : colors.accent + "20",
                        }}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, isLocked: true })
                        }
                        className="flex-1 cursor-pointer py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all"
                        style={{
                          backgroundColor: formData.isLocked
                            ? colors.primary
                            : "transparent",
                          color: formData.isLocked
                            ? colors.background
                            : colors.text,
                          borderColor: formData.isLocked
                            ? colors.primary
                            : colors.accent + "20",
                        }}
                      >
                        Locked
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label style={labelStyle}>Lecture Status</label>
                    <div className="flex gap-4">
                      {["Active", "Disabled"].map((stat) => (
                        <button
                          key={stat}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, status: stat })
                          }
                          className="flex-1 cursor-pointer py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all"
                          style={{
                            backgroundColor:
                              formData.status === stat
                                ? colors.primary
                                : "transparent",
                            color:
                              formData.status === stat
                                ? colors.background
                                : colors.text,
                            borderColor:
                              formData.status === stat
                                ? colors.primary
                                : colors.accent + "20",
                          }}
                        >
                          {stat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media - Video, Thumbnail, PDF */}
          <div
            className="p-6 rounded border shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-6">
              Lecture Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Video Upload */}
              <div>
                <label style={labelStyle}>Lecture Video</label>
                <div
                  onClick={() => videoInputRef.current.click()}
                  className="h-40 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5"
                  style={{
                    borderColor: colors.accent + "30",
                    backgroundColor: colors.background,
                  }}
                >
                  {formData.videoFileName ? (
                    <div className="text-center p-4">
                      <Play size={32} className="mx-auto mb-2 text-green-500" />
                      <p className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[150px]">
                        {formData.videoFileName}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            videoFileName: "",
                            videoUrl: "",
                            duration: "",
                          });
                        }}
                        className="mt-2 text-[9px] font-black text-red-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center opacity-40">
                      <Video size={32} className="mx-auto mb-2" />
                      <p className="text-[9px] font-bold uppercase tracking-widest">
                        Select Video
                      </p>
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

              {/* Thumbnail Upload */}
              <div>
                <label style={labelStyle}>Thumbnail (Optional)</label>
                <div
                  onClick={() => thumbnailInputRef.current.click()}
                  className="h-40 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5 overflow-hidden group"
                  style={{
                    borderColor: colors.accent + "30",
                    backgroundColor: colors.background,
                  }}
                >
                  {formData.thumbnailUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.thumbnailUrl}
                        className="w-full h-full object-cover"
                        alt="Thumbnail"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <p className="text-[9px] font-black text-white uppercase tracking-widest">
                          Change
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-40">
                      <Monitor size={32} className="mx-auto mb-2" />
                      <p className="text-[9px] font-bold uppercase tracking-widest">
                        Add Banner
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label style={labelStyle}>Resources (PDF)</label>
                <div
                  onClick={() => pdfInputRef.current.click()}
                  className="h-40 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5"
                  style={{
                    borderColor: colors.accent + "30",
                    backgroundColor: colors.background,
                  }}
                >
                  {formData.pdfFileName ? (
                    <div className="text-center px-4">
                      <FileText
                        size={32}
                        className="mx-auto mb-2 text-primary"
                      />
                      <p className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[150px]">
                        {formData.pdfFileName}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            pdfFileName: "",
                            pdfUrl: "",
                          });
                        }}
                        className="mt-2 text-[9px] font-black text-red-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center opacity-40">
                      <FileText size={32} className="mx-auto mb-2" />
                      <p className="text-[9px] font-bold uppercase tracking-widest">
                        Add Notes
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={handlePdfChange}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              {actionLoading ? (
                <Loader size={18} variant="button" />
              ) : (
                <>
                  <Save size={18} /> Update Lecture
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-3 cursor-pointer"
              style={{
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-20 opacity-40">Course not found</div>
      )}
    </div>
  );
}

export default EditLecture;
