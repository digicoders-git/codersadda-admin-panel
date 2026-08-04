import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Video as VideoIcon,
  Image as ImageIcon,
  Monitor,
  FileText,
  Clock,
  Layout,
  Hash,
  Lock,
  Play,
  Check,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getCourseById } from "../../apis/course";
import { createLecture } from "../../apis/lecture";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { getQuizzes } from "../../apis/quiz";

function AddLecture() {
  const { colors } = useTheme();
  // const { courses, updateCourse } = useData(); // Removed
  const navigate = useNavigate();
  const { id, sectionId } = useParams();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sectionIdFromUrl = queryParams.get("sectionId");
  const initialType = queryParams.get("type") || "video";

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    sectionId: sectionId || sectionIdFromUrl || "",
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
    contentType: initialType,
    liveUrl: "",
    liveStatus: "scheduled",
    scheduledAt: "",
    quizId: "",
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await getQuizzes();
        if (res && res.data) {
          setQuizzes(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      }
    };
    fetchQuizzes();
  }, []);

  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await getCourseById(id);
        if (res.success) {
          const found = res.data;
          setCourse(found);
          if (!formData.sectionId && found.curriculum?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              sectionId: found.curriculum[0]._id,
            }));
          }
        } else {
          toast.error("Course not found");
          navigate("/dashboard/courses");
        }
      } catch (error) {
        toast.error("Failed to fetch course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, navigate, formData.sectionId]);

  useEffect(() => {
    if (course && formData.sectionId) {
      const section = course.curriculum?.find((s) => s._id === formData.sectionId);
      const nextSrNo = section ? (section.lessons?.length || 0) + 1 : 1;
      setFormData((prev) => ({
        ...prev,
        lectureSrNo: nextSrNo,
      }));
    }
  }, [course, formData.sectionId]);

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
        toast.info(`Video selected: ${file.name} (${durationStr})`);
      };

      videoElement.onerror = () => {
        toast.error("Failed to load video metadata. Is it a valid video format?");
      };
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      setFormData({
        ...formData,
        thumbnailUrl: URL.createObjectURL(file),
      });
      toast.info("Thumbnail selected");
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
      toast.info("PDF selected: " + file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.sectionId) {
      toast.warning("Please fill required fields");
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
      payload.append("contentType", formData.contentType || "video");
      if (formData.liveUrl) payload.append("liveUrl", formData.liveUrl);
      if (formData.liveStatus) payload.append("liveStatus", formData.liveStatus);
      if (formData.scheduledAt) payload.append("scheduledAt", formData.scheduledAt);
      if (formData.quizId) payload.append("quizId", formData.quizId);

      if (videoInputRef.current?.files[0]) {
        payload.append("video", videoInputRef.current.files[0]);
      }
      if (thumbnailInputRef.current?.files[0]) {
        payload.append("thumbnail", thumbnailInputRef.current.files[0]);
      }
      if (pdfInputRef.current?.files[0]) {
        payload.append("resource", pdfInputRef.current.files[0]);
      }

      const res = await createLecture(payload);
      if (res.success) {
        toast.success("Lecture created successfully!");
        navigate(`/dashboard/courses/view/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create lecture");
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

  const courseTitle = course?.title || "Course";

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
            Add New Lecture
          </h1>
          <p
            className="text-xs font-bold opacity-40 uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            Upload content to {courseTitle}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : course ? (
        <form onSubmit={handleSubmit} className="max-w-full space-y-6">
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
                        readOnly
                        value={formData.lectureSrNo}
                        placeholder="01"
                        className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                          cursor: "not-allowed",
                          opacity: 0.7,
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

                <div className="space-y-6">
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
                        { id: "test", label: "Quiz (MCQ)", icon: Check, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
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
                </div>

                {/* Conditional Fields based on Content Type */}
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
                        placeholder="Auto-calculating on video select..."
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

                {(formData.contentType === "live" || formData.contentType === "youtube_zoom" || formData.contentType === "webinar") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label style={labelStyle}>
                        {formData.contentType === "live" ? "Streaming Playback URL (HLS / m3u8)" : "Meeting / Stream URL"}
                      </label>
                      <div className="relative">
                        <Play
                          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                          size={18}
                        />
                        <input
                          type="text"
                          required
                          value={formData.liveUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, liveUrl: e.target.value })
                          }
                          placeholder={formData.contentType === "live" ? "e.g. https://domain.com/live/stream.m3u8" : "e.g. https://zoom.us/j/meetingid or YouTube URL"}
                          className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "30",
                            color: colors.text,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label style={labelStyle}>Scheduled Date & Time</label>
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                          size={18}
                        />
                        <input
                          type="datetime-local"
                          required
                          value={formData.scheduledAt}
                          onChange={(e) =>
                            setFormData({ ...formData, scheduledAt: e.target.value })
                          }
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
                )}

                {formData.contentType === "live" && (
                  <div className="space-y-1">
                    <label style={labelStyle}>Live Status</label>
                    <div className="flex gap-4">
                      {["scheduled", "live", "ended"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, liveStatus: status })
                          }
                          className="flex-1 cursor-pointer py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all"
                          style={{
                            backgroundColor:
                              formData.liveStatus === status
                                ? colors.primary
                                : "transparent",
                            color:
                              formData.liveStatus === status
                                ? colors.background
                                : colors.text,
                            borderColor:
                              formData.liveStatus === status
                                ? colors.primary
                                : colors.accent + "20",
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.contentType === "test" && (
                  <div className="space-y-1">
                    <label style={labelStyle}>Select Quiz (Test)</label>
                    <div className="relative">
                      <Layout
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                        size={18}
                      />
                      <select
                        required
                        value={formData.quizId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quizId: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      >
                        <option value="">-- Choose Quiz --</option>
                        {quizzes.map((quiz) => (
                          <option key={quiz._id} value={quiz._id}>
                            {quiz.title} ({quiz.totalQuestions} Questions)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

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
          {(formData.contentType === "video" || formData.contentType === "pdf" || formData.contentType === "live" || formData.contentType === "youtube_zoom" || formData.contentType === "webinar") && (
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
                {formData.contentType === "video" && (
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
                          <VideoIcon size={32} className="mx-auto mb-2" />
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
                )}

                {/* Thumbnail Upload */}
                {(formData.contentType === "video" || formData.contentType === "live" || formData.contentType === "youtube_zoom" || formData.contentType === "webinar") && (
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
                )}

                {/* PDF Upload */}
                {formData.contentType === "pdf" && (
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
                )}
              </div>
            </div>
          )}

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
                <Save size={18} />
              )}{" "}
              Publish Lecture
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
              <X size={18} /> Discard
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-20 opacity-40">Course not found</div>
      )}
    </div>
  );
}

export default AddLecture;
