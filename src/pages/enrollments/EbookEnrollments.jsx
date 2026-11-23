import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Eye,
  FileDown,
  X,
  User as UserIcon,
  Filter,
  BookOpen,
  DollarSign,
  RotateCw,
  Calendar,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getEbookEnrollmentStats,
  getAllEbookEnrollments,
  getEbookStudents,
} from "../../apis/ebookEnrollment";
import { getEbookCategories } from "../../apis/ebookCategory";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";
import { motion, AnimatePresence } from "framer-motion";

const EbookEnrollments = () => {
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
  const [ebooks, setEbooks] = useState([]);
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
        getEbookEnrollmentStats(),
        getEbookCategories({ limit: 100 }),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (catRes.success) setCategories(catRes.data);

      await fetchEbooks();
    } catch (error) {
      toast.error("Failed to fetch initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEbooks = async () => {
    setTableLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        priceType: priceType === "all" ? undefined : priceType,
      };
      const res = await getAllEbookEnrollments(params);
      if (res.success) {
        setEbooks(res.data);
      }
    } catch (error) {
      toast.error("Failed to load ebooks");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEbooks();
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
  const StudentSidebarContent = ({ students, loading, ebook, onClose }) => (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="h-[60.5px] px-6 flex items-center justify-between border-b shrink-0"
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
              E-Book Students
            </h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate max-w-[150px]">
              {ebook?.title}
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
                className="p-4 rounded border bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
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
                    <p className="text-[10px] font-bold opacity-40 uppercase truncate">
                      {student.email}
                    </p>
                    <p className="text-[10px] font-bold opacity-40 truncate">
                      {student.mobile}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold opacity-60">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </div>
                  <div className="text-emerald-600">₹{student.pricePaid}</div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/dashboard/users/view/${student._id}`)
                  }
                  className="w-full flex items-center justify-center gap-2 py-2 rounded border font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  <Eye size={14} /> View Profile
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
            <Users size={64} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">
              No students enrolled
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const fetchStudentsForEbook = async (ebook) => {
    setRightSidebarOpen(true);
    setSidebarOpen(false);
    setHeaderTitle("E-Book Enrollments");
    setRightSidebarContent(
      <StudentSidebarContent
        students={[]}
        loading={true}
        ebook={ebook}
        onClose={closeRightSidebar}
      />,
    );

    try {
      const res = await getEbookStudents(ebook._id);
      if (res.success) {
        setRightSidebarContent(
          <StudentSidebarContent
            students={res.data}
            loading={false}
            ebook={ebook}
            onClose={closeRightSidebar}
          />,
        );
      }
    } catch (error) {
      toast.error("Failed to fetch students");
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
            E-Book Enrollments
          </h1>
          <p
            className="text-xs font-bold opacity-50 uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            Manage E-Book Sales & Access
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
            label: "E-Books Sold",
            value: stats?.totalEbooksSold || 0,
            icon: BookOpen,
            color: "#8b5cf6",
          },
          {
            label: "Most Popular",
            value: stats?.mostPopularEbook || "N/A",
            icon: Calendar,
            color: "#10b981",
            isText: true,
          },
          {
            label: "Total Revenue",
            value: `₹${stats?.totalRevenue || 0}`,
            icon: DollarSign,
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
              placeholder="Search e-books..."
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
              className="relative z-50"
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
                      { value: "free", label: "Free" },
                      { value: "paid", label: "Paid" },
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
                  E-Book Details
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
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ divideColor: colors.accent + "05" }}
            >
              {ebooks.length > 0 ? (
                ebooks.map((ebook, idx) => (
                  <tr
                    key={ebook._id}
                    className="group hover:bg-black/1 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded overflow-hidden bg-slate-100 border p-1 shadow-sm">
                          <img
                            src={ebook.image?.url}
                            alt=""
                            className="w-full h-full object-cover rounded-sm"
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold truncate max-w-[200px]"
                            style={{ color: colors.text }}
                          >
                            {ebook.title}
                          </p>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                            ID: {ebook._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-1 rounded bg-slate-100 font-bold opacity-60 uppercase tracking-widest">
                        {ebook.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-black"
                          style={{ color: colors.text }}
                        >
                          ₹{ebook.price}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase tracking-tighter ${ebook.priceType === "free" ? "text-blue-500" : "text-amber-500"}`}
                        >
                          {ebook.priceType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="opacity-30" />
                        <span
                          className="text-sm font-bold"
                          style={{ color: colors.text }}
                        >
                          {ebook.enrolledStudents}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-black"
                      style={{ color: colors.primary }}
                    >
                      ₹{ebook.revenue}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => fetchStudentsForEbook(ebook)}
                          className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                          title="View Students"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center opacity-30">
                    <BookOpen size={48} className="mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">
                      No e-books found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EbookEnrollments;
