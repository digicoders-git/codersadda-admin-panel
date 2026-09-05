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
  Folder,
  Hash,
  ShieldAlert,
  RotateCcw,
  Search,
  Radio,
  Square,
  Copy,
  Check,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getCourseById,
  updateCourse as apiUpdateCourse,
  toggleCourseReviewStatus,
  toggleCourseStatus,
} from "../../apis/course";
import { createTopic, updateTopic, deleteTopic } from "../../apis/curriculum";
import { deleteLecture, updateLecture } from "../../apis/lecture";
import {
  getCourseStudents,
  toggleCourseAccess,
  resetCourseProgress,
} from "../../apis/courseEnrollment";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";
import CertificatePreviewCanvas from "../../components/CertificatePreviewCanvas";
import liveSessionApi from "../../apis/liveSession";
import CreateLiveSession from "../live/CreateLiveSession";

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

  const [activeTab, setActiveTab] = useState("content");
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // Live sessions state
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [showCreateLive, setShowCreateLive] = useState(false);
  const [liveActionLoading, setLiveActionLoading] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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

  const fetchStudents = async () => {
    if (!id) return;
    try {
      setStudentsLoading(true);
      const res = await getCourseStudents(id);
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch course students", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchStudents();
    }
    if (activeTab === "live") {
      fetchLiveSessions();
    }
  }, [activeTab, id]);

  const fetchLiveSessions = async () => {
    try {
      setLiveLoading(true);
      const res = await liveSessionApi.getByCourse(id);
      setLiveSessions(res.data || []);
    } catch {
      // silent
    } finally {
      setLiveLoading(false);
    }
  };

  const handleGoLive = async (session) => {
    const result = await Swal.fire({
      title: "Go Live?",
      html: `<p>This will mark <b>${session.title}</b> as LIVE. Students will see the Join button.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, Go Live!",
    });
    if (!result.isConfirmed) return;
    try {
      setLiveActionLoading(session._id);
      await liveSessionApi.goLive(session._id);
      setLiveSessions((prev) => prev.map((s) => s._id === session._id ? { ...s, status: "live" } : s));
      toast.success("Session is now LIVE!");
      Swal.fire({
        title: "🎥 OBS Stream Credentials",
        html: `<div style="text-align:left;font-size:13px;">
          <p style="margin-bottom:6px;font-weight:600;">① OBS खोलो → Settings → Stream</p>
          <p style="margin-bottom:6px;color:#6b7280;">Service: <b>Custom</b> select karo</p>
          <hr style="margin:10px 0;border-color:#e5e7eb;"/>
          <p style="margin-bottom:6px;"><b>② Server (Ingest Endpoint):</b></p>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <code id="swal-ingest" style="background:#f3f4f6;padding:6px 10px;border-radius:4px;flex:1;word-break:break-all;font-size:11px;">${session.ingestEndpoint}</code>
            <button onclick="navigator.clipboard.writeText('${session.ingestEndpoint}');this.innerText='✅';setTimeout(()=>this.innerText='📋 Copy',1500)" style="background:#3B82F6;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;white-space:nowrap;">📋 Copy</button>
          </div>
          <p style="margin-bottom:6px;"><b>③ Stream Key:</b></p>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <code id="swal-key" style="background:#f3f4f6;padding:6px 10px;border-radius:4px;flex:1;word-break:break-all;font-size:11px;">${session.streamKey}</code>
            <button onclick="navigator.clipboard.writeText('${session.streamKey}');this.innerText='✅';setTimeout(()=>this.innerText='📋 Copy',1500)" style="background:#3B82F6;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;white-space:nowrap;">📋 Copy</button>
          </div>
          <hr style="margin:10px 0;border-color:#e5e7eb;"/>
          <p style="color:#6b7280;font-size:12px;">④ Apply → OK → OBS mein <b>Start Streaming</b> dabao 🚀</p>
        </div>`,
        confirmButtonText: "Got it, Start Streaming!",
        confirmButtonColor: "#EF4444",
        width: 520,
      });
    } catch {
      toast.error("Failed to go live");
    } finally {
      setLiveActionLoading(null);
    }
  };

  const handleEndLive = async (session) => {
    const { value: recordingUrl } = await Swal.fire({
      title: "End Live Session",
      input: "url",
      inputLabel: "Recording URL (leave empty if not ready)",
      inputPlaceholder: "https://s3.amazonaws.com/...",
      showCancelButton: true,
      confirmButtonText: "End Session",
      confirmButtonColor: "#6B7280",
    });
    if (recordingUrl === undefined) return;
    try {
      setLiveActionLoading(session._id);
      await liveSessionApi.endLive(session._id, recordingUrl || "");
      setLiveSessions((prev) => prev.map((s) => s._id === session._id ? { ...s, status: "ended", recordingUrl: recordingUrl || "" } : s));
      toast.success("Session ended.");
    } catch {
      toast.error("Failed to end session");
    } finally {
      setLiveActionLoading(null);
    }
  };

  const handleDeleteLiveSession = (sessionId) => {
    Swal.fire({
      title: "Delete Session?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setLiveActionLoading(sessionId);
        await liveSessionApi.delete(sessionId);
        setLiveSessions((prev) => prev.filter((s) => s._id !== sessionId));
        toast.success("Deleted");
      } catch {
        toast.error("Failed to delete");
      } finally {
        setLiveActionLoading(null);
      }
    });
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const liveStatusBadge = (status) => {
    const map = {
      scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled" },
      live: { bg: "bg-red-100", text: "text-red-700", label: "🔴 LIVE" },
      ended: { bg: "bg-gray-100", text: "text-gray-600", label: "Ended" },
    };
    const s = map[status] || map.scheduled;
    return <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const formatLiveDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleToggleCourseStatus = async () => {
    try {
      setActionLoading("toggle-course-status");
      const res = await toggleCourseStatus(id);
      if (res.success) {
        toast.info(res.message);
        await fetchCourse();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating course status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAccess = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await toggleCourseAccess(userId, id);
      if (res.success) {
        toast.success(res.message || "Access status updated!");
        fetchStudents();
      }
    } catch (error) {
      toast.error("Failed to update access status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetProgress = async (userId) => {
    Swal.fire({
      title: "Reset Progress?",
      text: "This will reset all course progress for this student.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, reset",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(userId);
          const res = await resetCourseProgress(userId, id);
          if (res.success) {
            toast.success(res.message || "Progress reset successfully!");
          }
        } catch (error) {
          toast.error("Failed to reset progress");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleAddContentClick = (type) => {
    if (type === "folder") {
      handleAddTopic();
      return;
    }

    if (!course?.curriculum || course.curriculum.length === 0) {
      toast.warning("Please add at least one Topic (Folder) first!");
      return;
    }

    // If there is only one section/topic, directly select it
    if (course.curriculum.length === 1) {
      navigate(`/dashboard/courses/view/${course._id}/add-lecture/${course.curriculum[0]._id}?type=${type}`);
      return;
    }

    // Otherwise, show a quick SweetAlert2 dropdown selector
    Swal.fire({
      title: "Select Topic / Module",
      text: `Choose which topic to add this ${type} content to:`,
      input: "select",
      inputOptions: course.curriculum.reduce((acc, item) => {
        acc[item._id] = item.title;
        return acc;
      }, {}),
      inputPlaceholder: "Select a topic...",
      showCancelButton: true,
      confirmButtonText: "Continue",
      confirmButtonColor: colors.primary,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        navigate(`/dashboard/courses/view/${course._id}/add-lecture/${result.value}?type=${type}`);
      }
    });
  };

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

  const filteredStudents = students.filter(
    (s) =>
      s.student?.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.student?.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.student?.phone?.includes(studentSearch)
  );

  return (
    <div className="w-full mx-auto pb-20 pt-2 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: colors.accent + "10" }}>
        <div className="flex items-center gap-4">
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
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-wide animate-none" style={{ color: colors.text }}>
              {course ? course.title : "View Course"}
            </h1>
          </div>
        </div>

        {course && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/dashboard/courses/edit/${course._id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-xs uppercase tracking-widest transition-all hover:bg-black/[0.03] shadow-sm cursor-pointer"
              style={{
                borderColor: colors.accent + "30",
                color: colors.text,
                backgroundColor: colors.sidebar || colors.background,
              }}
            >
              <Edit size={14} /> Edit
            </button>

            <button
              onClick={handleToggleCourseStatus}
              disabled={actionLoading === "toggle-course-status"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 text-white shadow-md cursor-pointer"
              style={{
                backgroundColor: course.isActive ? "#1f2937" : colors.primary,
              }}
            >
              {actionLoading === "toggle-course-status" ? (
                <Loader size={12} variant="button" />
              ) : (
                <>
                  <Lock size={14} />
                  <span>{course.isActive ? "Unpublish" : "Publish"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {course && (
        <div className="flex border-b mb-6 gap-6" style={{ borderColor: colors.accent + "20" }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "content", label: "Content" },
            { id: "links", label: "Links" },
            { id: "forum", label: "Forum" },
            { id: "chat", label: "Chat" },
            { id: "posts", label: "Posts" },
            { id: "users", label: "Users" },
            { id: "live", label: "🔴 Live Classes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold tracking-wider relative transition-all uppercase cursor-pointer ${
                activeTab === tab.id ? "opacity-100" : "opacity-40 hover:opacity-80"
              }`}
              style={{
                color: colors.text,
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[2.5px] rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : course ? (
        <div className="w-full">
          {activeTab === "overview" && (
            <div className="space-y-6">
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

              {/* Certificate Template */}
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
          )}

          {activeTab === "content" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Curriculum Section */}
              <div className="lg:col-span-3">
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
                              );
                            })}
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
              </div>

              {/* ADD CONTENT sidebar */}
              <div className="lg:col-span-1">
                <div
                  className="p-5 rounded-xl border shadow-sm space-y-4"
                  style={{
                    backgroundColor: colors.sidebar || colors.background,
                    borderColor: colors.accent + "20",
                  }}
                >
                  <h3
                    className="text-xs font-black uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Add Content
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "folder", label: "Folder (Topic)", icon: Folder, color: colors.primary, bg: colors.primary + "08", border: colors.primary + "15" },
                      { id: "video", label: "Video", icon: VideoIcon, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.15)" },
                      { id: "pdf", label: "PDF", icon: FileText, color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.15)" },
                      { id: "live", label: "Live Stream", icon: Play, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.08)", border: "rgba(244, 63, 94, 0.15)" },
                      { id: "youtube_zoom", label: "YouTube/Zoom Live", icon: Monitor, color: "#6366f1", bg: "rgba(99, 102, 241, 0.08)", border: "rgba(99, 102, 241, 0.15)" },
                      { id: "webinar", label: "Webinar.gg Live", icon: Layout, color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.15)" },
                      { id: "test", label: "Test (Quiz)", icon: CheckCircle, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.15)" },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleAddContentClick(btn.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border text-left text-xs font-bold transition-all hover:translate-x-1 cursor-pointer"
                        style={{
                          backgroundColor: btn.bg,
                          borderColor: btn.border,
                          color: btn.color,
                        }}
                      >
                        <btn.icon size={16} />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <Card>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <SectionHeader icon={Users} title="Enrolled Students" />
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-35" size={16} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none text-xs"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {studentsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader size={48} />
                  <p className="text-xs opacity-50 mt-2">Loading students...</p>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.accent + "15" }}>
                        <th className="pb-3 font-bold uppercase tracking-wider opacity-60">Student Info</th>
                        <th className="pb-3 font-bold uppercase tracking-wider opacity-60">Enrolled At</th>
                        <th className="pb-3 font-bold uppercase tracking-wider opacity-60">Access</th>
                        <th className="pb-3 font-bold uppercase tracking-wider opacity-60 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: colors.accent + "10" }}>
                      {filteredStudents.map((item) => (
                        <tr key={item._id} className="hover:bg-black/[0.01]">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase text-xs">
                                {item.student?.fullName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: colors.text }}>
                                  {item.student?.fullName || "User"}
                                </p>
                                <p className="text-[10px] opacity-60">{item.student?.email || "--"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 opacity-75">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "--"}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                                item.isAccessRevoked
                                  ? "bg-red-50 text-red-500 border border-red-100"
                                  : "bg-green-50 text-green-500 border border-green-100"
                              }`}
                            >
                              {item.isAccessRevoked ? "Revoked" : "Active"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleAccess(item.student?._id)}
                                disabled={actionLoading === item.student?._id}
                                className={`p-1.5 rounded transition-all cursor-pointer ${
                                  item.isAccessRevoked
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                                title={item.isAccessRevoked ? "Grant Access" : "Revoke Access"}
                              >
                                <ShieldAlert size={16} />
                              </button>
                              <button
                                onClick={() => handleResetProgress(item.student?._id)}
                                disabled={actionLoading === item.student?._id}
                                className="p-1.5 rounded text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                title="Reset Progress"
                              >
                                <RotateCcw size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 opacity-40">
                  <Users size={32} className="mx-auto mb-2" />
                  <p className="font-bold">No students found</p>
                </div>
              )}
            </Card>
          )}

          {["links", "forum", "chat", "posts"].includes(activeTab) && (
            <Card className="text-center py-20 opacity-60">
              <p className="text-sm font-bold uppercase tracking-wider">Coming Soon</p>
              <p className="text-xs opacity-75 mt-1">This feature is under development.</p>
            </Card>
          )}

          {activeTab === "live" && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: colors.text }}>Live Classes</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Manage live sessions for this course</p>
                </div>
                {!showCreateLive && (
                  <button
                    onClick={() => setShowCreateLive(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: colors.primary, color: colors.background }}
                  >
                    <Plus size={16} /> Schedule Live Class
                  </button>
                )}
              </div>

              {/* Create Form */}
              {showCreateLive && (
                <Card className="mb-6">
                  <CreateLiveSession
                    courseId={id}
                    courseName={course?.title}
                    onSuccess={() => { setShowCreateLive(false); fetchLiveSessions(); }}
                    onCancel={() => setShowCreateLive(false)}
                  />
                </Card>
              )}

              {/* Sessions List */}
              {liveLoading ? (
                <div className="flex items-center justify-center p-20"><Loader size={60} /></div>
              ) : liveSessions.length === 0 ? (
                <Card className="text-center py-20">
                  <Radio size={40} className="mx-auto mb-3 opacity-30" style={{ color: colors.text }} />
                  <p className="font-bold opacity-40" style={{ color: colors.text }}>No live sessions yet</p>
                  <p className="text-xs opacity-30 mt-1" style={{ color: colors.text }}>Schedule your first live class above</p>
                </Card>
              ) : (
                <Card>
                  <div className="rounded border overflow-hidden" style={{ borderColor: colors.accent + "20" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: colors.accent + "10" }}>
                          {["Title / Topic", "Scheduled At", "Duration", "Status", "Actions"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest opacity-60" style={{ color: colors.text }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {liveSessions.map((session, i) => (
                          <tr
                            key={session._id}
                            style={{ backgroundColor: i % 2 === 0 ? colors.background : colors.accent + "05", borderTop: `1px solid ${colors.accent}15` }}
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold" style={{ color: colors.text }}>{session.title}</p>
                              <p className="text-xs opacity-50" style={{ color: colors.text }}>{session.topic}</p>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold opacity-70" style={{ color: colors.text }}>
                              {formatLiveDate(session.scheduledAt)}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold opacity-70" style={{ color: colors.text }}>
                              {session.durationMinutes} min
                            </td>
                            <td className="px-4 py-3">{liveStatusBadge(session.status)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {session.status === "scheduled" && (
                                  <button
                                    onClick={() => handleGoLive(session)}
                                    disabled={liveActionLoading === session._id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                    style={{ backgroundColor: "#EF4444", color: "#fff" }}
                                  >
                                    {liveActionLoading === session._id ? <Loader size={12} variant="button" /> : <><Radio size={11} /> Go Live</>}
                                  </button>
                                )}
                                {session.status === "live" && (
                                  <button
                                    onClick={() => handleEndLive(session)}
                                    disabled={liveActionLoading === session._id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                    style={{ backgroundColor: "#6B7280", color: "#fff" }}
                                  >
                                    {liveActionLoading === session._id ? <Loader size={12} variant="button" /> : <><Square size={11} /> End Live</>}
                                  </button>
                                )}
                                {(session.status === "scheduled" || session.status === "live") && (
                                  <div className="flex items-center gap-1">
                                    <div className="relative group">
                                      <button
                                        onClick={() => copyToClipboard(session.ingestEndpoint, session._id + "_ingest")}
                                        className="flex items-center gap-1 p-1.5 rounded border text-xs transition-all hover:bg-blue-50 cursor-pointer"
                                        style={{ borderColor: "#3B82F630", color: "#3B82F6" }}
                                      >
                                        {copiedId === session._id + "_ingest" ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                                        <span className="text-xs">Server</span>
                                      </button>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        Copy Ingest Endpoint
                                      </div>
                                    </div>
                                    <div className="relative group">
                                      <button
                                        onClick={() => copyToClipboard(session.streamKey, session._id + "_key")}
                                        className="flex items-center gap-1 p-1.5 rounded border text-xs transition-all hover:bg-purple-50 cursor-pointer"
                                        style={{ borderColor: "#8B5CF630", color: "#8B5CF6" }}
                                      >
                                        {copiedId === session._id + "_key" ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                                        <span className="text-xs">Key</span>
                                      </button>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        Copy Stream Key
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDeleteLiveSession(session._id)}
                                  disabled={liveActionLoading === session._id}
                                  className="p-1.5 rounded border text-xs transition-all hover:bg-red-50 cursor-pointer disabled:opacity-50"
                                  style={{ borderColor: "#EF444430", color: "#EF4444" }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
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
