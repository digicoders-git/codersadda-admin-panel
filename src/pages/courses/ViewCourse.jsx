import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Lock,
  ChevronDown,
  CheckCircle,
  Monitor,
  Star,
  Users,
  Clock,
  Plus,
  Eye,
  FileText,
  Video as VideoIcon,
  HelpCircle,
  Mail,
  Briefcase,
  Layers,
  Award,
  Maximize2,
  Info,
  Layout,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getCourseById,
  updateCourse as apiUpdateCourse,
  toggleCourseReviewStatus,
} from "../../apis/course";
import { createTopic, updateTopic, deleteTopic } from "../../apis/curriculum";
import { deleteLecture, updateLecture } from "../../apis/lecture";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";
import CertificatePreviewCanvas from "../../components/CertificatePreviewCanvas";

function ViewCourse() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [showCertModal, setShowCertModal] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  const SectionHeader = ({ icon: Icon, title }) => (
    <h2
      className="text-lg font-bold mb-6 flex items-center gap-2"
      style={{ color: colors.text }}
    >
      <Icon size={18} className="text-primary" /> {title}
    </h2>
  );

  const Card = ({ children, className = "" }) => (
    <div
      className={`p-6 rounded-lg border shadow-sm ${className}`}
      style={{
        backgroundColor: colors.sidebar || colors.background,
        borderColor: colors.accent + "20",
      }}
    >
      {children}
    </div>
  );

  const fetchCourse = async () => {
    try {
      const res = await getCourseById(id);
      if (res.success) {
        const found = res.data;
        setCourse(found);
        if (found.curriculum?.length > 0) {
          const initialOpen = {};
          found.curriculum.forEach((s) => (initialOpen[s._id] = true));
          setOpenSections(initialOpen);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();

    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lobster&family=Pacifico&family=Great+Vibes&family=Satisfy&family=Kaushan+Script&family=Dancing+Script&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [id]);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleAddTopic = () => {
    Swal.fire({
      title: "Add New Topic",
      input: "text",
      inputPlaceholder: "Topic Name (e.g. Getting Started)",
      showCancelButton: true,
      confirmButtonText: "Create",
      confirmButtonColor: colors.primary,
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[0-9]/g, "");
          });
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          setActionLoading("topic-add");
          const res = await createTopic({
            course: id,
            topic: result.value,
          });
          if (res.success) {
            toast.success("Topic added successfully");
            fetchCourse();
          }
        } catch (error) {
          toast.error("Failed to add topic");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleEditTopic = (sectionId, currentTitle) => {
    Swal.fire({
      title: "Edit Topic Name",
      input: "text",
      inputValue: currentTitle,
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: colors.primary,
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[0-9]/g, "");
          });
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          setActionLoading(sectionId);
          const res = await updateTopic(sectionId, {
            topic: result.value,
          });
          if (res.success) {
            toast.success("Topic updated");
            fetchCourse();
          }
        } catch (error) {
          toast.error("Failed to update topic");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleDeleteTopic = (sectionId) => {
    Swal.fire({
      title: "Delete Topic?",
      text: "All lectures under this topic will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(sectionId);
          const res = await deleteTopic(sectionId);
          if (res.success) {
            toast.success("Topic removed");
            fetchCourse();
          }
        } catch (error) {
          toast.error("Failed to remove topic");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleDeleteLecture = (sectionId, lessonId) => {
    Swal.fire({
      title: "Remove Lecture?",
      text: "This lesson will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(lessonId);
          const res = await deleteLecture(lessonId);
          if (res.success) {
            toast.success("Lecture removed");
            fetchCourse();
          }
        } catch (error) {
          toast.error("Failed to remove lecture");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const toggleLectureStatus = async (sectionId, lessonId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
    try {
      setActionLoading(lessonId);
      const res = await updateLecture(lessonId, {
        isActive: newStatus === "Active",
      });
      if (res.success) {
        toast.info(`Lecture ${newStatus}`);
        await fetchCourse();
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleLiveStatus = async (lessonId, currentLiveStatus) => {
    const newLiveStatus = currentLiveStatus === "live" ? "ended" : "live";
    try {
      setActionLoading(lessonId);
      const res = await updateLecture(lessonId, {
        liveStatus: newLiveStatus,
      });
      if (res.success) {
        toast.info(`Live Stream ${newLiveStatus === "live" ? "Started 🔴" : "Ended ⏹️"}`);
        await fetchCourse();
      }
    } catch (error) {
      toast.error("Failed to update live status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleReviewStatus = async (reviewId) => {
    try {
      setActionLoading(reviewId);
      const res = await toggleCourseReviewStatus(course._id, reviewId);
      if (res.success) {
        toast.success(res.message);
        setCourse(prev => {
          if (!prev) return prev;
          const updatedReviews = prev.reviews.map(r => 
            r._id === reviewId ? { ...r, isApproved: res.isApproved } : r
          );
          return { ...prev, reviews: updatedReviews };
        });
      }
    } catch (error) {
      toast.error("Failed to update review status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full mx-auto pb-20 pt-2 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/dashboard/courses")}
          className="p-2 rounded-lg transition-all cursor-pointer border"
          style={{
            color: colors.text,
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            View Course
          </h1>
        </div>
        {course && (
          <button
            onClick={() => navigate(`/dashboard/courses/edit/${course._id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-white shadow-md cursor-pointer"
            style={{ backgroundColor: colors.primary }}
          >
            <Edit size={16} /> Edit Course
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : course ? (
        <div className="w-full space-y-6">
          {/* General Information */}
          <Card>
            <SectionHeader icon={Info} title="General Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label style={labelStyle}>Course Title</label>
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  {course.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label style={labelStyle}>Instructor</label>
                  <p
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {typeof course.instructor === "object"
                      ? course.instructor?.fullName
                      : course.instructor || "--"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Instructor Share</label>
                  <p
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {course.priceForInstructor || 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Category</label>
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  {course.category?.name ||
                    (typeof course.category === "string"
                      ? course.category
                      : "--")}
                </p>
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Technology</label>
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  {course.technology || "--"}
                </p>
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Price Details</label>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest"
                    style={{
                      backgroundColor: colors.primary + "15",
                      color: colors.primary,
                    }}
                  >
                    {course.priceType || "Free"}
                  </span>
                  {course.priceType?.toLowerCase() === "paid" && (
                    <p
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      ₹{course.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label style={labelStyle}>Course Badge</label>
                  <p
                    className="text-sm font-bold uppercase"
                    style={{ color: colors.text }}
                  >
                    {course.badge || "Normal"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Status</label>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      course.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {course.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Certificate Template</label>
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  {course.certificateTemplate?.certificateName ||
                    "No template assigned"}
                </p>
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Stats</label>
                <div className="flex gap-4 text-[11px] font-bold opacity-60">
                  <p>{course.totalStudents || 0} Students</p>
                  <p>{course.duration || "Not Set"} Duration</p>
                  <p>{course.rating || 0} Rating</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Course Details */}
          <Card>
            <SectionHeader icon={Layout} title="Course Details" />
            <div className="space-y-6">
              <div className="space-y-1">
                <label style={labelStyle}>Course Description</label>
                <p
                  className="text-sm leading-relaxed opacity-80"
                  style={{ color: colors.text }}
                >
                  {course.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-2">
                <label style={labelStyle}>What you will learn</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {course.whatYouWillLearn?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded bg-black/5"
                    >
                      <CheckCircle size={14} className="text-green-500" />
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                  {(!course.whatYouWillLearn ||
                    course.whatYouWillLearn.length === 0) && (
                    <p className="text-xs opacity-40">No points added.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Course Assets */}
          <Card>
            <SectionHeader icon={Play} title="Course Assets" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Thumbnail Image</label>
                <div
                  className="relative h-44 rounded-lg border border-dashed flex items-center justify-center overflow-hidden"
                  style={{
                    borderColor: colors.accent + "30",
                    backgroundColor: colors.background,
                  }}
                >
                  {course.thumbnail ? (
                    <img
                      src={
                        typeof course.thumbnail === "string"
                          ? course.thumbnail
                          : course.thumbnail.url
                      }
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center opacity-40">
                      <Layout size={32} className="mx-auto mb-2" />
                      <p className="text-xs font-bold">No Image</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Promo Video</label>
                <div
                  className="h-44 rounded-lg border border-dashed flex items-center justify-center relative overflow-hidden bg-black"
                  style={{ borderColor: colors.accent + "30" }}
                >
                  {course.promoVideo ? (
                    <video
                      src={
                        typeof course.promoVideo === "string"
                          ? course.promoVideo
                          : course.promoVideo.url
                      }
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center opacity-40">
                      <VideoIcon size={32} className="mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">No Video</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Curriculum Section */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: colors.text }}
              >
                <Monitor size={18} className="text-primary" /> Course Content
              </h2>
              <button
                onClick={handleAddTopic}
                disabled={actionLoading === "topic-add"}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 text-white disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                {actionLoading === "topic-add" ? (
                  <Loader size={12} />
                ) : (
                  <Plus size={14} />
                )}
                Add New Topic
              </button>
            </div>

            <div className="space-y-4">
              {course.curriculum?.map((section, sIdx) => (
                <div
                  key={section._id}
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "15",
                  }}
                >
                  <div
                    className="p-4 flex items-center justify-between border-b"
                    style={{
                      backgroundColor: colors.sidebar + "20",
                      borderColor: colors.accent + "10",
                    }}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => toggleSection(section._id)}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          openSections[section._id] ? "rotate-180" : ""
                        }`}
                        style={{ color: colors.text }}
                      />
                      <div>
                        <p
                          className="text-sm font-bold uppercase tracking-wider"
                          style={{ color: colors.text }}
                        >
                          Topic {sIdx + 1}: {section.title}
                        </p>
                        <p className="text-[10px] font-bold opacity-40 uppercase">
                          {section.lessons?.length || 0} Lectures
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleEditTopic(section._id, section.title)
                        }
                        disabled={actionLoading === section._id}
                        className="p-1.5 cursor-pointer text-blue-500 hover:bg-blue-500/10 rounded transition-all"
                      >
                        {actionLoading === section._id ? (
                          <Loader size={12} />
                        ) : (
                          <Edit size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(section._id)}
                        disabled={actionLoading === section._id}
                        className="p-1.5 cursor-pointer text-red-500 hover:bg-red-500/10 rounded transition-all"
                      >
                        {actionLoading === section._id ? (
                          <Loader size={12} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {openSections[section._id] && (
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/courses/view/${course._id}/add-lecture/${section._id}`,
                          )
                        }
                        className="w-full p-2 mb-2 rounded border border-dashed border-primary/30 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add New Lecture
                      </button>

                      {section.lessons?.map((lesson, lIdx) => {
                        const typeThemes = {
                          video: { border: "rgba(59, 130, 246, 0.15)", bg: "rgba(59, 130, 246, 0.02)", iconBg: "rgba(59, 130, 246, 0.1)", iconColor: "#3b82f6", icon: VideoIcon },
                          pdf: { border: "rgba(239, 68, 68, 0.15)", bg: "rgba(239, 68, 68, 0.02)", iconBg: "rgba(239, 68, 68, 0.1)", iconColor: "#ef4444", icon: FileText },
                          live: { border: "rgba(244, 63, 94, 0.2)", bg: "rgba(244, 63, 94, 0.03)", iconBg: "rgba(244, 63, 94, 0.1)", iconColor: "#f43f5e", icon: Play },
                          youtube_zoom: { border: "rgba(99, 102, 241, 0.15)", bg: "rgba(99, 102, 241, 0.02)", iconBg: "rgba(99, 102, 241, 0.1)", iconColor: "#6366f1", icon: Monitor },
                          webinar: { border: "rgba(16, 185, 129, 0.15)", bg: "rgba(16, 185, 129, 0.02)", iconBg: "rgba(16, 185, 129, 0.1)", iconColor: "#10b981", icon: Layout },
                          test: { border: "rgba(245, 158, 11, 0.15)", bg: "rgba(245, 158, 11, 0.02)", iconBg: "rgba(245, 158, 11, 0.1)", iconColor: "#f59e0b", icon: CheckCircle },
                          subjective_test: { border: "rgba(168, 85, 247, 0.15)", bg: "rgba(168, 85, 247, 0.02)", iconBg: "rgba(168, 85, 247, 0.1)", iconColor: "#a855f7", icon: Hash },
                        };
                        const typeTheme = typeThemes[lesson.contentType] || typeThemes.video;
                        const IconComponent = typeTheme.icon;

                        return (
                          <div
                            key={lesson._id}
                            className="p-3.5 rounded-xl border mb-2 flex items-center justify-between transition-all hover:shadow-md"
                            style={{
                              borderColor: typeTheme.border,
                              backgroundColor: typeTheme.bg,
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                                style={{
                                  backgroundColor: typeTheme.iconBg,
                                  color: typeTheme.iconColor,
                                }}
                              >
                                <IconComponent size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className="text-sm font-bold"
                                    style={{ color: colors.text }}
                                  >
                                    {lesson.title}
                                  </p>
                                  {lesson.contentType === "live" && (
                                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                      lesson.liveStatus === "live"
                                        ? "bg-red-50 text-red-500 border-red-100 animate-pulse"
                                        : lesson.liveStatus === "ended"
                                        ? "bg-gray-100 text-gray-500 border-gray-200"
                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}>
                                      {lesson.liveStatus === "live" ? "🔴 Live" : lesson.liveStatus === "ended" ? "Ended" : "Scheduled"}
                                    </span>
                                  )}
                                  {lesson.contentType === "youtube_zoom" && (
                                    <span className="text-[8px] font-bold uppercase text-blue-500 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100">
                                      Zoom/YT Live
                                    </span>
                                  )}
                                  {lesson.contentType === "webinar" && (
                                    <span className="text-[8px] font-bold uppercase text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                                      Webinar
                                    </span>
                                  )}
                                  {lesson.contentType === "test" && (
                                    <span className="text-[8px] font-bold uppercase text-amber-500 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100">
                                      Quiz / Test
                                    </span>
                                  )}
                                  {lesson.contentType === "subjective_test" && (
                                    <span className="text-[8px] font-bold uppercase text-purple-500 px-1.5 py-0.5 rounded bg-purple-50 border border-purple-100">
                                      Subjective Test
                                    </span>
                                  )}
                                  {lesson.isPreview && (
                                    <span className="text-[8px] font-bold uppercase text-blue-500 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 opacity-40 mt-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-bold capitalize">
                                      {lesson.contentType === "video"
                                        ? lesson.duration || "--:--"
                                        : lesson.contentType || "lecture"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              {actionLoading === lesson._id ? (
                                <Loader size={14} />
                              ) : (
                                <Toggle
                                  active={lesson.isActive}
                                  onClick={() =>
                                    toggleLectureStatus(
                                      section._id,
                                      lesson._id,
                                      lesson.isActive ? "Active" : "Disabled",
                                    )
                                  }
                                />
                              )}
                              <span
                                className={`text-[9px] font-bold uppercase ${
                                  lesson.isActive
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {lesson.isActive ? "Active" : "Disabled"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.contentType === "live" && (
                                <button
                                  onClick={() => toggleLiveStatus(lesson._id, lesson.liveStatus)}
                                  className={`px-3 py-1 cursor-pointer rounded text-[10px] font-bold uppercase transition-all border ${
                                    lesson.liveStatus === "live"
                                      ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                                      : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                  }`}
                                  title={lesson.liveStatus === "live" ? "End Live" : "Go Live"}
                                >
                                  {lesson.liveStatus === "live" ? "End Live ⏹️" : "Go Live 🔴"}
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/courses/view/${course._id}/lecture/${lesson._id}`,
                                  )
                                }
                                className="p-1.5 cursor-pointer text-primary hover:bg-primary/5 rounded"
                                title="View Lecture"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/courses/view/${course._id}/lecture/edit/${lesson._id}`,
                                  )
                                }
                                className="p-1.5 cursor-pointer text-blue-500 hover:bg-blue-500/5 rounded"
                                title="Edit Lecture"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteLecture(section._id, lesson._id)
                                }
                                className="p-1.5 cursor-pointer text-red-500 hover:bg-red-500/5 rounded"
                                title="Delete Lecture"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!section.lessons || section.lessons.length === 0) && (
                        <p className="text-xs opacity-20 text-center py-2 italic font-bold">
                          No lectures added.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* FAQs Section */}
          <Card>
            <SectionHeader icon={HelpCircle} title="Course FAQs" />
            <div className="space-y-4">
              {(course.faqs || []).map((faq, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-black/5 space-y-2"
                >
                  <p
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {faq.question}
                  </p>
                  <p
                    className="text-xs opacity-70 leading-relaxed"
                    style={{ color: colors.text }}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
              {(!course.faqs || course.faqs.length === 0) && (
                <p className="text-xs opacity-40 text-center py-4">
                  No FAQs added yet.
                </p>
              )}
            </div>
          </Card>

          {/* Reviews Section */}
          <Card>
            <SectionHeader icon={Star} title="Course Reviews" />
            <div className="space-y-4">
              {(course.reviews || []).map((review, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 rounded-lg bg-black/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner shrink-0 uppercase">
                    {review.studentName?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {review.studentName || "Anonymous"}
                      </p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < review.rating ? "#fbbf24" : "none"}
                            className={
                              i < review.rating
                                ? "text-amber-400"
                                : "text-black/10"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p
                      className="text-xs opacity-60 italic"
                      style={{ color: colors.text }}
                    >
                      "{review.comment}"
                    </p>
                    <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest mt-1">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : "--"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {actionLoading === review._id ? (
                      <Loader size={14} />
                    ) : (
                      <Toggle
                        active={review.isApproved !== false}
                        onClick={() => handleToggleReviewStatus(review._id)}
                      />
                    )}
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        review.isApproved !== false
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {review.isApproved !== false ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
              {(!course.reviews || course.reviews.length === 0) && (
                <p className="text-xs opacity-40 text-center py-4">
                  No reviews added yet.
                </p>
              )}
            </div>
          </Card>

          {/* Certificate Modal Trigger / Preview */}
          {course.certificateTemplate && (
            <Card>
              <SectionHeader icon={Award} title="Certificate Template" />
              <div className="flex flex-col items-center gap-4">
                <div
                  className="group relative rounded-lg overflow-hidden border-2 border-white shadow-xl cursor-pointer transition-all hover:scale-[1.01] max-w-md w-full"
                  onClick={() => {
                    setShowCertModal(true);
                    setTimeout(() => setShowModalContent(true), 10);
                  }}
                >
                  <CertificatePreviewCanvas
                    template={course.certificateTemplate}
                    width={800}
                    height={533}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-xs">
                    <Maximize2 size={24} className="text-white mb-2" />
                    <p className="text-white font-bold text-[10px] uppercase tracking-widest">
                      Preview Full
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  Template: {course.certificateTemplate?.certificateName}
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 opacity-40">
          <Monitor size={48} className="mb-4" />
          <p className="font-bold">Course not found</p>
        </div>
      )}

      {/* Full Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10 overflow-hidden">
          <div
            className={`absolute inset-0 bg-black/20 backdrop-blur-[4px] transition-opacity duration-500 ease-in-out ${
              showModalContent ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              setShowModalContent(false);
              setTimeout(() => setShowCertModal(false), 500);
            }}
          />
          <div
            className={`relative max-w-[95vw] max-h-[90vh] flex items-center justify-center transition-all duration-500 transform ease-out ${
              showModalContent
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-90 opacity-0 translate-y-10"
            }`}
          >
            <button
              onClick={() => {
                setShowModalContent(false);
                setTimeout(() => setShowCertModal(false), 500);
              }}
              className="absolute -top-12 right-0 md:top-2 md:-right-12 p-2.5 rounded-lg bg-black/50 hover:bg-black/80 text-white transition-all z-10 cursor-pointer shadow-xl"
            >
              <X size={24} />
            </button>
            <div className="rounded-lg shadow-2xl border-4 border-white/20 overflow-hidden bg-white">
              <CertificatePreviewCanvas
                template={course.certificateTemplate}
                width={course.certificateTemplate?.width || 1200}
                height={course.certificateTemplate?.height || 800}
                className="max-w-full max-h-[90vh] object-contain block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCourse;
