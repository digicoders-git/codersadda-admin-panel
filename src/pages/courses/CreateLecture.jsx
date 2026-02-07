import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Video,
  Image as ImageIcon,
  Monitor,
  FileText,
  Clock,
  Layout,
  Hash,
  Play,
  Layers,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getAllCourses, getCourseById } from "../../apis/course";
import { createLecture } from "../../apis/lecture";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function CreateLecture() {
  const { colors, isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);

  const [formData, setFormData] = useState({
    courseId: "",
    topicId: "",
    srNo: "",
    title: "",
    duration: "",
    description: "",
    privacy: "locked",
    isActive: true,
    videoFileName: "",
    videoUrl: "",
    thumbnailUrl: "",
    pdfFileName: "",
    pdfUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getAllCourses();
        if (res.success) {
          setCourses(res.data);
        }
      } catch (error) {
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = async (courseId) => {
    setFormData({ ...formData, courseId, topicId: "" });
    if (!courseId) {
      setTopics([]);
      setSelectedCourse(null);
      return;
    }

    try {
      const res = await getCourseById(courseId);
      if (res.success) {
        setSelectedCourse(res.data);
        setTopics(res.data.curriculum || []);
        // Auto select first topic if available
        if (res.data.curriculum?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            courseId,
            topicId: res.data.curriculum[0]._id,
          }));
        }
      }
    } catch (error) {
      toast.error("Failed to fetch course modules");
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
        toast.info(`Video selected: ${file.name}`);
      };
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        thumbnailUrl: URL.createObjectURL(file),
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.courseId ||
      !formData.topicId ||
      !formData.title ||
      !formData.srNo
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      setActionLoading(true);
      const payload = new FormData();
      payload.append("course", formData.courseId);
      payload.append("topic", formData.topicId);
      payload.append("srNo", formData.srNo);
      payload.append("title", formData.title);
      payload.append("duration", formData.duration);
      payload.append("description", formData.description);
      payload.append("privacy", formData.privacy);
      payload.append("isActive", formData.isActive);

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
        navigate("/dashboard/lectures");
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
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div
      className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded border transition-all cursor-pointer"
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
            Create New Lecture
          </h1>
          <p
            className="text-xs font-semibold opacity-50"
            style={{ color: colors.textSecondary }}
          >
            Add video content to any course and module.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div
              className="p-6 rounded border shadow-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
                Course & Module Selection
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <label style={labelStyle}>Select Course</label>
                  <div className="relative">
                    <BookOpen
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                      size={18}
                    />
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer appearance-none"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "20",
                        color: colors.text,
                      }}
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label style={labelStyle}>Select Module / Topic</label>
                  <div className="relative">
                    <Layers
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                      size={18}
                    />
                    <select
                      required
                      value={formData.topicId}
                      onChange={(e) =>
                        setFormData({ ...formData, topicId: e.target.value })
                      }
                      disabled={!formData.courseId || topics.length === 0}
                      className="w-full pl-10 pr-4 py-3 rounded border outline-none text-sm font-semibold cursor-pointer appearance-none disabled:opacity-30"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "20",
                        color: colors.text,
                      }}
                    >
                      <option value="">
                        {topics.length > 0
                          ? "Select Module"
                          : "No Modules Found"}
                      </option>
                      {topics.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
                      required
                      value={formData.srNo}
                      onChange={(e) =>
                        setFormData({ ...formData, srNo: e.target.value })
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

              <div className="mt-6 space-y-1">
                <label style={labelStyle}>Lecture Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
            </div>

            <div
              className="p-6 rounded border shadow-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
                Lecture Assets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Video */}
                <div className="space-y-2">
                  <label style={labelStyle}>Lecture Video</label>
                  <div
                    onClick={() => videoInputRef.current.click()}
                    className="h-44 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5"
                    style={{
                      borderColor: colors.primary + (isDarkMode ? "30" : "15"),
                      backgroundColor: colors.background,
                    }}
                  >
                    {formData.videoFileName ? (
                      <div className="text-center p-4">
                        <Play
                          size={32}
                          style={{ color: colors.primary }}
                          className="mx-auto mb-2"
                        />
                        <p className="text-[10px] font-bold truncate max-w-[180px]">
                          {formData.videoFileName}
                        </p>
                        <span className="text-[9px] opacity-40 uppercase tracking-widest">
                          {formData.duration}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center opacity-30">
                        <Video size={40} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Upload Video
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

                {/* Thumbnail and PDF side by side */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={labelStyle}>PDF Resources</label>
                    <div
                      onClick={() => pdfInputRef.current.click()}
                      className="py-3 px-4 rounded border-2 border-dashed flex items-center gap-3 cursor-pointer hover:bg-black/5"
                      style={{
                        borderColor: colors.accent + "20",
                        backgroundColor: colors.background,
                      }}
                    >
                      <FileText size={20} className="opacity-40" />
                      <span className="text-xs font-bold truncate max-w-[150px]">
                        {formData.pdfFileName || "Select PDF"}
                      </span>
                      <input
                        type="file"
                        ref={pdfInputRef}
                        onChange={handlePdfChange}
                        accept=".pdf"
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Custom Thumbnail</label>
                    <div
                      onClick={() => thumbnailInputRef.current.click()}
                      className="h-24 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-black/5 overflow-hidden"
                      style={{
                        borderColor: colors.accent + "20",
                        backgroundColor: colors.background,
                      }}
                    >
                      {formData.thumbnailUrl ? (
                        <img
                          src={formData.thumbnailUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="opacity-30" />
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
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className="p-6 rounded border shadow-sm sticky top-4"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
                Settings
              </h3>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label style={labelStyle}>Privacy</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["free", "locked"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, privacy: p })}
                        className="py-3 rounded text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer"
                        style={{
                          backgroundColor:
                            formData.privacy === p
                              ? colors.primary
                              : "transparent",
                          color:
                            formData.privacy === p
                              ? colors.background
                              : colors.text,
                          borderColor:
                            formData.privacy === p
                              ? colors.primary
                              : colors.accent + "20",
                        }}
                      >
                        {p === "free" ? "Unlock" : "Lock"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label style={labelStyle}>Visibility</label>
                  <div
                    className="flex items-center justify-between p-3 rounded border"
                    style={{ borderColor: colors.accent + "20" }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: colors.text }}
                    >
                      Publish Content
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isActive: !formData.isActive,
                        })
                      }
                      className="w-10 h-5 rounded-full relative transition-all"
                      style={{
                        backgroundColor: formData.isActive
                          ? colors.primary
                          : colors.accent + "30",
                      }}
                    >
                      <div
                        className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all"
                        style={{
                          transform: formData.isActive
                            ? "translateX(20px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.background,
                    }}
                  >
                    {actionLoading ? <Loader size={18} /> : <Save size={18} />}{" "}
                    Save Lecture
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all cursor-pointer"
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
        </form>
      )}
    </div>
  );
}

export default CreateLecture;
