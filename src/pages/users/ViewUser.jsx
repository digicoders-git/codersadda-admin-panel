import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Trophy,
  BookOpen,
  CreditCard,
  Wallet,
  CheckCircle2,
  XCircle,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  School,
  Layers,
  Code2,
  Award,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  UsersIcon,
  Gift,
  Briefcase,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import Loader from "../../components/Loader";
import { useTheme } from "../../context/ThemeContext";
import {
  getUsers,
  getUserById as apiGetUserById,
  updateUser as apiUpdateUser,
  getUserTransactions,
} from "../../apis/user";
import { getAllCourses } from "../../apis/course";
import { getSubscriptions } from "../../apis/subscription";
import { getUserCertificatesByUserId } from "../../apis/certificate";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ViewUser() {
  const { colors } = useTheme();
  // const { users, subscriptions, courses } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [certTab, setCertTab] = useState("course");
  const [purchaseTab, setPurchaseTab] = useState("courses");
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [subSubscriptionTab, setSubSubscriptionTab] = useState("active");
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [courseCertificates, setCourseCertificates] = useState([]);
  const [quizCertificates, setQuizCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, coursesRes, subsRes, certRes] = await Promise.all([
        apiGetUserById(id),
        getAllCourses(),
        getSubscriptions(),
        getUserCertificatesByUserId(id),
      ]);

      if (userRes.success) {
        setUser(userRes.data);
        if (userRes.data.quizCertificates) {
          setQuizCertificates(userRes.data.quizCertificates);
        }
      } else {
        toast.error("User not found");
        navigate("/dashboard/users");
      }

      if (coursesRes.success) setCourses(coursesRes.data);
      if (subsRes.success) setSubscriptions(subsRes.data);

      if (certRes.success) {
        setCourseCertificates(certRes.certificates);
      }
    } catch (error) {
      toast.error("Failed to fetch initial data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === "wallet") {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      setTxnLoading(true);
      const res = await getUserTransactions(id);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setTxnLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Details", icon: User },
    { id: "achievements", label: "Certificates", icon: Trophy },
    { id: "purchases", label: "Purchases", icon: BookOpen },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  };
  const valueStyle = {
    color: colors.text,
    fontSize: "15px",
    fontWeight: "600",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard/users")}
          className="p-2 rounded transition-all cursor-pointer border"
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
            User Profile
          </h1>
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            Manage Student Identity
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : user ? (
        <>
          {/* User Summary Card */}
          <div
            className="p-6 rounded border shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div
              className="w-24 h-24 rounded-full border-4 shadow-md overflow-hidden shrink-0"
              style={{ borderColor: colors.primary + "20" }}
            >
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: colors.text }}
              >
                {user.name}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold opacity-60 tracking-wider mb-3">
                <span
                  className="flex items-center gap-1"
                  style={{ color: colors.text }}
                >
                  <Mail size={12} /> {user.email}
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ color: colors.text }}
                >
                  <Phone size={12} /> {user.mobile}
                </span>
              </div>
              <div className="flex justify-center md:justify-start gap-3">
                {user.social?.github && (
                  <a
                    href={user.social.github}
                    target="_blank"
                    className="p-2 rounded-full transition-colors"
                    style={{
                      color: colors.textSecondary,
                      border: `1px solid ${colors.textSecondary}`,
                    }}
                  >
                    <Github size={16} /> 
                  </a>
                )}
                {user.social?.linkedin && (
                  <a
                    href={user.social.linkedin}
                    target="_blank"
                    className="p-2 rounded-full  transition-colors"
                    style={{
                      color: colors.textSecondary,
                      border: `1px solid ${colors.textSecondary}`,
                    }}
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {user.social?.portfolio && (
                  <a
                    href={user.social.portfolio}
                    target="_blank"
                    className="p-2 rounded-full transition-colors"
                    style={{
                      color: colors.textSecondary,
                      border: `1px solid ${colors.textSecondary}`,
                    }}
                  >
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <div className="p-3 rounded bg-black/5 border border-black/5 text-center">
                {/* <span
                  className="block text-xs font-bold opacity-50 uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}
                >
                  Status
                </span> */}
                <span
                  className={`text-sm font-black uppercase tracking-widest ${user.isActive === true ? "text-green-600" : "text-red-500"}`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "shadow-md scale-105"
                    : "opacity-60 hover:opacity-100 hover:bg-black/5"
                }`}
                style={{
                  backgroundColor:
                    activeTab === tab.id ? colors.primary : "transparent",
                  color: activeTab === tab.id ? colors.background : colors.text,
                  border:
                    activeTab === tab.id
                      ? "none"
                      : `1px solid ${colors.accent}20`,
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "personal" && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* About Section */}
                  <div
                    className="md:col-span-2 p-6 rounded border shadow-sm"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "20",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <User size={16} /> About
                    </h3>
                    <p
                      className="text-sm opacity-80 leading-relaxed font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      {user.about || "No bio added."}
                    </p>
                  </div>

                  {/* Student Stats */}
                  <div
                    className="p-6 rounded border shadow-sm space-y-6"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "20",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <UsersIcon size={16} /> Student Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className="p-3 rounded bg-black/5"
                          style={{ color: colors.textSecondary }}
                        >
                          <span className="block text-2xl font-black">
                            {user.studentDetails?.completedCourses || 0}
                          </span>
                          <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
                            Completed
                          </span>
                        </div>
                        <div
                          className="p-3 rounded bg-black/5"
                          style={{ color: colors.textSecondary }}
                        >
                          <span className="block text-2xl font-black">
                            {user.studentDetails?.ongoingCourses || 0}
                          </span>
                          <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
                            Ongoing
                          </span>
                        </div>
                        <div
                          className="p-3 rounded bg-black/5"
                          style={{ color: colors.textSecondary }}
                        >
                          <span className="block text-xl font-black">
                            {user.studentDetails?.learningHours || 0}h
                          </span>
                          <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
                            Learning Time
                          </span>
                        </div>
                        <div
                          className="p-3 rounded bg-black/5"
                          style={{ color: colors.textSecondary }}
                        >
                          <span className="block text-xl font-black">
                            {user.studentDetails?.progress || 0}%
                          </span>
                          <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
                            Avg Progress
                          </span>
                        </div>
                      </div>
                      <div
                        className="pt-2 border-t"
                        style={{
                          borderColor: colors.accent + "10",
                          color: colors.textSecondary,
                        }}
                      >
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                          Joined On
                        </p>
                        <p className="font-bold">
                          {new Date(
                            user.studentDetails?.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div
                    className="p-6 rounded border shadow-sm space-y-6"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "20",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2"
                      style={{ color: colors.textSecondary }}
                    >
                      <School size={16} /> Academic Info
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p style={labelStyle}>College</p>
                        <p style={valueStyle}>{user.college}</p>
                      </div>
                      <div>
                        <p style={labelStyle}>Course</p>
                        <p style={valueStyle}>{user.course}</p>
                      </div>
                      <div>
                        <p style={labelStyle}>Semester</p>
                        <p style={valueStyle}>{user.semester}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div
                    className="p-6 rounded border shadow-sm space-y-6"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "20",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <Code2 size={16} /> Skills & Tech
                    </h3>
                    <div>
                      <p style={labelStyle}>Technology Stack</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.technology?.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={labelStyle}>Skills</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.skills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Referral Stats */}
                  <div
                    className="md:col-span-2 p-6 rounded border shadow-sm space-y-6"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "20",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2"
                      style={{ color: colors.textSecondary }}
                    >
                      <UsersIcon size={16} /> Referral Stats
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* My Referral Code Field */}
                      <div className="p-4 rounded bg-linear-to-r from-blue-500 to-purple-600 text-white text-center shadow-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                          <Award size={48} />
                        </div>
                        <span className="block text-xl font-mono font-black tracking-widest relative z-10">
                          {user.referralCode || "N/A"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 relative z-10">
                          My Referral Code
                        </span>
                      </div>

                      <div
                        className="p-4 rounded bg-black/5 border border-black/5 text-center"
                        style={{ color: colors.textSecondary }}
                      >
                        <span className="block text-2xl font-black">
                          {user.referralCount || 0}
                        </span>
                        <span className="text-xs font-bold opacity-50 uppercase tracking-wider">
                          Users Referred
                        </span>
                      </div>
                      <div className="p-4 rounded bg-black/5 border border-black/5 flex flex-col items-center justify-center">
                        <span
                          className="text-xs font-bold opacity-50 uppercase tracking-wider mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          Referred By Someone?
                        </span>
                        {user.referredBy ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest mb-1">
                              <CheckCircle2 size={12} /> Yes
                            </div>
                            <span className="text-xs font-bold block">
                              {user.referredBy?.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500 font-bold bg-gray-200 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                            <XCircle size={14} /> No
                          </div>
                        )}
                      </div>
                      {user.referredBy && (
                        <div className="p-4 rounded bg-black/5 border border-black/5 text-center">
                          <span className="block text-xl font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 uppercase tracking-tighter">
                            {user.referredBy?.referralCode}
                          </span>
                          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1 block">
                            Referrer Code
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "achievements" && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Sub-tabs for Certificates */}
                  <div
                    className="flex gap-4 border-b"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <button
                      onClick={() => setCertTab("course")}
                      className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${certTab === "course" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                      style={{ color: colors.text }}
                    >
                      Course Certificates
                      {certTab === "course" && (
                        <motion.div
                          layoutId="certUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: colors.primary }}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setCertTab("quiz")}
                      className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${certTab === "quiz" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                      style={{ color: colors.text }}
                    >
                      Quiz Certificates
                      {certTab === "quiz" && (
                        <motion.div
                          layoutId="certUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: colors.primary }}
                        />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Real Course Certificates */}
                    {certTab === "course" &&
                      courseCertificates.map((cert) => (
                        <div
                          key={cert._id}
                          className="group relative rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-all hover:shadow-md cursor-pointer"
                          onClick={() => {
                            setSelectedCert(cert);
                            setShowCertModal(true);
                          }}
                        >
                          {/* Certificate Preview Image */}
                          <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-100 mb-4 border border-slate-100 relative">
                            <img
                              src={cert.certificateUrl}
                              alt={cert.course?.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white/90 p-2 rounded-full shadow-lg">
                                <Eye size={20} className="text-slate-900" />
                              </div>
                            </div>
                          </div>

                          <div className="px-1 pb-1">
                            <h3 className="font-bold text-slate-900 text-sm mb-1 truncate">
                              {cert.course?.title}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(cert.issuedAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest">
                                <Award size={12} /> Earned
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Filtered Achievements (Mock/Static) */}
                    {(user.achievements || [])
                      .filter((ach) =>
                        certTab === "course"
                          ? false // Skip static course certificates since we show real ones now
                          : ach.type === "QuizCertificate",
                      )
                      .map((ach, i) => (
                        <div
                          key={i}
                          className={`p-6 rounded border shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${ach.type?.includes("Certificate") ? "border-primary/30 ring-1 ring-primary/10" : ""}`}
                          style={{
                            backgroundColor:
                              colors.sidebar || colors.background,
                            borderColor: ach.type?.includes("Certificate")
                              ? colors.primary + "40"
                              : colors.accent + "20",
                            color: colors.text,
                          }}
                        >
                          <div
                            className="absolute top-0 right-0 p-4 group-hover:scale-110 transition-transform opacity-10"
                            style={{ color: colors.textSecondary }}
                          >
                            {ach.type?.includes("Certificate") ? (
                              <Award size={100} />
                            ) : (
                              <Trophy size={80} />
                            )}
                          </div>
                          <div className="relative z-10 flex flex-col h-full">
                            <div
                              className={`w-12 h-12 rounded flex items-center justify-center mb-4 shadow-inner ${ach.type?.includes("Certificate") ? "bg-primary/10 text-primary" : "bg-yellow-100 text-yellow-600"}`}
                            >
                              {ach.type?.includes("Certificate") ? (
                                <Award size={24} />
                              ) : (
                                <Trophy size={24} />
                              )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                              {ach.title}
                            </h3>
                            <p className="text-xs leading-relaxed opacity-70 font-medium mb-4 flex-1">
                              {ach.description}
                            </p>

                            {ach.type === "QuizCertificate" && (
                              <div
                                className="flex items-center justify-between pt-4 border-t mt-auto"
                                style={{ borderColor: colors.accent + "10" }}
                              >
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                  {ach.date}
                                </span>
                                <span className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1">
                                  Score: {ach.score}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {certTab === "course" &&
                      courseCertificates.length === 0 && (
                        <div
                          className="col-span-full text-center py-20 opacity-40 border rounded-lg border-dashed"
                          style={{ borderColor: colors.accent + "30" }}
                        >
                          <Trophy size={48} className="mx-auto mb-4" />
                          <p className="font-bold">
                            No course certificates found.
                          </p>
                        </div>
                      )}

                    {/* Quiz Certificates */}
                    {certTab === "quiz" &&
                      quizCertificates.map((cert) => (
                        <div
                          key={cert._id}
                          className="group relative rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-all hover:shadow-md cursor-pointer"
                          onClick={() => {
                            // Show modal with certificate image
                            Swal.fire({
                              imageUrl: cert.certificateUrl,
                              imageAlt: "Certificate",
                              width: 800,
                              showConfirmButton: false,
                              showCloseButton: true,
                              background: "#fff",
                            });
                          }}
                        >
                          {/* Certificate Preview Image */}
                          <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-100 mb-4 border border-slate-100 relative">
                            <img
                              src={cert.certificateUrl}
                              alt={cert.quiz?.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white/90 p-2 rounded-full shadow-lg">
                                <Eye size={20} className="text-slate-900" />
                              </div>
                            </div>
                          </div>

                          <div className="px-1 pb-1">
                            <h3 className="font-bold text-slate-900 text-sm mb-1 truncate">
                              {cert.quiz?.title || "Unknown Quiz"}
                            </h3>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(cert.issuedAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest">
                                <Award size={12} /> Certified
                              </div>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-slate-400 bg-slate-50 p-1 rounded text-center">
                              Code: {cert.certificateId}
                            </div>
                          </div>
                        </div>
                      ))}

                    {certTab === "quiz" && quizCertificates.length === 0 && (
                      <div
                        className="col-span-full text-center py-20 opacity-40 border rounded-lg border-dashed"
                        style={{ borderColor: colors.accent + "30" }}
                      >
                        <Trophy size={48} className="mx-auto mb-4" />
                        <p className="font-bold">No quiz certificates found.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "purchases" && (
                <motion.div
                  key="purchases"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Sub-tabs for Purchases */}
                  <div
                    className="flex gap-4 border-b"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    {[
                      { id: "courses", label: "Courses" },
                      { id: "ebooks", label: "E-Books" },
                      { id: "jobs", label: "Jobs" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPurchaseTab(tab.id)}
                        className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${
                          purchaseTab === tab.id
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-100"
                        }`}
                        style={{ color: colors.text }}
                      >
                        {tab.label}
                        {purchaseTab === tab.id && (
                          <motion.div
                            layoutId="purchaseUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: colors.primary }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* COURSES LIST */}
                  {purchaseTab === "courses" && (
                    <div className="space-y-4">
                      {user.purchaseCourses?.length > 0 ? (
                        user.purchaseCourses.map((course) => (
                          <div
                            key={course._id}
                            onClick={() =>
                              navigate(`/dashboard/courses/view/${course._id}`)
                            }
                            className="p-4 rounded border flex items-center gap-4 transition-all hover:shadow-md cursor-pointer hover:bg-black/5"
                            style={{
                              backgroundColor:
                                colors.sidebar || colors.background,
                              borderColor: colors.accent + "20",
                            }}
                          >
                            <div className="w-16 h-16 rounded overflow-hidden bg-black/5 shrink-0">
                              <img
                                src={course.thumbnail?.url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4
                                  className="font-bold text-sm truncate"
                                  style={{ color: colors.text }}
                                >
                                  {course.title}
                                </h4>
                                {course.badge && course.badge !== "normal" && (
                                  <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                    {course.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs opacity-60 font-bold uppercase tracking-wide mb-1">
                                {course.category?.name} •{" "}
                                {course.instructor?.fullName ||
                                  "Unknown Instructor"}
                              </p>
                              <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                                Enrolled:{" "}
                                {new Date(
                                  course.createdAt,
                                ).toLocaleDateString()}
                              </p>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${course.progressPercentage || 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600">
                                  {course.progressPercentage || 0}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className="block font-black text-base"
                                style={{ color: colors.text }}
                              >
                                {course.priceType === "free"
                                  ? "FREE"
                                  : `₹${course.price}`}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 opacity-40 text-xs font-bold uppercase tracking-widest border border-dashed rounded-lg">
                          No courses purchased
                        </div>
                      )}
                    </div>
                  )}

                  {/* EBOOKS LIST */}
                  {purchaseTab === "ebooks" && (
                    <div className="space-y-4">
                      {user.purchaseEbooks?.length > 0 ? (
                        user.purchaseEbooks.map((ebook) => (
                          <div
                            key={ebook._id}
                            onClick={() =>
                              navigate(`/dashboard/ebooks/view/${ebook._id}`)
                            }
                            className="p-4 rounded border flex items-center gap-4 transition-all hover:shadow-md cursor-pointer hover:bg-black/5"
                            style={{
                              backgroundColor:
                                colors.sidebar || colors.background,
                              borderColor: colors.accent + "20",
                            }}
                          >
                            <div className="w-12 h-16 rounded overflow-hidden bg-black/5 shrink-0">
                              <img
                                src={ebook.image?.url}
                                alt={ebook.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className="font-bold text-sm truncate mb-1"
                                style={{ color: colors.text }}
                              >
                                {ebook.title}
                              </h4>
                              <p className="text-xs opacity-60 font-bold uppercase tracking-wide mb-1">
                                By {ebook.authorName} • {ebook.category?.name}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className="block font-black text-base"
                                style={{ color: colors.text }}
                              >
                                {ebook.priceType === "free"
                                  ? "FREE"
                                  : `₹${ebook.price}`}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 opacity-40 text-xs font-bold uppercase tracking-widest border border-dashed rounded-lg">
                          No ebooks purchased
                        </div>
                      )}
                    </div>
                  )}

                  {/* JOBS LIST */}
                  {purchaseTab === "jobs" && (
                    <div className="space-y-4">
                      {user.purchaseJobs?.length > 0 ? (
                        user.purchaseJobs.map((job) => (
                          <div
                            key={job._id}
                            onClick={() =>
                              navigate(`/dashboard/jobs/view/${job._id}`)
                            }
                            className="p-4 rounded border flex items-center gap-4 transition-all hover:shadow-md cursor-pointer hover:bg-black/5"
                            style={{
                              backgroundColor:
                                colors.sidebar || colors.background,
                              borderColor: colors.accent + "20",
                            }}
                          >
                            <div className="w-12 h-12 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Briefcase size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className="font-bold text-sm truncate mb-1"
                                style={{ color: colors.text }}
                              >
                                {job.jobTitle}
                              </h4>
                              <p className="text-xs opacity-60 font-bold uppercase tracking-wide mb-1">
                                {job.companyName} • {job.location}
                              </p>
                              <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                                <span>{job.salaryPackage}</span>
                                <span>•</span>
                                <span>{job.workType}</span>
                              </div>
                            </div>
                            <div>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-1 rounded ${job.jobStatus === "Active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                              >
                                {job.jobStatus}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 opacity-40 text-xs font-bold uppercase tracking-widest border border-dashed rounded-lg">
                          No jobs applied/purchased
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "subscription" && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Give Plan Button - At Top */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: colors.text }}
                      >
                        Subscription Plans
                      </h3>
                      <p
                        className="text-xs opacity-60"
                        style={{ color: colors.textSecondary }}
                      >
                        Manage user subscription plans
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.background,
                        }}
                      >
                        <Gift size={18} /> Give Plan
                      </button>

                      {/* Dropdown Menu */}
                      {showPlanDropdown && (
                        <div
                          className="absolute top-full mt-2 right-0 w-80 rounded-lg shadow-xl border z-20"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "30",
                          }}
                        >
                          <div
                            className="p-3 border-b"
                            style={{ borderColor: colors.accent + "20" }}
                          >
                            <p
                              className="text-xs font-bold uppercase tracking-wider opacity-60"
                              style={{ color: colors.text }}
                            >
                              Select a Plan to Add
                            </p>
                          </div>
                          <div className="p-2 max-h-96 overflow-y-auto">
                            {subscriptions
                              .filter((plan) => plan.planStatus === true)
                              .map((plan) => (
                                <div
                                  key={plan._id}
                                  className="w-full text-left p-4 rounded-lg hover:bg-black/5 transition-all mb-2 border flex items-center justify-between"
                                  style={{
                                    backgroundColor: colors.accent + "10",
                                    borderColor: colors.accent + "20",
                                    color: colors.text,
                                  }}
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="font-bold text-base">
                                        {plan.planType} ({plan.duration})
                                      </div>
                                    </div>
                                    <div
                                      className="text-lg font-black"
                                      style={{ color: colors.primary }}
                                    >
                                      {plan.planPricingType === "free" ||
                                      plan.price === 0
                                        ? "FREE"
                                        : `₹${plan.price}`}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {plan.planBenefits
                                        ?.slice(0, 3)
                                        .map((benefit, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700"
                                          >
                                            {benefit}
                                          </span>
                                        ))}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      // Add new plan to user's purchaseSubscriptions
                                      const currentSubscriptions =
                                        user.purchaseSubscriptions
                                          ?.map((s) => {
                                            const subId =
                                              s.subscription?._id ||
                                              s.subscription;
                                            return subId
                                              ? subId.toString()
                                              : null;
                                          })
                                          .filter(Boolean) || [];

                                      // Prevent duplicate assignment if needed, or allow multiple
                                      if (
                                        currentSubscriptions.includes(
                                          plan._id.toString(),
                                        )
                                      ) {
                                        toast.warning(
                                          "User already has this plan!",
                                        );
                                        return;
                                      }

                                      Swal.fire({
                                        title: "Assign Plan?",
                                        text: `Are you sure you want to assign ${plan.planType} to ${user.name}?`,
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonColor: colors.primary,
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Yes, Give Plan!",
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          const updatedSubscriptions = [
                                            ...(user.purchaseSubscriptions ||
                                              []),
                                            plan._id,
                                          ];

                                          apiUpdateUser(user._id, {
                                            purchaseSubscriptions:
                                              updatedSubscriptions,
                                          })
                                            .then((res) => {
                                              if (res.success) {
                                                toast.success(
                                                  `${plan.planType} Plan assigned to ${user.name}!`,
                                                );
                                                fetchData();
                                                setShowPlanDropdown(false);
                                              }
                                            })
                                            .catch((err) => {
                                              console.error(err);
                                              toast.error(
                                                "Failed to assign plan",
                                              );
                                            });
                                        }
                                      });
                                    }}
                                    className="px-4 py-2 rounded font-bold text-xs uppercase tracking-widest text-white shadow-md active:scale-95 transition-all"
                                    style={{ backgroundColor: colors.primary }}
                                  >
                                    Give
                                  </button>
                                </div>
                              ))}

                            {subscriptions.filter(
                              (plan) => plan.planStatus === true,
                            ).length === 0 && (
                              <div
                                className="p-6 text-center text-sm opacity-60"
                                style={{ color: colors.text }}
                              >
                                No active plans available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub-tabs for Subscription (Active / Expired) */}
                  <div
                    className="flex gap-4 border-b mb-6"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    {[
                      { id: "active", label: "Active Plans" },
                      { id: "expired", label: "Expired Plans" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSubSubscriptionTab(tab.id)}
                        className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${
                          subSubscriptionTab === tab.id
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-100"
                        }`}
                        style={{ color: colors.text }}
                      >
                        {tab.label}
                        {subSubscriptionTab === tab.id && (
                          <motion.div
                            layoutId="subSubUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: colors.primary }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {user.purchaseSubscriptions &&
                  user.purchaseSubscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.purchaseSubscriptions
                        .filter((subItem) => {
                          const isExpired =
                            new Date(subItem.endDate) <= new Date();

                          // Only show if the subscription plan itself is active (status check)
                          const isPlanActive =
                            subItem.subscription?.planStatus !== false;
                          if (!isPlanActive) return false;

                          return subSubscriptionTab === "active"
                            ? !isExpired
                            : isExpired;
                        })
                        .map((subItem) => {
                          const sub = subItem.subscription;
                          if (!sub) return null;
                          const isExpired =
                            new Date(subItem.endDate) <= new Date();

                          return (
                            <div
                              key={subItem._id}
                              onClick={() =>
                                navigate(
                                  `/dashboard/subscriptions/view/${sub._id || sub}`,
                                )
                              }
                              className="p-6 rounded-lg border shadow-md relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                              style={{
                                backgroundColor:
                                  colors.sidebar || colors.background,
                                borderColor: isExpired
                                  ? "#ef444420"
                                  : colors.accent + "20",
                              }}
                            >
                              <div className="flex items-center justify-between mb-4">
                                {isExpired ? (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                    <XCircle size={14} />
                                    Expired
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Active
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {sub.price !== undefined && (
                                    <div
                                      className="text-xl font-black"
                                      style={{
                                        color: isExpired
                                          ? colors.textSecondary
                                          : colors.primary,
                                      }}
                                    >
                                      {sub.planPricingType === "free"
                                        ? "FREE"
                                        : `₹${sub.price}`}
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      Swal.fire({
                                        title: "Remove Plan?",
                                        text: `Are you sure you want to remove ${sub.planType} from ${user.name}?`,
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#ef4444",
                                        cancelButtonColor: colors.primary,
                                        confirmButtonText: "Yes, Remove it!",
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          const updatedSubscriptions =
                                            user.purchaseSubscriptions
                                              .filter(
                                                (s) => s._id !== subItem._id,
                                              )
                                              .map((s) => s._id); // We only need the IDs for the update API if it expects a list of IDs, wait...

                                          // Wait, the API might expect the whole object structure or just IDs.
                                          // Looking at my previous controller change, it handles both.
                                          // But filtering by subItem._id is safest.

                                          apiUpdateUser(user._id, {
                                            purchaseSubscriptions:
                                              user.purchaseSubscriptions.filter(
                                                (s) => s._id !== subItem._id,
                                              ),
                                          })
                                            .then((res) => {
                                              if (res.success) {
                                                toast.success(
                                                  "Plan removed successfully!",
                                                );
                                                fetchData();
                                              }
                                            })
                                            .catch(() => {
                                              toast.error(
                                                "Failed to remove plan",
                                              );
                                            });
                                        }
                                      });
                                    }}
                                    className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                    title="Remove Plan"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              <h3
                                className="text-xl font-bold mb-1"
                                style={{ color: colors.text }}
                              >
                                {sub.planType} ({sub.duration})
                              </h3>

                              <div className="flex flex-col gap-1 mb-4 opacity-70">
                                <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                  <span style={{ color: colors.textSecondary }}>
                                    Start:
                                  </span>
                                  <span>
                                    {new Date(
                                      subItem.startDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                  <span style={{ color: colors.textSecondary }}>
                                    Expires:
                                  </span>
                                  <span className="text-red-500">
                                    {new Date(
                                      subItem.endDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2 mb-4">
                                {(sub.planBenefits || []).map((benefit, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm"
                                    style={{ color: colors.textSecondary }}
                                  >
                                    <CheckCircle2
                                      size={14}
                                      className="text-green-500 shrink-0"
                                    />
                                    <span className="line-clamp-1">
                                      {benefit}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div
                                className="pt-3 border-t flex items-center justify-between"
                                style={{ borderColor: colors.accent + "20" }}
                              >
                                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider opacity-60">
                                  <div>
                                    Courses: {sub.includedCourses?.length || 0}
                                  </div>
                                  <div>
                                    E-Books: {sub.includedEbooks?.length || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div
                      className="text-center py-20 border rounded-lg border-dashed"
                      style={{
                        borderColor: colors.accent + "30",
                        backgroundColor: colors.sidebar || colors.background,
                      }}
                    >
                      <CreditCard
                        size={48}
                        className="mx-auto mb-3 opacity-30"
                        style={{ color: colors.text }}
                      />
                      <p
                        className="font-semibold opacity-60"
                        style={{ color: colors.text }}
                      >
                        No subscription plans assigned
                      </p>
                      <p
                        className="text-xs opacity-40 mt-2"
                        style={{ color: colors.textSecondary }}
                      >
                        Click "Give Plan" to assign a plan
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "wallet" && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Wallet Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                      className="p-6 rounded border shadow-sm"
                      style={{
                        borderColor: colors.accent + "20",
                        backgroundColor: colors.sidebar,
                      }}
                    >
                      <span
                        className="block text-xs font-bold opacity-70 uppercase tracking-widest mb-1"
                        style={{ color: colors.text }}
                      >
                        Total Balance
                      </span>
                      <span className="text-3xl text-green-600 font-bold">
                        ₹{user.walletBalance || 0}
                      </span>
                    </div>
                    <div
                      className="p-6 rounded border shadow-sm"
                      style={{
                        borderColor: colors.accent + "20",
                        backgroundColor: colors.sidebar,
                      }}
                    >
                      <span
                        className="block text-xs font-bold opacity-50 uppercase tracking-widest mb-1"
                        style={{ color: colors.text }}
                      >
                        Total Earnings
                      </span>
                      <span className="text-3xl font-bold text-green-600">
                        +₹{user.walletBalance || 0}
                      </span>
                    </div>
                    <div
                      className="p-6 rounded border shadow-sm"
                      style={{
                        borderColor: colors.accent + "20",
                        backgroundColor: colors.sidebar,
                      }}
                    >
                      <span
                        className="block text-xs font-bold opacity-50 uppercase tracking-widest mb-1"
                        style={{ color: colors.text }}
                      >
                        Withdrawn
                      </span>
                      <span className="text-3xl font-bold text-red-500">
                        -₹0
                      </span>
                    </div>
                  </div>

                  {/* Transactions */}
                  <div
                    className="rounded border overflow-hidden"
                    style={{
                      borderColor: colors.accent + "20",
                      backgroundColor: colors.sidebar || colors.background,
                    }}
                  >
                    <div
                      className="p-4 border-b font-bold text-sm uppercase tracking-widest opacity-60"
                      style={{
                        borderColor: colors.accent + "20",
                        color: colors.text,
                      }}
                    >
                      Transaction History
                    </div>
                    <div
                      className="divide-y"
                      style={{ divideColor: colors.accent + "10" }}
                    >
                      {txnLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center">
                          <Loader size={40} />
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">
                            Fetching transactions...
                          </p>
                        </div>
                      ) : transactions.length > 0 ? (
                        transactions.map((txn) => (
                          <div
                            key={txn._id}
                            className="p-4 flex items-center justify-between hover:bg-black/5 transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2.5 rounded-xl ${
                                  txn.itemType === "referral_reward"
                                    ? "bg-green-50 text-green-600"
                                    : txn.status === "success"
                                      ? "bg-red-50 text-red-600"
                                      : txn.status === "failed"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {txn.itemType === "referral_reward" ? (
                                  <Gift size={20} />
                                ) : txn.status === "success" ? (
                                  <ArrowUpRight size={20} />
                                ) : (
                                  <XCircle size={20} />
                                )}
                              </div>
                              <div style={{ color: colors.text }}>
                                <p className="font-bold text-sm">
                                  {txn.itemName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                                    {txn.itemType.replace("_", " ")} •{" "}
                                    {new Date(txn.createdAt).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                  {txn.razorpay?.payment?.id && (
                                    <span className="text-[9px] font-bold bg-black/5 px-1.5 py-0.5 rounded opacity-40 group-hover:opacity-100 transition-opacity">
                                      ID: {txn.razorpay.payment.id}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span
                                className={`font-black font-mono text-lg ${
                                  txn.itemType === "referral_reward"
                                    ? "text-green-600"
                                    : txn.status === "success"
                                      ? "text-red-500"
                                      : "text-gray-400"
                                }`}
                              >
                                {txn.itemType === "referral_reward"
                                  ? "+"
                                  : txn.status === "success"
                                    ? "-"
                                    : ""}
                                ₹{txn.amount}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase tracking-widest ${
                                  txn.status === "success"
                                    ? "text-green-600"
                                    : txn.status === "failed"
                                      ? "text-red-600"
                                      : "text-amber-600"
                                }`}
                              >
                                {txn.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-20 text-center opacity-30">
                          <Wallet
                            size={48}
                            className="mx-auto mb-4 opacity-10"
                          />
                          <p className="font-bold uppercase tracking-widest text-xs">
                            No transactions found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="text-center p-20 opacity-40">User not found</div>
      )}
      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {showCertModal && selectedCert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCertModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-6xl h-fit max-h-[95vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center text-primary">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm md:text-lg text-slate-900 leading-none mb-1">
                      {selectedCert.course?.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      ID: {selectedCert.certificateId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedCert.certificateUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] md:text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Download size={14} />{" "}
                    <span className="hidden xs:inline">Download</span>
                  </a>
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Responsive Certificate Image Container */}
              <div className="flex-1 overflow-hidden bg-slate-100/50 p-2 md:p-6 flex items-center justify-center min-h-0">
                <img
                  src={selectedCert.certificateUrl}
                  alt="Certificate"
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain shadow-xl rounded border border-white"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-3 md:p-4 bg-white border-t flex items-center justify-between text-slate-500">
                <div className="text-[10px] md:text-xs font-medium">
                  Issued:{" "}
                  {new Date(selectedCert.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-40">
                  CodersAdda Verification Site
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewUser;
