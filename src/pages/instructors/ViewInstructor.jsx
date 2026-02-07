import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getInstructorById } from "../../apis/instructor";
import { getAllCourses } from "../../apis/course";
import {
  ChevronLeft,
  GraduationCap,
  Mail,
  Calendar,
  Briefcase,
  BookOpen,
  IndianRupee,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function ViewInstructor() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [instRes, coursesRes] = await Promise.all([
          getInstructorById(id),
          getAllCourses(),
        ]);

        if (instRes.success) {
          setInstructor(instRes.instructor);
        } else {
          toast.error("Failed to load instructor");
        }

        if (coursesRes.success) {
          const allCourses = coursesRes.data || [];
          if (instRes.success) {
            const instName = instRes.instructor.fullName;
            setCourses(
              allCourses.filter(
                (c) => c.instructor === instName || c.instructor?._id === id,
              ),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching instructor details:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Calculate stats
  const instructorCourses = courses.map((course) => ({
    ...course,
    studentCount: course.students || 0,
    revenue: (course.students || 0) * (course.Cprice || 0),
  }));

  const totalRevenue = instructorCourses.reduce(
    (sum, course) => sum + course.revenue,
    0,
  );
  const totalStudents = instructorCourses.reduce(
    (sum, course) => sum + course.studentCount,
    0,
  );

  const stats = [
    {
      title: "Total Courses",
      value: instructorCourses.length,
      icon: BookOpen,
      color: "#3b82f6",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "#10b981",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue}`,
      icon: IndianRupee,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="p-2 w-full mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          style={{ color: colors.text }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Instructor Profile
          </h1>
          <p
            className="text-sm opacity-60"
            style={{ color: colors.textSecondary }}
          >
            Detailed view of performance and courses
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : instructor ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <div
              className="lg:col-span-1 p-6 rounded border shadow-sm flex flex-col items-center text-center"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <div
                className="w-24 h-24 rounded bg-primary/10 text-primary flex items-center justify-center mb-4"
                style={{
                  backgroundColor: colors.primary + "10",
                  color: colors.primary,
                }}
              >
                <GraduationCap size={48} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                {instructor.fullName}
              </h2>
              <p
                className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4"
                style={{ color: colors.text }}
              >
                {instructor.role}
              </p>

              <div
                className="w-full space-y-3 pt-6 border-t"
                style={{ borderColor: colors.accent + "10" }}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="opacity-40" />
                  <span
                    className="font-medium opacity-70"
                    style={{ color: colors.text }}
                  >
                    {instructor.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="opacity-40" />
                  <span
                    className="font-medium opacity-70"
                    style={{ color: colors.text }}
                  >
                    Joined{" "}
                    {instructor.createdAt
                      ? new Date(instructor.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase size={16} className="opacity-40" />
                  <span
                    className="font-medium opacity-70"
                    style={{ color: colors.text }}
                  >
                    Status:
                    <span
                      className={`ml-1 font-bold ${instructor.isActive ? "text-green-500" : "text-red-500"}`}
                    >
                      {instructor.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-6 rounded border shadow-sm flex flex-col justify-between"
                  style={{
                    backgroundColor: colors.sidebar || colors.background,
                    borderColor: colors.accent + "10",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: stat.color + "15",
                      color: stat.color,
                    }}
                  >
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1"
                      style={{ color: colors.text }}
                    >
                      {stat.title}
                    </p>
                    <h3
                      className="text-2xl font-black"
                      style={{ color: colors.text }}
                    >
                      {stat.value}
                    </h3>
                  </div>
                </div>
              ))}

              <div
                className="sm:col-span-3 p-6 rounded border shadow-sm flex items-center gap-4 bg-primary/5"
                style={{ borderColor: colors.primary + "20" }}
              >
                <div className="p-3 rounded-full bg-primary text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: colors.text }}
                  >
                    Performance Insight
                  </p>
                  <p
                    className="text-xs opacity-60"
                    style={{ color: colors.text }}
                  >
                    Instructor is performing better than 85% of other
                    contributors this month.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <BookOpen size={20} className="text-primary" /> Created Courses
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {instructorCourses.length > 0 ? (
                instructorCourses.map((course) => (
                  <div
                    key={course._id}
                    className="p-4 rounded border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "10",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded overflow-hidden shrink-0 border"
                        style={{ borderColor: colors.accent + "20" }}
                      >
                        <img
                          src={
                            course.thumbnail?.url ||
                            course.thumbnail ||
                            course.image
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4
                          className="font-bold"
                          style={{ color: colors.text }}
                        >
                          {course.title}
                        </h4>
                        <p className="text-xs opacity-50 font-medium">
                          {typeof course.category === "object"
                            ? course.category.name
                            : course.category}{" "}
                          • {course.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 md:gap-12">
                      <div className="text-center md:text-left">
                        <p
                          className="text-[10px] font-bold uppercase tracking-tighter opacity-40"
                          style={{ color: colors.text }}
                        >
                          Students
                        </p>
                        <p
                          className="font-black"
                          style={{ color: colors.text }}
                        >
                          {course.studentCount}
                        </p>
                      </div>
                      <div className="text-center md:text-left">
                        <p
                          className="text-[10px] font-bold uppercase tracking-tighter opacity-40"
                          style={{ color: colors.text }}
                        >
                          Price
                        </p>
                        <p
                          className="font-black"
                          style={{ color: colors.text }}
                        >
                          ₹{course.price || course.Cprice || 0}
                        </p>
                      </div>
                      <div className="text-center md:text-right min-w-[100px]">
                        <p
                          className="text-[10px] font-bold uppercase tracking-tighter opacity-40"
                          style={{ color: colors.text }}
                        >
                          Revenue
                        </p>
                        <p
                          className="font-black text-primary text-lg"
                          style={{ color: colors.primary }}
                        >
                          ₹{course.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-12 text-center rounded border border-dashed opacity-40"
                  style={{ borderColor: colors.accent + "30" }}
                >
                  <BookOpen size={48} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs">
                    No courses created yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="p-20 text-center opacity-40">
          <GraduationCap size={48} className="mx-auto mb-4" />
          <p className="font-bold">Instructor not found</p>
        </div>
      )}
    </div>
  );
}

export default ViewInstructor;
