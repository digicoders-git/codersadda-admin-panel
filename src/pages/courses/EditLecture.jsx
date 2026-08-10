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
  CheckCircle,
  Video as VideoIcon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../components/Loader";
import { getCourseById } from "../../apis/course";
import { getLectureById, updateLecture } from "../../apis/lecture";
import { getQuizzes } from "../../apis/quiz";
import { toast } from "react-toastify";

function EditLecture() {
  const { colors } = useTheme();
  // const { courses, updateCourse } = useData(); // Removed
  const { id, lectureId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
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
    contentType: "video",
    liveUrl: "",
    liveStatus: "scheduled",
    scheduledAt: "",
    quizId: "",
  });

  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const [courseRes, lectureRes, quizRes] = await Promise.all([
          getCourseById(id),
          getLectureById(lectureId),
          getQuizzes().catch(() => null),
        ]);

        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        if (quizRes && quizRes.data) {
          setQuizzes(quizRes.data);
        }

        if (lectureRes.success) {
          const l = lectureRes.data;
          setFormData({
            title: l.title || "",
            sectionId: l.topic?._id || l.topic || "",
            description: l.description || "",
            duration: l.duration || "",
            videoFileName: l.video?.url?.split("/").pop() || l.video?.public_id?.split("/").pop() || "",
            videoUrl: l.video?.url || "",
            thumbnailUrl: l.thumbnail?.url || "",
            pdfFileName: l.resource?.url?.split("/").pop() || l.resource?.public_id?.split("/").pop() || "",
            pdfUrl: l.resource?.url || "",
            isLocked: l.privacy === "locked",
            lectureSrNo: l.srNo || "",
            status: l.isActive ? "Active" : "Disabled",
            contentType: l.contentType || "video",
            liveUrl: l.liveUrl || "",
            liveStatus: l.liveStatus || "scheduled",
            scheduledAt: l.scheduledAt ? new Date(l.scheduledAt).toISOString().slice(0, 16) : "",
            quizId: l.quizId || "",
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
      payload.append("contentType", formData.contentType);
      payload.append("liveUrl", formData.liveUrl);
      payload.append("liveStatus", formData.liveStatus);
      payload.append("scheduledAt", formData.scheduledAt);
      payload.append("quizId", formData.quizId);

      if (videoInputRef.current?.files[0]) {
        payload.append("video", videoInputRef.current.files[0]);
      } else if (!formData.videoFileName) {
        payload.append("removeVideo", "true");
      }
      
      if (thumbnailInputRef.current?.files[0]) {
        payload.append("thumbnail", thumbnailInputRef.current.files[0]);
      } else if (!formData.thumbnailUrl) {
        payload.append("removeThumbnail", "true");
      }
      
      if (pdfInputRef.current?.files[0]) {
        payload.append("resource", pdfInputRef.current.files[0]);
      } else if (!formData.pdfFileName) {
        payload.append("removeResource", "true");
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
      videoElement.preload = "metadata";
      videoElement.src = videoUrl;

      videoElement.onloadedmetadata = () => {
        const seconds = Math.floor(videoElement.duration);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const durationStr =
          h > 0
            ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
            : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

        setFormData((prev) => ({
          ...prev,
          videoFileName: file.name,
          videoUrl: videoUrl,
          duration: durationStr,
        }));
        toast.info(`Video updated: ${file.name}`);
      };

      videoElement.onerror = () => {
        toast.error("Failed to load video metadata. Is it a valid video format?");
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

                  <div className="space-y-3">
                    <label style={labelStyle}>Choose Content Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {[
                        { id: "video", label: "Video", icon: VideoIcon, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
                        { id: "pdf", label: "PDF / Notes", icon: FileText, color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
                        { id: "live", label: "Live Stream", icon: Play, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" },
                        { id: "youtube_zoom", label: "YouTube/Zoom", icon: Monitor, color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
                        { id: "webinar", label: "Webinar", icon: Layout, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
                        { id: "test", label: "Quiz (MCQ)", icon: CheckCircle, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
                      ].map((item) => {
                        const isSelected = formData.contentType === item.id;
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, contentType: item.id })}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 cursor-pointer text-center gap-2 group`}
                            style={{
                              borderColor: isSelected ? item.color : colors.accent + "20",
                              backgroundColor: isSelected ? item.bg : colors.background,
                            }}
                          >
                            <div
                              className={`p-3 rounded-full transition-transform duration-300 group-hover:scale-110`}
                              style={{
                                backgroundColor: isSelected ? "white" : colors.accent + "10",
                                color: item.color,
                              }}
                            >
                              <IconComponent size={20} />
                            </div>
                            <span
                              className="text-[11px] font-bold tracking-wide transition-all"
                              style={{
                                color: isSelected ? colors.text : colors.textSecondary,
                              }}
                            >
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formData.contentType === "video" && (
                    <div className="space-y-1">
                      <label style={labelStyle}>Duration (e.g. 10:45)</label>
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                          size={18}
                        />
                        <input
                          readOnly
                          type="text"
                          value={formData.duration}
                          placeholder="Auto-calculating..."
                          className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all opacity-70"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "30",
                            color: colors.text,
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {formData.contentType === "live" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label style={labelStyle}>Live Playback URL (HLS / m3u8)</label>
                        <input
                          type="text"
                          required
                          value={formData.liveUrl}
                          onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                          placeholder="e.g. http://live.example.com/hls/stream.m3u8"
                          className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "30",
                            color: colors.text,
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label style={labelStyle}>Scheduled Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.scheduledAt}
                          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                          className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "30",
                            color: colors.text,
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label style={labelStyle}>Live Status</label>
                        <select
                          required
                          value={formData.liveStatus}
                          onChange={(e) => setFormData({ ...formData, liveStatus: e.target.value })}
                          className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "30",
                            color: colors.text,
                          }}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="live">Live Now 🔴</option>
                          <option value="ended">Ended</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(formData.contentType === "youtube_zoom" || formData.contentType === "webinar") && (
                    <div className="space-y-1">
                      <label style={labelStyle}>Meeting / Stream Link</label>
                      <input
                        type="url"
                        required
                        value={formData.liveUrl}
                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                        placeholder="e.g. https://zoom.us/j/meeting_id or https://webinar.gg/join/id"
                        className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      />
                    </div>
                  )}

                  {(formData.contentType === "test" || formData.contentType === "subjective_test") && (
                    <div className="space-y-1">
                      <label style={labelStyle}>Select Quiz / Test</label>
                      <select
                        required
                        value={formData.quizId}
                        onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                        className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      >
                        <option value="">-- Choose Quiz --</option>
                        {quizzes.map((quiz) => (
                          <option key={quiz._id} value={quiz._id}>
                            {quiz.title} ({quiz.duration} min)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
