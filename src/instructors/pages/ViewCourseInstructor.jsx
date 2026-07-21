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
  Video as VideoIcon,
  Mail,
  Phone,
  CheckCircle,
  Lock,
  Search,
  Award,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getCourseById } from "../../apis/course";
import { getInstructorCourseStudents } from "../../apis/instructor";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function ViewCourseInstructor() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [activeTab, setActiveTab] = useState("curriculum"); // 'curriculum' | 'students'

  // Students state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

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

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await getInstructorCourseStudents(id);
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch course students", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchStudents();
  }, [id]);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const totalLessons = course?.curriculum?.reduce(
    (acc, section) => acc + (section.lessons?.length || 0),
    0
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.mobile?.toLowerCase().includes(studentSearch.toLowerCase())
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

        {/* Tab Switcher */}
        <div className="flex bg-black/5 p-1 rounded-xl gap-1 border border-black/5">
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "curriculum"
                ? "bg-indigo-600 text-white shadow-sm"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <Monitor size={14} /> Curriculum
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "students"
                ? "bg-indigo-600 text-white shadow-sm"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <Users size={14} /> Enrolled Students ({students.length})
          </button>
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
              {/* Top Banner */}
              <div
                className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b"
                style={{ borderColor: colors.accent + "05" }}
              >
                <div
                  className="w-48 h-32 rounded overflow-hidden border shrink-0 bg-gray-100"
                  style={{ borderColor: colors.accent + "15" }}
                >
                  <img
                    src={
                      course.thumbnail?.url ||
                      course.thumbnail?.localUrl ||
                      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop"
                    }
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop";
                    }}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
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
                      <Users size={12} /> {students.length} Enrolled Students
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {course.duration || "Self-Paced"}
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 1: CURRICULUM */}
              {activeTab === "curriculum" && (
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
                                          <VideoIcon size={10} />
                                        ) : (
                                          <FileText size={10} />
                                        )}
                                        <span className="text-[9px] font-bold">
                                          {lesson.duration || "--:--"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/instructor-dashboard/my-courses/view/${course._id}/lecture/${lesson._id}`
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
              )}

              {/* TAB 2: ENROLLED STUDENTS */}
              {activeTab === "students" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3
                        className="text-sm font-black uppercase tracking-widest flex items-center gap-2"
                        style={{ color: colors.text }}
                      >
                        <Users size={18} /> Registered Students ({students.length})
                      </h3>
                      <p className="text-[10px] font-bold opacity-40 mt-0.5 uppercase">
                        Students who enrolled or purchased this course
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                      />
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs outline-none"
                        style={{
                          borderColor: colors.accent + "20",
                          backgroundColor: colors.sidebar || colors.background,
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>

                  {loadingStudents ? (
                    <div className="flex justify-center p-12">
                      <Loader size={50} />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center border rounded-xl bg-black/2 space-y-2">
                      <Users size={36} className="mx-auto opacity-20" />
                      <p className="font-bold text-sm">No Registered Students Found</p>
                      <p className="text-xs opacity-50">
                        When students purchase or enroll in this course, their details will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-3 font-bold uppercase tracking-wider text-slate-500">Student</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-slate-500">Contact Details</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-slate-500">Progress</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-slate-500">Certificate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {filteredStudents.map((st) => {
                            const progressVal = st.progressPercentage || st.progress || 0;
                            return (
                              <tr key={st._id} className="hover:bg-black/5 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-indigo-500/20">
                                      {st.profilePicture?.url ? (
                                        <img
                                          src={st.profilePicture.url}
                                          alt=""
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        st.name ? st.name[0] : "S"
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</p>
                                      <span className="text-[10px] font-semibold text-slate-400">ID: {st._id?.slice(-6)}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                      <Mail size={12} className="text-indigo-500 shrink-0" />
                                      <span>{st.email || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-medium text-slate-500">
                                      <Phone size={12} className="text-slate-400 shrink-0" />
                                      <span>{st.mobile || "N/A"}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 min-w-[140px]">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span>{progressVal}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-indigo-600 rounded-full"
                                        style={{ width: `${Math.min(progressVal, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {st.certificateIssued || progressVal >= 100 ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                      <Award size={12} /> Issued
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                      In Progress
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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
                          {course.language || "Hindi/English"}
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
                    <div className="space-y-1 pt-3 border-t border-black/5">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Instructor Share (%)
                      </p>
                      <p className="text-base font-bold text-indigo-600">
                        {course.priceForInstructor ?? 15}% Commission
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
