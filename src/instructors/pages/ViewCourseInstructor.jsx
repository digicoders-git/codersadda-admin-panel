import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  ChevronDown,
  Monitor,
  Star,
  Users,
  Clock,
  Eye,
  FileText,
  Video,
  Mail,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getCourseById } from "../../apis/course";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function ViewCourseInstructor() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState({});

  const fetchCourse = async () => {
    try {
      const res = await getCourseById(id);
      if (res.success) {
        setCourse(res.data);
        if (res.data.curriculum?.length > 0) {
          const initialOpen = {};
          res.data.curriculum.forEach((s) => (initialOpen[s._id] = true));
          setOpenSections(initialOpen);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch course details");
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
            onClick={() => navigate("/instructor-dashboard/my-courses")}
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
              {course?.category?.name || ""} • {course?.technology || "--"}
            </p>
          </div>
        </div>
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
                      src={course.thumbnail.url || course.thumbnail}
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
                      {course.rating || 0}
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
                      <Monitor size={18} /> Course Curriculum
                    </h3>
                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase">
                      {course.curriculum?.length || 0} Topics • {totalLessons}{" "}
                      Lectures
                    </p>
                  </div>
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
                        className="p-3 flex items-center justify-between border-b cursor-pointer"
                        style={{ borderColor: colors.accent + "05" }}
                        onClick={() => toggleSection(section._id)}
                      >
                        <div className="flex items-center gap-3">
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
                              Topic {sIdx + 1}: {section.title}
                            </p>
                            <p className="text-[9px] font-bold opacity-40 uppercase">
                              {section.lessons?.length || 0} Lectures
                            </p>
                          </div>
                        </div>
                      </div>

                      {openSections[section._id] && (
                        <div
                          className="p-2 space-y-1"
                          style={{ backgroundColor: colors.background }}
                        >
                          {section.lessons?.map((lesson, lIdx) => (
                            <div
                              key={lesson._id}
                              className="p-3 rounded-lg border border-transparent hover:border-black/5 hover:bg-black/2 flex items-center justify-between group transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-7 h-7 rounded bg-black/5 flex items-center justify-center text-[10px] font-black opacity-30">
                                  {lIdx + 1}
                                </div>
                                <div className="space-y-1">
                                  <p
                                    className="text-[11px] font-bold"
                                    style={{ color: colors.text }}
                                  >
                                    {lesson.title}
                                  </p>
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
                                    {lesson.isLocked && (
                                      <Lock
                                        size={10}
                                        className="text-amber-500 opacity-60"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span
                                  className={`text-[8px] font-black uppercase tracking-wider ${
                                    lesson.status === "Active"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {lesson.status}
                                </span>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/instructor-dashboard/my-courses/view/${course._id}/lecture/${lesson._id}`,
                                    )
                                  }
                                  className="p-1.5 cursor-pointer text-primary transition-all hover:bg-primary/10 rounded"
                                  title="View Lecture"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 p-8 space-y-8 bg-black/2">
              <div
                className="p-6 rounded border space-y-6"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "15",
                }}
              >
                <div className="space-y-4">
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                    Course Information
                  </p>
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
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Pricing
                      </p>
                      <p
                        className="text-2xl font-black"
                        style={{ color: colors.text }}
                      >
                        {course.priceType === "free"
                          ? "FREE"
                          : `₹${course.price}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[2px] opacity-40">
                  What you'll learn
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
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 opacity-40">
            <Monitor size={48} className="mb-4" />
            <p className="font-bold">Course not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewCourseInstructor;
