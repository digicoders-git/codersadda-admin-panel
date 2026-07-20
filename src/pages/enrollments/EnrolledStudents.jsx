import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Users,
  FileText,
  BookOpen,
  Briefcase,
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  ArrowUpDown,
  User as UserIcon,
  Phone,
  Mail,
  History,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSubscriptionEnrollments,
  getSubscriptionStats,
  extendSubscription,
  cancelSubscription,
  getSubscriptions,
} from "../../apis/subscription";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

function EnrolledStudents() {
  const { colors } = useTheme();
  const { service } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Detail Modal/Drawer
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const currentService =
    service ||
    (location.pathname.includes("/courses/")
      ? "courses"
      : location.pathname.includes("/ebooks/")
        ? "ebooks"
        : location.pathname.includes("/jobs/")
          ? "jobs"
          : location.pathname.includes("/subscriptions/")
            ? "subscriptions"
            : "courses");

  useEffect(() => {
    fetchStats();
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [page, statusFilter, planFilter, paymentFilter, currentService]);

  const fetchStats = async () => {
    try {
      const res = await getSubscriptionStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await getSubscriptions({ limit: 100 });
      if (res.success) setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
        planId: planFilter === "all" ? undefined : planFilter,
        paymentType: paymentFilter === "all" ? undefined : paymentFilter,
      };
      const res = await getSubscriptionEnrollments(params);
      if (res.success) {
        setEnrollments(res.data);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      toast.error("Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEnrollments();
  };

  const handleExtend = async (student) => {
    const { value: months } = await Swal.fire({
      title: "Extend Subscription",
      input: "select",
      inputOptions: {
        1: "1 Month",
        3: "3 Months",
        6: "6 Months",
        12: "12 Months",
      },
      inputPlaceholder: "Select extension period",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
    });

    if (months) {
      try {
        const res = await extendSubscription({
          userId: student._id,
          enrollmentId: student.enrollmentId,
          months,
        });
        if (res.success) {
          toast.success(res.message);
          fetchEnrollments();
        }
      } catch (err) {
        toast.error("Failed to extend subscription");
      }
    }
  };

  const handleCancel = (student) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the user's access to this subscription!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: colors.primary,
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await cancelSubscription({
            userId: student._id,
            enrollmentId: student.enrollmentId,
          });
          if (res.success) {
            toast.success("Subscription cancelled");
            fetchEnrollments();
          }
        } catch (err) {
          toast.error("Failed to cancel subscription");
        }
      }
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Plan",
      "Duration",
      "Price Paid",
      "Start Date",
      "End Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...enrollments.map((e) =>
        [
          e.name,
          e.email,
          e.mobile,
          e.planType,
          e.duration,
          e.pricePaid,
          new Date(e.startDate).toLocaleDateString(),
          new Date(e.endDate).toLocaleDateString(),
          e.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `enrollments_${new Date().toISOString()}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors = {
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle2 size={12} />,
    },
    expired: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <XCircle size={12} />,
    },
    cancelled: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: <XCircle size={12} />,
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: <AlertCircle size={12} />,
    },
  };

  const getStatusBadge = (student) => {
    let type = student.status?.toLowerCase() || "unknown";
    if (type === "active" && student.remainingDays <= 7) type = "warning";

    const config = statusColors[type] || {
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: <AlertCircle size={12} />,
    };

    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}
      >
        {config.icon}
        {type === "warning" ? "Expiring Soon" : type}
      </div>
    );
  };

  const getServiceIcon = () => {
    switch (currentService) {
      case "courses":
        return <FileText size={24} />;
      case "ebooks":
        return <BookOpen size={24} />;
      case "jobs":
        return <Briefcase size={24} />;
      case "subscriptions":
        return <CreditCard size={24} />;
      default:
        return <Users size={24} />;
    }
  };
  

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto scrollbar-hide">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
          onClick={()=>navigate(-1)}
            className="p-3 cursor-pointer rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.primary + "15",
              color: colors.primary,
            }}
          >
            {/* {getServiceIcon()} */}
            
              <ArrowLeft />
            
          </div>
          <div>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: colors.text }}
            >
              {currentService.charAt(0).toUpperCase() + currentService.slice(1)}{" "}
              Students
            </h1>
            <p
              className="text-xs font-bold opacity-50 uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Manage Enrollments & Access
            </p>
          </div>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-lg shadow-black/5"
          style={{ backgroundColor: colors.text, color: colors.background }}
        >
          <Download size={18} />
          Export to CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Students",
            value: stats?.totalEnrolled || 0,
            // icon: <Users size={20} />,
            color: colors.primary,
          },
          {
            label: "Active Plans",
            value: stats?.activeCount || 0,
            // icon: <CheckCircle2 size={20} />,
            color: "#22c55e",
          },
          {
            label: "Expired Plans",
            value: stats?.expiredCount || 0,
            // icon: <XCircle size={20} />,
            color: "#ef4444",
          },
          {
            label: "Total Revenue",
            value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
            // icon: <TrendingUp size={20} />,
            color: "#8b5cf6",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-5 rounded border shadow-sm flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundColor: colors.sidebar,
              borderColor: colors.accent + "15",
            }}
          >
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1"
                style={{ color: colors.textSecondary }}
              >
                {item.label}
              </p>
              <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                {item.value}
              </h3>
            </div>
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10"
              style={{ color: item.color }}
            >
              {/* {React.cloneElement(item.icon, { size: 48 })} */}
            </div>
            {i === 3 && stats?.topPlan && (
              <div
                className="mt-3 text-[10px] font-bold opacity-60 flex items-center gap-1"
                style={{ color: colors.textSecondary }}
              >
                <span>Top Plan:</span>
                <span style={{ color: colors.primary }}>{stats.topPlan}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form
            onSubmit={handleSearch}
            className="flex-1 min-w-[300px] relative group"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity"
              size={18}
              style={{ color: colors.text }}
            />
            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded border text-sm transition-all focus:ring-1 outline-none"
              style={{
                backgroundColor: colors.sidebar,
                borderColor: colors.accent + "20",
                color: colors.text,
                "--tw-ring-color": colors.primary + "40",
              }}
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-3 rounded border text-sm font-bold transition-all ${showFilters ? "ring-1" : ""}`}
              style={{
                backgroundColor: colors.sidebar,
                borderColor: colors.accent + "20",
                color: colors.text,
                "--tw-ring-color": colors.primary + "40",
              }}
            >
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-6 rounded border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
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
                    Plan Status
                  </label>
                  <select
                    className="w-full p-2.5 rounded border text-sm bg-transparent outline-none cursor-pointer"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <option
                      value="all"
                      className="bg-white text-black dark:bg-slate-800 dark:text-white"
                    >
                      All Status
                    </option>
                    <option
                      value="active"
                      className="bg-white text-black dark:bg-slate-800 dark:text-white"
                    >
                      Active
                    </option>
                    <option
                      value="expired"
                      className="bg-white text-black dark:bg-slate-800 dark:text-white"
                    >
                      Expired
                    </option>
                    <option
                      value="cancelled"
                      className="bg-white text-black dark:bg-slate-800 dark:text-white"
                    >
                      Cancelled
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest opacity-50"
                    style={{ color: colors.textSecondary }}
                  >
                    Specific Plan
                  </label>
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-sm bg-transparent"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <option value="all">All Plans</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.planType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest opacity-50"
                    style={{ color: colors.textSecondary }}
                  >
                    Price Mode
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-sm bg-transparent"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <option value="all">All Modes</option>
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPlanFilter("all");
                      setPaymentFilter("all");
                      setPage(1);
                    }}
                    className="w-full cursor-pointer py-2.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all hover:text-red-500"
                    style={{
                      borderColor: colors.accent + "20",
                      color: colors.textSecondary,
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Table */}
      <div
        className="rounded border shadow-sm overflow-hidden"
        style={{
          backgroundColor: colors.sidebar,
          borderColor: colors.accent + "15",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: colors.accent + "10",
                  backgroundColor: colors.accent + "05",
                }}
              >
                <th
                  className="px-6 py-5 text-[10px] uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Student
                </th>
                <th
                  className="px-6 py-5 text-[10px] uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Plan Info
                </th>
                <th
                  className="px-6 py-5 text-[10px] uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Validity Period
                </th>
                <th
                  className="px-6 py-5 text-[10px] uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Revenue
                </th>
                <th
                  className="px-6 py-5 text-[10px] uppercase tracking-widest opacity-60"
                  style={{ color: colors.text }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-5 text-[10px] uppercase tracking-widest opacity-60 text-center"
                  style={{ color: colors.text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ divideColor: colors.accent + "05" }}
            >
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                        style={{
                          borderColor: colors.primary + "40",
                          borderTopColor: colors.primary,
                        }}
                      />
                      <p
                        className="text-xs font-bold opacity-40 uppercase tracking-widest"
                        style={{ color: colors.text }}
                      >
                        Loading enrollments...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : enrollments.length > 0 ? (
                enrollments.map((student, idx) => (
                  <motion.tr
                    key={student.enrollmentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-black/1 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden shrink-0">
                          {student.profilePicture?.url ? (
                            <img
                              src={student.profilePicture.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon size={20} className="opacity-20" />
                          )}
                        </div>
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: colors.text }}
                          >
                            {student.name}
                          </p>
                          <p
                            className="text-[10px] opacity-50 font-medium"
                            style={{ color: colors.textSecondary }}
                          >
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p
                          className="text-sm font-bold"
                          style={{ color: colors.text }}
                        >
                          {student.planType}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-bold opacity-60 uppercase tracking-tighter">
                            {student.duration}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${student.pricingType === "free" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                          >
                            {student.pricingType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold">
                      <div className="flex flex-col gap-0.5">
                        <span className="opacity-40 uppercase text-[9px]" style={{color: colors.text}}>
                          Valid From
                        </span>
                        <span style={{ color: colors.text }}>
                          {new Date(student.startDate).toLocaleDateString()} —{" "}
                          {new Date(student.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className="text-sm font-black"
                        style={{
                          color:
                            student.pricingType === "free"
                              ? colors.textSecondary
                              : colors.primary,
                        }}
                      >
                        {student.pricingType === "free"
                          ? "—"
                          : `₹${student.pricePaid}`}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        {getStatusBadge(student)}
                        {student.status === "active" && (
                          <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter pl-1">
                            {student.remainingDays} days left
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDrawer(true);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <div className="w-px h-4 bg-slate-100" />
                        <button
                          onClick={() => handleExtend(student)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-all active:scale-90"
                          title="Extend Validity"
                        >
                          <Calendar size={18} />
                        </button>
                        <button
                          onClick={() => handleCancel(student)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-all active:scale-90"
                          title="Cancel Enrollment"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Users size={48} />
                      <p className="font-bold">
                        No enrollments found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            borderColor: colors.accent + "10",
            backgroundColor: colors.accent + "03",
          }}
        >
          <p
            className="text-xs font-bold opacity-40 uppercase tracking-widest"
            style={{ color: colors.text }}
          >
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              style={{ borderColor: colors.accent + "15" }}
            >
              <ChevronLeft size={18} style={{ color: colors.text }} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              style={{ borderColor: colors.accent + "15" }}
            >
              <ChevronRight size={18} style={{ color: colors.text }} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {showDrawer && selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-full max-w-md shadow-2xl z-[101] overflow-hidden flex flex-col pt-4"
              style={{ backgroundColor: colors.sidebar }}
            >
              <div className="flex items-center justify-between px-6 mb-8 mt-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: colors.primary + "15",
                      color: colors.primary,
                    }}
                  >
                    <UserIcon size={20} />
                  </div>
                  <p
                    className="text-lg font-black"
                    style={{ color: colors.text }}
                  >
                    Enrolment Details
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-full hover:bg-black/5 transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-10 scrollbar-hide">
                {/* User Profile Info */}
                <div
                  className="flex flex-col items-center text-center p-6 rounded-3xl border border-dashed"
                  style={{ borderColor: colors.accent + "20" }}
                >
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-slate-100 mb-4 overflow-hidden">
                    {selectedStudent.profilePicture?.url ? (
                      <img
                        src={selectedStudent.profilePicture.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={48} className="m-auto mt-6 opacity-20" />
                    )}
                  </div>
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ color: colors.text }}
                  >
                    {selectedStudent.name}
                  </h3>
                  <p
                    className="text-xs font-bold opacity-40 uppercase tracking-widest mb-6"
                    style={{ color: colors.textSecondary }}
                  >
                    Student ID: {selectedStudent._id.slice(-8).toUpperCase()}
                  </p>

                  <div className="grid grid-cols-1 w-full gap-3">
                    <div
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border overflow-hidden"
                      style={{ borderColor: colors.accent + "10" }}
                    >
                      <Phone size={14} className="opacity-40" />
                      <span
                        className="text-xs font-bold"
                        style={{ color: colors.text }}
                      >
                        {selectedStudent.mobile}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border overflow-hidden"
                      style={{ borderColor: colors.accent + "10" }}
                    >
                      <Mail size={14} className="opacity-40" />
                      <span
                        className="text-xs font-bold truncate"
                        style={{ color: colors.text }}
                      >
                        {selectedStudent.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Subscription Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 p-1">
                    <Package
                      size={14}
                      className="opacity-40"
                      style={{ color: colors.primary }}
                    />
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Plan Configuration
                    </h4>
                  </div>
                  <div
                    className="p-5 rounded-3xl border shadow-sm space-y-5"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "10",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold opacity-50">
                        Plan Name
                      </span>
                      <span
                        className="text-sm font-black"
                        style={{ color: colors.primary }}
                      >
                        {selectedStudent.planType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold opacity-50">
                        Duration
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 uppercase">
                        {selectedStudent.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold opacity-50">
                        Bill Amount
                      </span>
                      <span
                        className="text-sm font-black"
                        style={{ color: colors.text }}
                      >
                        ₹{selectedStudent.pricePaid}
                      </span>
                    </div>
                    <div
                      className="pt-4 border-t"
                      style={{ borderColor: colors.accent + "10" }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3">
                        Subscription Timeline
                      </p>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div>
                          <p className="opacity-40 uppercase text-[8px] mb-0.5">
                            Start Date
                          </p>
                          <span>
                            {new Date(selectedStudent.startDate).toDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="opacity-40 uppercase text-[8px] mb-0.5">
                            End Date
                          </p>
                          <span className="text-red-500">
                            {new Date(selectedStudent.endDate).toDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 p-1">
                    <MoreVertical
                      size={14}
                      className="opacity-40"
                      style={{ color: colors.primary }}
                    />
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Admin Actions
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleExtend(selectedStudent)}
                      className="flex flex-col items-center justify-center p-4 rounded-3xl border bg-white gap-2 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <History size={20} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        Renew/Extend
                      </span>
                    </button>
                    <button
                      onClick={() => handleCancel(selectedStudent)}
                      className="flex flex-col items-center justify-center p-4 rounded-3xl border bg-white gap-2 transition-all hover:border-red-200 hover:bg-red-50/50"
                    >
                      <XCircle size={20} className="text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                        Cancel Plan
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/users/view/${selectedStudent._id}`)
                    }
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl border-2 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                    style={{
                      borderColor: colors.primary,
                      color: colors.primary,
                    }}
                  >
                    <Eye size={16} />
                    View Full User Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EnrolledStudents;
