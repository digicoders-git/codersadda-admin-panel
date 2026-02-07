import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  CreditCard,
  Clock,
  Eye,
  Trash2,
  Edit,
  Lock,
  Users,
  X,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSubscriptions,
  deleteSubscription as apiDeleteSubscription,
  toggleSubscriptionStatus as apiToggleSubscriptionStatus,
  getStudentsBySubscription,
} from "../../apis/subscription";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/Loader";

function Subscriptions() {
  const {
    colors,
    setSidebarOpen,
    setRightSidebarOpen,
    setRightSidebarContent,
    setHeaderTitle,
  } = useTheme();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Selected Plan States
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planStudents, setPlanStudents] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      if (res.success) {
        setSubscriptions(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

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
  const StudentSidebarContent = ({ students, loading, plan, onClose }) => (
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
          <div
            className="p-2.5 rounded"
            style={{
              backgroundColor: colors.primary + "15",
              color: colors.primary,
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.text }}>
              Plan Students
            </h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
              {plan?.planType} Plan
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-black/5 transition-all text-slate-400 active:scale-90"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader size={40} />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 -mt-4">
              Fetching student list...
            </p>
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-3">
            {students.map((enrollment, idx) => {
              const student = enrollment.user;
              if (!student) return null;
              return (
                <div
                  key={enrollment._id}
                  className="p-4 rounded border bg-white flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group"
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
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter truncate">
                        {student.email}
                      </p>
                      <p
                        className="text-[10px] font-bold opacity-40 tracking-tighter"
                        style={{ color: colors.primary }}
                      >
                        {student.mobile}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/users/view/${student._id}`)
                    }
                    className="w-full py-2.5 rounded border-2 font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
                    style={{
                      borderColor: colors.primary,
                      color: colors.primary,
                    }}
                  >
                    View Full Profile
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
            <Users size={64} className="mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">
              No active students found
            </p>
          </div>
        )}
      </div>

      <div
        className="p-4 border-t"
        style={{
          borderColor: colors.accent + "10",
          backgroundColor: colors.accent + "03",
        }}
      >
        <p className="text-[9px] font-bold text-center opacity-40 uppercase tracking-widest">
          Showing active enrollments only
        </p>
      </div>
    </div>
  );

  const fetchPlanStudents = async (plan) => {
    if (plan.totalStudents === 0) return;
    setSelectedPlan(plan);
    setRightSidebarOpen(true);
    setSidebarOpen(false);
    setHeaderTitle("Total Students");
    setSidebarLoading(true);

    // Initial render with loading state
    setRightSidebarContent(
      <StudentSidebarContent
        students={[]}
        loading={true}
        plan={plan}
        onClose={closeRightSidebar}
      />,
    );

    try {
      const res = await getStudentsBySubscription(plan._id);
      if (res.success) {
        setPlanStudents(res.data);
        // Render again with data
        setRightSidebarContent(
          <StudentSidebarContent
            students={res.data}
            loading={false}
            plan={plan}
            onClose={closeRightSidebar}
          />,
        );
      }
    } catch (err) {
      toast.error("Failed to fetch students");
      closeRightSidebar();
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Plan?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: colors.primary,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiDeleteSubscription(id);
          if (res.success) {
            setSubscriptions((prev) => prev.filter((p) => p._id !== id));
            toast.success("Subscription plan deleted");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error deleting plan");
        }
      }
    });
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await apiToggleSubscriptionStatus(id);
      if (res.success) {
        setSubscriptions((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, planStatus: !p.planStatus } : p,
          ),
        );
        toast.info("Plan status updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const filteredPlans = subscriptions.filter(
    (plan) =>
      plan.planType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.price.toString().includes(searchTerm),
  );

  return (
    <div
      className="p-6 relative min-h-screen"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: colors.text }}
          >
            Subscription Plans
          </h1>
          <p
            className="text-xs font-bold opacity-50 uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            Manage access tiers and pricing
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/subscriptions/add")}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer shadow-black/10"
          style={{ backgroundColor: colors.primary, color: "#fff" }}
        >
          <Plus size={18} /> Add New Plan
        </button>
      </div>

      <div
        className="p-6 rounded border shadow-sm mb-6"
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "15",
        }}
      >
        <div className="relative max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity"
            size={18}
            style={{ color: colors.text }}
          />
          <input
            type="text"
            placeholder="Search by plan type or price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded border outline-none transition-all text-sm font-bold"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
      </div>

      <div
        className="rounded border overflow-hidden shadow-xl shadow-black/5"
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "15",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: colors.accent + "05",
                  backgroundColor: colors.accent + "03",
                }}
              >
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Plan Details
                </th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Duration
                </th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Students
                </th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Price
                </th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
                  Status
                </th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">
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
                    <Loader size={60} />
                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest -mt-1">
                      Loading Plans...
                    </p>
                  </td>
                </tr>
              ) : filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <tr
                    key={plan._id}
                    className="group transition-colors hover:bg-black/1"
                  >
                    <td className="p-5 py-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded flex items-center justify-center shadow-inner"
                          style={{
                            backgroundColor: colors.primary + "10",
                            color: colors.primary,
                          }}
                        >
                          <CreditCard size={22} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold text-sm"
                              style={{ color: colors.text }}
                            >
                              {plan.planType} Plan
                            </span>
                            {plan.isInUse && (
                              <div
                                className="p-1 rounded-full bg-amber-50 text-amber-500"
                                title="Locked (Used by Students)"
                              >
                                <Lock size={10} />
                              </div>
                            )}
                          </div>
                          <span
                            className="text-[10px] opacity-40 font-bold uppercase tracking-tighter"
                            style={{ color: colors.textSecondary }}
                          >
                            {plan.planBenefits?.length || 0} Benefits included
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-50 border border-slate-100 w-fit">
                        <Clock
                          size={14}
                          className="opacity-40"
                          style={{ color: colors.primary }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: colors.text }}
                        >
                          {plan.duration}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <button
                        disabled={plan.totalStudents === 0}
                        onClick={() => fetchPlanStudents(plan)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${plan.totalStudents > 0 ? "bg-purple-50 text-purple-600 hover:scale-105 active:scale-95 cursor-pointer shadow-purple-500/10" : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"}`}
                      >
                        <Users size={14} />
                        {plan.totalStudents} Students
                      </button>
                    </td>
                    <td className="p-5">
                      <span
                        className="font-bold text-sm"
                        style={{ color: colors.text }}
                      >
                        ₹{plan.price}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center gap-2">
                        <Toggle
                          active={plan.planStatus}
                          onClick={() => {
                            if (plan.isInUse && plan.planStatus) {
                              toast.warning(
                                "Cannot deactivate plan. Students are currently using it.",
                              );
                              return;
                            }
                            toggleStatus(plan._id, plan.planStatus);
                          }}
                        />
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest ${plan.planStatus ? "text-green-500" : "text-red-500"}`}
                        >
                          {plan.planStatus ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/subscriptions/view/${plan._id}`,
                            )
                          }
                          className="p-2.5 rounded hover:bg-primary/10 text-primary transition-all active:scale-90"
                          title="View Details"
                          style={{ color: colors.primary }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/subscriptions/edit/${plan._id}`,
                            )
                          }
                          className="p-2.5 rounded hover:bg-blue-50 text-blue-500 transition-all active:scale-90"
                          title="Edit Plan"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (plan.isInUse) {
                              Swal.fire({
                                title: "Plan Locked",
                                text: "Cannot delete this plan while active students are using it.",
                                icon: "info",
                                confirmButtonColor: colors.primary,
                              });
                              return;
                            }
                            handleDelete(plan._id);
                          }}
                          className={`p-2.5 rounded transition-all active:scale-90 ${plan.isInUse ? "opacity-20 cursor-not-allowed text-slate-400" : "hover:bg-red-50 text-red-500 cursor-pointer"}`}
                          title={plan.isInUse ? "Locked (In Use)" : "Delete"}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center opacity-30 font-bold uppercase tracking-widest text-xs"
                  >
                    No subscription plans found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Subscriptions;
