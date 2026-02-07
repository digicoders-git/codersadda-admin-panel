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
  Video,
  HelpCircle,
  Mail,
  Briefcase,
  Layers,
  Award,
  Maximize2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getCourseById,
  updateCourse as apiUpdateCourse,
} from "../../apis/course";
import { createTopic, updateTopic, deleteTopic } from "../../apis/curriculum";
import { deleteLecture, updateLecture } from "../../apis/lecture";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";

function ViewCourse() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [showCertModal, setShowCertModal] = useState(false);

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
            setOpenSections((prev) => ({ ...prev, [res.data._id]: true }));
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
        fetchCourse();
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const totalLessons = course?.curriculum?.reduce(
    (acc, section) => acc + (section.lessons?.length || 0),
    0,
  );

  return (
    <div className="w-full min-h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "20",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/courses")}
            className="p-2 rounded hover:bg-black/5 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} style={{ color: colors.text }} />
          </button>
          <div className="min-w-0">
            <h1
              className="text-base font-bold truncate"
              style={{ color: colors.text }}
            >
              {course?.title || "Loading..."}
            </h1>
            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest truncate">
              {course?.category?.name ||
                (typeof course?.category === "string"
                  ? course?.category
                  : "")}{" "}
              • {course?.technology || "--"}
            </p>
          </div>
        </div>
        {course && (
          <button
            onClick={() => navigate(`/dashboard/courses/edit/${course._id}`)}
            className="px-4 shrink-0 cursor-pointer py-2 rounded font-bold text-[10px] uppercase tracking-wider border transition-all active:scale-95"
            style={{ borderColor: colors.accent + "30", color: colors.text }}
          >
            Edit Course
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-20 h-full">
            <Loader size={80} />
          </div>
        ) : course ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            {/* Main Content */}
            <div
              className="lg:col-span-8 p-4 md:p-6 space-y-8 border-r"
              style={{ borderColor: colors.accent + "10" }}
            >
              <div
                className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b"
                style={{ borderColor: colors.accent + "05" }}
              >
                <div
                  className="w-48 h-32 rounded overflow-hidden border shrink-0"
                  style={{ borderColor: colors.accent + "15" }}
                >
                  {course.thumbnail ? (
                    <img
                      src={
                        typeof course.thumbnail === "string"
                          ? course.thumbnail
                          : course.thumbnail.url
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                      <Play size={32} className="text-blue-500 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest"
                      style={{
                        backgroundColor: colors.primary + "10",
                        color: colors.primary,
                      }}
                    >
                      {course.badge || "Standard"}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-black/5 text-[10px] font-black uppercase tracking-widest opacity-60">
                      {course.level || "All Levels"}
                    </span>
                  </div>
                  <h2
                    className="text-xl font-black leading-tight"
                    style={{ color: colors.text }}
                  >
                    {course.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider opacity-50">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} /> {course.studentsEnrolled || 0}{" "}
                      Students
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {course.duration || "0h"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={12}
                        className="text-amber-400 fill-amber-400"
                      />{" "}
                      {course.rating || 0} ({course.reviews?.length || 0})
                    </div>
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3
                      className="text-sm font-black uppercase tracking-widest flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <Monitor size={18} /> Course Content
                    </h3>
                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase">
                      {course.curriculum?.length || 0} Topics • {totalLessons}{" "}
                      Lectures
                    </p>
                  </div>
                  <button
                    onClick={handleAddTopic}
                    disabled={actionLoading === "topic-add"}
                    className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 text-white disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {actionLoading === "topic-add" ? (
                      <Loader size={12} />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add Topic
                  </button>
                </div>

                <div className="space-y-3">
                  {course.curriculum?.map((section, sIdx) => (
                    <div
                      key={section._id}
                      className="rounded border"
                      style={{
                        backgroundColor: colors.sidebar || colors.background,
                        borderColor: colors.accent + "15",
                      }}
                    >
                      <div
                        className="p-3 flex items-center justify-between border-b"
                        style={{ borderColor: colors.accent + "05" }}
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer group flex-1"
                          onClick={() => toggleSection(section._id)}
                        >
                          <div
                            className={`p-1.5 rounded transition-colors ${
                              openSections[section._id]
                                ? "bg-primary text-white"
                                : "bg-black/5"
                            }`}
                          >
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-300 ${
                                openSections[section._id] ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          <div>
                            <p
                              className="text-xs font-black uppercase tracking-wider"
                              style={{ color: colors.text }}
                            >
                              Topic {sIdx + 1}: {section.topic}
                            </p>
                            <p className="text-[9px] font-bold opacity-40 uppercase">
                              {section.lessons?.length || 0} Lectures
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleEditTopic(section._id, section.topic)
                            }
                            disabled={actionLoading === section._id}
                            className="p-1.5 cursor-pointer text-blue-500 hover:bg-blue-500/10 rounded transition-all disabled:opacity-50"
                            title="Edit Topic"
                          >
                            {actionLoading === section._id ? (
                              <Loader size={12} />
                            ) : (
                              <Edit size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(section._id)}
                            disabled={actionLoading === section._id}
                            className="p-1.5 cursor-pointer text-red-500 hover:bg-red-500/10 rounded transition-all disabled:opacity-50"
                            title="Delete Topic"
                          >
                            {actionLoading === section._id ? (
                              <Loader size={12} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {openSections[section._id] && (
                        <div
                          className="p-2 space-y-1"
                          style={{ backgroundColor: colors.background }}
                        >
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/courses/view/${course._id}/add-lecture/${section._id}`,
                              )
                            }
                            className="w-full p-2 mb-2 rounded border border-dashed border-primary/30 text-primary font-black text-[9px] uppercase tracking-widest hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Plus size={12} /> Add New Lecture
                          </button>

                          {section.lessons?.length > 0 ? (
                            section.lessons.map((lesson, lIdx) => (
                              <div
                                key={lesson._id}
                                className="p-3 rounded-lg border border-transparent hover:border-black/5 hover:bg-black/2 flex items-center justify-between group transition-all"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-7 h-7 rounded bg-black/5 flex items-center justify-center text-[10px] font-black opacity-30">
                                    {lIdx + 1}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p
                                        className="text-[11px] font-bold"
                                        style={{ color: colors.text }}
                                      >
                                        {lesson.title}
                                      </p>
                                      {lesson.isPreview && (
                                        <span className="text-[8px] font-black uppercase text-blue-500 px-1 rounded bg-blue-50 border border-blue-100">
                                          Preview
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 opacity-40">
                                        {lesson.videoUrl ? (
                                          <Video size={10} />
                                        ) : (
                                          <FileText size={10} />
                                        )}
                                        <span className="text-[9px] font-bold">
                                          {lesson.duration || "--:--"}
                                        </span>
                                      </div>
                                      {lesson.pdfUrl && (
                                        <div className="flex items-center gap-1 text-red-500">
                                          <FileText size={8} />
                                          <span className="text-[8px] font-black uppercase">
                                            PDF
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2">
                                    {actionLoading === lesson._id ? (
                                      <Loader size={12} />
                                    ) : (
                                      <Toggle
                                        active={lesson.status === "Active"}
                                        onClick={() =>
                                          toggleLectureStatus(
                                            section._id,
                                            lesson._id,
                                            lesson.status,
                                          )
                                        }
                                      />
                                    )}
                                    <span
                                      className={`text-[8px] font-black uppercase tracking-wider ${
                                        lesson.status === "Active"
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {lesson.status || "Active"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/dashboard/courses/view/${course._id}/lecture/${lesson._id}`,
                                        )
                                      }
                                      className="p-1.5 cursor-pointer text-primary transition-all hover:bg-primary/10 rounded"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/dashboard/courses/view/${course._id}/lecture/edit/${lesson._id}`,
                                        )
                                      }
                                      className="p-1.5 cursor-pointer text-blue-500 transition-all hover:bg-blue-500/10 rounded"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLecture(
                                          section._id,
                                          lesson._id,
                                        )
                                      }
                                      disabled={actionLoading === lesson._id}
                                      className="p-1.5 cursor-pointer text-red-500 transition-all hover:bg-red-500/10 rounded disabled:opacity-50"
                                    >
                                      {actionLoading === lesson._id ? (
                                        <Loader size={12} />
                                      ) : (
                                        <Trash2 size={14} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center opacity-20 text-[9px] font-bold italic uppercase tracking-wider">
                              Empty Topic
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 p-8 space-y-8 bg-black/2 relative">
              {/* Certificate Template Preview */}
              {course.certificateTemplate && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[2px] opacity-40 flex items-center gap-2">
                    <Award size={14} /> Course Certificate
                  </h3>
                  <div
                    className="group relative rounded-xl overflow-hidden border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                    onClick={() => setShowCertModal(true)}
                  >
                    <img
                      src={course.certificateTemplate?.templateImage?.url}
                      alt="Certificate Template"
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest">
                        <Maximize2 size={16} /> View Full Template
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-center opacity-40 uppercase tracking-tighter">
                    Automatically issued on 90% completion
                  </p>
                </div>
              )}

              {/* Learning Outcomes */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[2px] opacity-40">
                  Learning Outcomes
                </h3>
                <div className="space-y-3">
                  {course.whatYouWillLearn?.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded border bg-white dark:bg-black/20"
                      style={{ borderColor: colors.accent + "10" }}
                    >
                      <CheckCircle
                        size={14}
                        className="text-green-500 shrink-0 mt-0.5"
                      />
                      <span
                        className="text-xs font-semibold opacity-70"
                        style={{ color: colors.text }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-6 rounded border space-y-6"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "15",
                }}
              >
                {course.instructor && (
                  <div
                    className="space-y-4 pb-6 border-b"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      Instructor Details
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                          {(typeof course.instructor === "object"
                            ? course.instructor?.fullName
                            : course.instructor
                          )?.charAt(0) || "I"}
                        </div>
                        <div>
                          <p
                            className="text-xs font-bold"
                            style={{ color: colors.text }}
                          >
                            {typeof course.instructor === "object"
                              ? course.instructor?.fullName
                              : course.instructor}
                          </p>
                          <div className="flex items-center gap-1.5 opacity-40 mt-0.5">
                            <Briefcase size={10} />
                            <p className="text-[9px] font-bold uppercase">
                              {course.instructor?.role || "Instructor"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {course.instructor?.email && (
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/5">
                          <Mail size={12} className="opacity-30" />
                          <p className="text-[10px] font-bold opacity-60 truncate">
                            {course.instructor?.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Language
                      </p>
                      <p
                        className="text-xs font-black"
                        style={{ color: colors.text }}
                      >
                        {course.language || "English"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Technology
                      </p>
                      <p
                        className="text-xs font-black"
                        style={{ color: colors.text }}
                      >
                        {course.technology}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-4">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      Enrollment Fee
                    </p>
                    <p
                      className="text-3xl font-black"
                      style={{ color: colors.text }}
                    >
                      {course.priceType?.toLowerCase() === "free"
                        ? "FREE"
                        : `₹${course.price}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 opacity-40">
            <Monitor size={48} className="mb-4" />
            <p className="font-bold">Course not found</p>
          </div>
        )}
      </div>

      {/* Full Certificate Modal */}
      {showCertModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setShowCertModal(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2"
            onClick={() => setShowCertModal(false)}
          >
            <Maximize2 size={32} className="rotate-45" />
          </button>

          <img
            src={course.certificateTemplate?.templateImage?.url}
            alt="Full Certificate Template"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />

          <div className="absolute bottom-10 text-center">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">
              Certificate Template Preview
            </h4>
            <p className="text-white/40 text-[10px] mt-2 font-bold uppercase">
              Standard View • 1200 x 900
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCourse;
