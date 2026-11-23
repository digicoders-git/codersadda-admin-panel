import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Search,
  MoreVertical,
  Eye,
  ShieldOff,
  RotateCcw,
  CheckCircle,
  FileDown,
  X,
  User as UserIcon,
  ChevronRight,
  Filter,
  ArrowUpRight,
  BookOpen,
  DollarSign,
  Clock,
  RotateCw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getCourseEnrollmentStats,
  getAllCoursesEnrollments,
  getCourseStudents,
  resetCourseProgress,
  toggleCourseAccess,
  getCourseAnalytics,
} from "../../apis/courseEnrollment";
import { getCourseCategories } from "../../apis/courseCategory";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";
import { motion, AnimatePresence } from "framer-motion";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const CourseEnrollments = () => {
  const {
    colors,
    setRightSidebarOpen,
    setRightSidebarContent,
    setHeaderTitle,
    setSidebarOpen,
  } = useTheme();
  const navigate = useNavigate();

  // Data States
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState("all");
  const [priceType, setPriceType] = useState("all");

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, catRes] = await Promise.all([
        getCourseEnrollmentStats(),
        getCourseCategories({ limit: 100 }),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (catRes.success) setCategories(catRes.data);

      // Fetch courses with current filters
      await fetchCourses();
    } catch (error) {
      toast.error("Failed to fetch initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setTableLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        priceType: priceType === "all" ? undefined : priceType,
      };
      const res = await getAllCoursesEnrollments(params);
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch courses when filters change (with small delay for search)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, categoryId, priceType]);

  const closeRightSidebar = useCallback(() => {
    setRightSidebarOpen(false);
    setRightSidebarContent(null);
    setHeaderTitle("Welcome Back");
    setSidebarOpen(true);
  }, [
    setRightSidebarOpen,
    setRightSidebarContent,
    setHeaderTitle,
    setSidebarOpen,
  ]);

  // Student Sidebar Content Component
  const StudentSidebarContent = ({ students, loading, course, onClose }) => (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="h-[60.5px] px-6 flex items-center justify-between border-b"
        style={{
          borderColor: colors.accent + "30",
          backgroundColor: colors.sidebar,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-blue-50 text-blue-500">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>
              Course Students
            </h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate max-w-[150px]">
              {course?.title}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-black/5 transition-all text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader size={40} />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 -mt-2">
              Fetching students...
            </p>
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student._id}
                className="p-4 rounded border bg-white flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: colors.accent + "10" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-50 bg-slate-100 flex items-center justify-center">
                    {student.profilePicture?.url ? (
                      <img
                        src={student.profilePicture.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={24} className="opacity-20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: colors.text }}
                    >
                      {student.name}
                    </p>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-bold opacity-40 uppercase truncate">
                        {student.email}
                      </p>
                      <p className="text-[10px] font-bold opacity-40 truncate">
                        {student.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold opacity-40 uppercase">
                      Progress
                    </div>
                    <div className="text-sm font-black text-blue-600">
                      {student.progress}%
                    </div>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/users/view/${student._id}`)
                    }
                    className="flex items-center justify-center gap-2 py-2 rounded border font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    <Eye size={14} /> Profile
                  </button>
                  {student.isCertificateIssued ? (
                    <a
                      href={student.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 rounded border font-bold text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 transition-all"
                    >
                      <CheckCircle size={14} /> Certificate
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 py-2 rounded border font-bold text-[10px] uppercase tracking-widest opacity-30 cursor-not-allowed"
                    >
                      <RotateCcw size={14} /> Pending
                    </button>
                  )}
                  <button
                    onClick={() => handleResetProgress(student, course)}
                    className="flex items-center justify-center gap-2 py-2 rounded border font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all col-span-2"
                  >
                    <RotateCcw size={14} /> Reset Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
            <Users size={64} className="mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">
              No students enrolled
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Analytics Sidebar Content Component
  const AnalyticsSidebarContent = ({ data, loading, course, onClose }) => {
    const enrollmentChartOptions = {
      chart: {
        type: "area",
        backgroundColor: "transparent",
        height: 200,
        style: { fontFamily: "Outfit" },
      },
      title: { text: null },
      xAxis: {
        categories: data?.enrollmentTrend?.map((t) => t._id) || [],
        labels: { style: { fontSize: "9px", fontWeight: "bold" } },
      },
      yAxis: { title: { text: null }, gridLineColor: colors.accent + "10" },
      series: [
        {
          name: "Enrollments",
          data: data?.enrollmentTrend?.map((t) => t.count) || [],
          color: colors.primary,
        },
      ],
      legend: { enabled: false },
      credits: { enabled: false },
      tooltip: {
        borderRadius: 10,
        shadow: false,
        backgroundColor: "#1e293b",
        style: { color: "#fff", fontSize: "10px" },
      },
    };

    const progressChartOptions = {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        height: 200,
        style: { fontFamily: "Outfit" },
      },
      title: { text: null },
      plotOptions: {
        pie: {
          innerSize: "60%",
          dataLabels: { enabled: false },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Students",
          data: data?.distribution
            ? Object.entries(data.distribution).map(([label, val]) => ({
                name: label,
                y: val,
              }))
            : [],
        },
      ],
      colors: [colors.primary, "#8b5cf6", "#10b981", "#f59e0b"],
      legend: { itemStyle: { fontSize: "10px", fontWeight: "bold" } },
      credits: { enabled: false },
    };

    return (
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div
          className="h-[60.5px] px-6 flex items-center justify-between border-b"
          style={{
            borderColor: colors.accent + "30",
            backgroundColor: colors.sidebar,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-indigo-50 text-indigo-500">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                Course Analytics
              </h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate max-w-[150px]">
                {course?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-all text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/30">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader size={40} />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 -mt-2">
                Analyzing data...
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-10">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Enrolled",
                    value: data.summary.totalEnrolled,
                    icon: Users,
                    color: colors.primary,
                  },
                  {
                    label: "Revenue",
                    value: `₹${data.summary.totalRevenue}`,
                    icon: DollarSign,
                    color: "#10b981",
                  },
                  {
                    label: "Completion",
                    value: data.summary.avgCompletion,
                    icon: CheckCircle,
                    color: "#f59e0b",
                  },
                  {
                    label: "Watch Time",
                    value: data.summary.avgWatchTime,
                    icon: Clock,
                    color: "#8b5cf6",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="p-4 rounded border bg-white shadow-sm flex flex-col gap-2"
                    style={{ borderColor: colors.accent + "05" }}
                  >
                    <div
                      className="p-2 w-fit rounded"
                      style={{
                        backgroundColor: s.color + "10",
                        color: s.color,
                      }}
                    >
                      <s.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        {s.label}
                      </p>
                      <p
                        className="font-black text-sm"
                        style={{ color: colors.text }}
                      >
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enrollment Trend Chart */}
              <div
                className="p-5 rounded border bg-white shadow-sm"
                style={{ borderColor: colors.accent + "05" }}
              >
                <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4">
                  Enrollment Trend
                </h4>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={enrollmentChartOptions}
                />
              </div>

              {/* Progress Distribution Chart */}
              <div
                className="p-5 rounded border bg-white shadow-sm"
                style={{ borderColor: colors.accent + "05" }}
              >
                <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4">
                  Progress Distribution
                </h4>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={progressChartOptions}
                />
              </div>

              {/* Top Students */}
              <div
                className="p-5 rounded border bg-white shadow-sm"
                style={{ borderColor: colors.accent + "05" }}
              >
                <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4">
                  Top Performing Students
                </h4>
                <div className="space-y-4">
                  {data.topStudents.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                        {s.profilePicture?.url ? (
                          <img
                            src={s.profilePicture.url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon size={14} className="m-2 opacity-20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate">
                          {s.name}
                        </p>
                        <div className="h-1 w-full bg-slate-50 rounded-full mt-1">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600">
                        {s.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleResetProgress = (student, course) => {
    Swal.fire({
      title: "Reset Progress?",
      text: `This will clear all lecture progress for ${student.name} in this course.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, reset it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await resetCourseProgress(student._id, course._id);
          if (res.success) {
            toast.success("Progress reset successfully");
            fetchStudentsForCourse(course); // Refresh sidebar
          }
        } catch (error) {
          toast.error("Failed to reset progress");
        }
      }
    });
  };

  const fetchStudentsForCourse = async (course) => {
    setRightSidebarOpen(true);
    setSidebarOpen(false);
    setHeaderTitle("Course Enrollments");
    setRightSidebarContent(
      <StudentSidebarContent
        students={[]}
        loading={true}
        course={course}
        onClose={closeRightSidebar}
      />,
    );

    try {
      const res = await getCourseStudents(course._id);
      if (res.success) {
        setRightSidebarContent(
          <StudentSidebarContent
            students={res.data}
            loading={false}
            course={course}
            onClose={closeRightSidebar}
          />,
        );
      }
    } catch (error) {
      toast.error("Failed to fetch students");
      closeRightSidebar();
    }
  };

  const fetchCourseAnalytics = async (course) => {
    setRightSidebarOpen(true);
    setSidebarOpen(false);
    setHeaderTitle("Course Deep-Dive");
    setRightSidebarContent(
      <AnalyticsSidebarContent
        data={null}
        loading={true}
        course={course}
        onClose={closeRightSidebar}
      />,
    );

    try {
      const res = await getCourseAnalytics(course._id);
      if (res.success) {
        setRightSidebarContent(
          <AnalyticsSidebarContent
            data={res.data}
            loading={false}
            course={course}
            onClose={closeRightSidebar}
          />,
        );
      }
    } catch (error) {
      toast.error("Failed to load analytics");
      closeRightSidebar();
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader size={128} />
      </div>
    );

  return (
    <div
      className="p-6 min-h-screen"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: colors.text }}
          >
            Course Enrollments
          </h1>
          <p
            className="text-xs font-bold opacity-50 uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            LMS Control Panel & Student Management
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-white border border-slate-200 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            <FileDown size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Students",
            value: stats?.totalEnrolledStudents || 0,
            icon: Users,
            color: colors.primary,
          },
          {
            label: "Courses Sold",
            value: stats?.totalCoursesSold || 0,
            icon: BookOpen,
            color: "#8b5cf6",
          },
          {
            label: "Most Popular",
            value: stats?.mostPopularCourse || "N/A",
            icon: TrendingUp,
            color: "#10b981",
            isText: true,
          },
          {
            label: "Avg Completion",
            value: stats?.avgCompletion || "0%",
            icon: CheckCircle,
            color: "#f59e0b",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="p-5 rounded border bg-white shadow-sm flex items-center gap-4 relative overflow-hidden group"
            style={{ borderColor: colors.accent + "10" }}
          >
            <div
              className="p-3 rounded"
              style={{ backgroundColor: card.color + "15", color: card.color }}
            >
              <card.icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                {card.label}
              </p>
              <h2
                className={`font-black truncate ${card.isText ? "text-sm mt-1" : "text-2xl"}`}
                style={{ color: colors.text }}
              >
                {card.value}
              </h2>
            </div>
            <div
              className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-500"
              style={{ color: card.color }}
            >
              <card.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px] relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded border text-sm transition-all focus:ring-2"
              style={{
                backgroundColor: colors.sidebar,
                borderColor: colors.accent + "20",
                color: colors.text,
                "--tw-ring-color": colors.primary + "40",
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded border text-sm font-bold transition-all ${showFilters ? "ring-2" : ""}`}
            style={{
              backgroundColor: colors.sidebar,
              borderColor: colors.accent + "20",
              color: colors.text,
              "--tw-ring-color": colors.primary + "40",
            }}
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative z-[100]"
            >
              <div
                className="p-6 rounded border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
                style={{
                  backgroundColor: colors.sidebar,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest opacity-50"
                    style={{ color: colors.textSecondary }}
                  >
                    Category
                  </label>
                  <ModernSelect
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                    options={[
                      { value: "all", label: "All Categories" },
                      ...categories.map((c) => ({
                        value: c._id,
                        label: c.name,
                      })),
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest opacity-50"
                    style={{ color: colors.textSecondary }}
                  >
                    Type
                  </label>
                  <ModernSelect
                    value={priceType}
                    onChange={(val) => setPriceType(val)}
                    options={[
                      { value: "all", label: "All Types" },
                      { value: "free", label: "Free Courses" },
                      { value: "paid", label: "Paid Courses" },
                    ]}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryId("all");
                      setPriceType("all");
                    }}
                    className="w-full py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 cursor-pointer"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.textSecondary,
                    }}
                  >
                    <RotateCw size={14} className="inline mr-2" /> Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Table Content */}
      <div
        className="rounded border shadow-xl shadow-black/2 overflow-hidden"
        style={{
          backgroundColor: colors.sidebar,
          borderColor: colors.accent + "15",
        }}
      >
        <div className="overflow-x-auto relative">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader size={48} />
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: colors.accent + "10",
                  backgroundColor: colors.accent + "05",
                }}
              >
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                  Course Details
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                  Category
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                  Price
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                  Enrolled
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                  Revenue
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                  Avg Progress
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ divideColor: colors.accent + "05" }}
            >
              {courses.map((course) => (
                <tr
                  key={course._id}
                  className="group hover:bg-black/1 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                        {course.thumbnail?.url ? (
                          <img
                            src={course.thumbnail.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FileText size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-sm"
                          style={{ color: colors.text }}
                        >
                          {course.title}
                        </span>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                          ID: {course._id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 rounded bg-blue-100/50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                      {course.category?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className="font-bold text-sm"
                      style={{ color: colors.text }}
                    >
                      ₹{course.price}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => fetchStudentsForCourse(course)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded font-bold text-[10px] uppercase tracking-wider transition-all ${course.enrolledStudents > 0 ? "bg-indigo-50 text-indigo-600 hover:scale-105 active:scale-95 shadow-sm" : "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"}`}
                    >
                      <Users size={14} />
                      {course.enrolledStudents} Students
                      {course.enrolledStudents > 0 && (
                        <ArrowUpRight
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-emerald-600">
                    ₹{course.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                      <span
                        className="text-[10px] font-black"
                        style={{ color: colors.text }}
                      >
                        {course.avgCompletion}
                      </span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                          style={{ width: course.avgCompletion }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${course.isActive ? "text-green-500" : "text-red-500"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${course.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                        />
                        {course.isActive ? "Active" : "Private"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => fetchCourseAnalytics(course)}
                        className="p-2 rounded hover:bg-slate-100 text-slate-400 transition-all"
                      >
                        <BarChart3 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/courses/view/${course._id}`)
                        }
                        className="p-2 rounded hover:bg-slate-100 text-slate-400 transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && !tableLoading && (
            <div className="p-20 text-center opacity-20 flex flex-col items-center gap-2">
              <FileText size={48} />
              <p className="font-black uppercase tracking-widest">
                No courses found matching criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollments;
