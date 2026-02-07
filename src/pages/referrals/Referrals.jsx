import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  DollarSign,
  UserCheck,
  Award,
  Filter,
  RefreshCw,
  Users,
  X,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  Calendar,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  getAmbassadorApplications,
  approveAmbassador,
  rejectAmbassador,
  getReferralConfig,
  updateReferralConfig,
  getReferredUsers,
} from "../../apis/ambassador";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

function Referrals() {
  const {
    colors,
    setRightSidebarOpen,
    setRightSidebarContent,
    setHeaderTitle,
    setSidebarOpen,
  } = useTheme();
  const navigate = useNavigate();

  // Data State
  const [applications, setApplications] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending"); // pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState("");

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

  // Sidebar Content Component
  const ReferralSidebarContent = ({
    students,
    loading,
    ambassador,
    onClose,
    colors,
    navigate,
    config,
  }) => (
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
              Referred Users
            </h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate max-w-[150px]">
              BY {ambassador?.fullName}
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
              Fetching users...
            </p>
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student._id}
                className="p-4 rounded border bg-white shadow-sm flex flex-col gap-4 group"
                style={{ borderColor: colors.accent + "15" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
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
                      className="font-black text-sm truncate"
                      style={{ color: colors.text }}
                    >
                      {student.name}
                    </p>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-[10px] font-bold opacity-40 uppercase truncate flex items-center gap-1">
                        <Mail size={10} /> {student.email}
                      </p>
                      <p className="text-[10px] font-bold opacity-40 truncate flex items-center gap-1">
                        <Phone size={10} /> {student.mobile}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-black/5">
                  <div className="flex items-center gap-1.5 opacity-60 text-[10px] font-bold">
                    <Calendar size={12} /> Joined:{" "}
                    {new Date(student.createdAt).toLocaleDateString()}
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase border border-green-100">
                    Active
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/dashboard/users/view/${student._id}`)
                  }
                  className="w-full py-2.5 rounded border-2 border-black bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
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
              No users referred yet
            </p>
          </div>
        )}
      </div>

      {/* Reward Summary Footer */}
      <div
        className="p-4 border-t"
        style={{ borderColor: colors.accent + "10" }}
      >
        <div className="p-4 rounded-xl bg-indigo-600 text-white flex items-center justify-between shadow-lg shadow-indigo-200">
          <div>
            <p className="text-[9px] font-black opacity-70 uppercase tracking-widest mb-0.5">
              Total Rewards
            </p>
            <p className="text-xl font-black">
              ₹{students.length * (config?.value || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>
      </div>
    </div>
  );

  const openDrawer = async (ambassador) => {
    setRightSidebarOpen(true);
    setSidebarOpen(false);
    setHeaderTitle("Ambassador Referrals");
    setRightSidebarContent(
      <ReferralSidebarContent
        students={[]}
        loading={true}
        ambassador={ambassador}
        onClose={closeRightSidebar}
        colors={colors}
        navigate={navigate}
        config={config}
      />,
    );

    try {
      const res = await getReferredUsers(ambassador.user?._id);
      if (res.success) {
        setRightSidebarContent(
          <ReferralSidebarContent
            students={res.data}
            loading={false}
            ambassador={ambassador}
            onClose={closeRightSidebar}
            colors={colors}
            navigate={navigate}
            config={config}
          />,
        );
      }
    } catch (error) {
      toast.error("Failed to fetch referred users");
      closeRightSidebar();
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching Ambassador data for status:", statusFilter);

      const [appRes, configRes] = await Promise.all([
        getAmbassadorApplications({ status: statusFilter }),
        getReferralConfig(),
      ]);

      console.log("Applications Data:", appRes);
      console.log("Config Data:", configRes);

      if (appRes && appRes.success) {
        setApplications(appRes.data || []);
      } else if (appRes) {
        console.error("Fetch Apps Error:", appRes);
        toast.error(appRes.message || "Failed to fetch applications");
      }

      if (configRes && configRes.success) {
        setConfig(configRes.data);
      } else if (configRes) {
        console.error("Fetch Config Error:", configRes);
        toast.error(configRes.message || "Failed to fetch config");
      }
    } catch (err) {
      console.error("Referral Page Error:", err);
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleApprove = async (id, name) => {
    const result = await Swal.fire({
      title: "Approve Applicant?",
      text: `Are you sure you want to approve ${name} as a Campus Ambassador?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Approve",
    });

    if (result.isConfirmed) {
      try {
        const res = await approveAmbassador(id);
        if (res.success) {
          toast.success(`${name} is now an Ambassador!`);
          fetchData();
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error("Approval failed");
      }
    }
  };

  const handleReject = async (id, name) => {
    const { value: comment } = await Swal.fire({
      title: "Reject Applicant",
      input: "textarea",
      inputLabel: `Rejection reason for ${name}`,
      inputPlaceholder: "Enter reason here...",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      inputValidator: (value) => {
        if (!value) return "You need to provide a reason!";
      },
    });

    if (comment) {
      try {
        const res = await rejectAmbassador(id, comment);
        if (res.success) {
          toast.success(`Application rejected`);
          fetchData();
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error("Rejection failed");
      }
    }
  };

  const handleUpdateConfig = async () => {
    const { value: amount } = await Swal.fire({
      title: "Update Referral Commission",
      input: "number",
      inputLabel: "Amount credited to Ambassador per new registration",
      inputValue: config?.value || 0,
      showCancelButton: true,
      confirmButtonColor: colors.primary,
    });

    if (amount !== undefined) {
      try {
        setConfigLoading(true);
        const res = await updateReferralConfig(amount);
        if (res.success) {
          toast.success("Commission updated successfully!");
          setConfig(res.data);
        }
      } catch (err) {
        toast.error("Failed to update config");
      } finally {
        setConfigLoading(false);
      }
    }
  };

  const filteredApps = applications.filter(
    (app) =>
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.collegeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader size={128} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
            Ambassador Program
          </h1>
          <p
            className="opacity-60 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Manage campus ambassador applications and referral settings
          </p>
        </div>

        <div
          className="p-4 rounded-xl border flex items-center gap-4 bg-opacity-50"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase opacity-40">
              Commission Rate
            </p>
            <h3 className="text-xl font-black" style={{ color: colors.text }}>
              ₹{config?.value || 0}{" "}
              <span className="text-xs opacity-40">/ signup</span>
            </h3>
          </div>
          <button
            onClick={handleUpdateConfig}
            className="ml-4 p-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            style={{ color: colors.primary }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-black/5 p-1 rounded-xl w-fit">
          {[
            { id: "pending", label: "Pending", icon: Clock },
            { id: "approved", label: "Approved", icon: CheckCircle },
            { id: "rejected", label: "Rejected", icon: XCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "shadow-md bg-white"
                  : "opacity-40 hover:opacity-100"
              }`}
              style={{
                backgroundColor:
                  statusFilter === tab.id ? colors.primary : "transparent",
                color:
                  statusFilter === tab.id ? colors.background : colors.text,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            size={18}
          />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none font-medium"
            style={{
              backgroundColor: colors.sidebar,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
      </div>

      {/* Applications List */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm relative min-h-[400px]"
        style={{
          backgroundColor: colors.sidebar,
          borderColor: colors.accent + "20",
        }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/20 backdrop-blur-[2px]">
            <Loader size={60} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: colors.accent + "10",
                    color: colors.text,
                  }}
                >
                  <th className="p-4 text-xs font-black uppercase opacity-60">
                    Applicant
                  </th>
                  <th className="p-4 text-xs font-black uppercase opacity-60">
                    Education
                  </th>
                  <th className="p-4 text-xs font-black uppercase opacity-60">
                    Referral ID
                  </th>
                  <th className="p-4 text-xs font-black uppercase opacity-60">
                    Applied On
                  </th>
                  <th className="p-4 text-xs font-black uppercase opacity-60 text-center">
                    Total Referrals
                  </th>
                  <th className="p-4 text-xs font-black uppercase opacity-60 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b last:border-0 hover:bg-black/5 transition-all"
                      style={{
                        borderColor: colors.accent + "05",
                        color: colors.text,
                      }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center border"
                            style={{ borderColor: colors.accent + "20" }}
                          >
                            <UserCheck className="opacity-40" />
                          </div>
                          <div>
                            <p className="font-bold">{app.fullName}</p>
                            <p className="text-xs opacity-60">
                              {app.email} • {app.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{app.collegeName}</p>
                        <p className="text-xs opacity-60">{app.courseStream}</p>
                      </td>
                      <td className="p-4">
                        {app.status === "approved" ? (
                          <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-600 font-mono font-bold border border-green-500/20">
                            {app.user?.referralCode || "PENDING"}
                          </span>
                        ) : (
                          <span className="opacity-30 italic">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="p-4 opacity-60">
                        {new Date(app.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          onClick={() =>
                            app.referralCount > 0 && openDrawer(app)
                          }
                          className={`px-3 py-1 rounded-full font-black text-xs transition-transform active:scale-95 ${app.referralCount > 0 ? "bg-indigo-100 text-indigo-600 cursor-pointer hover:bg-indigo-200" : "bg-gray-100 text-gray-400 cursor-default"}`}
                        >
                          {app.referralCount || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(app._id, app.fullName)
                                }
                                className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-black uppercase hover:bg-green-600 transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(app._id, app.fullName)
                                }
                                className="px-4 py-2 rounded-lg border text-red-500 text-xs font-black uppercase hover:bg-red-50 transition-colors cursor-pointer"
                                style={{ borderColor: colors.accent + "30" }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === "approved" && (
                            <div className="flex items-center gap-1 text-green-500 font-bold">
                              <Award size={16} />
                              <span className="text-xs">Active Ambassador</span>
                            </div>
                          )}
                          {app.status === "rejected" && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-red-500 font-bold">
                                Rejected
                              </span>
                              <p className="text-[10px] opacity-40 italic">
                                {app.adminComment}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center opacity-40">
                      <div className="flex flex-col items-center gap-2">
                        <Filter size={48} className="opacity-20" />
                        <p className="font-bold">
                          No applications found in this category
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Referrals;
