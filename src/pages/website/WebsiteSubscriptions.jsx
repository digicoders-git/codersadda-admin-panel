import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSubscriptions,
  deleteSubscription as apiDeleteSubscription,
  toggleSubscriptionStatus as apiToggleSubscriptionStatus,
} from "../../apis/subscription";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function WebsiteSubscriptions() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
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

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.planType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.duration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.benefits?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id, planType) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${planType}" subscription?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await apiDeleteSubscription(id);
        if (res.success) {
          toast.success("Subscription deleted successfully!");
          setSubscriptions((prev) => prev.filter((s) => s._id !== id));
        }
      } catch (err) {
        toast.error("Failed to delete subscription");
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await apiToggleSubscriptionStatus(id);
      if (res.success) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s._id === id
              ? {
                  ...s,
                  status:
                    res.data.status ||
                    (currentStatus === "Active" ? "Disabled" : "Active"),
                }
              : s,
          ),
        ); // Adjust based on API response
        toast.success(`Status updated successfully`);
        // Reload to be sure? Or just trust UI update?
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "popular":
        return "#3B82F6";
      case "best-value":
        return "#10B981";
      case "premium":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CreditCard size={24} style={{ color: colors.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Website Subscriptions
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Manage subscription plans and pricing
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/website/subscriptions/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} />
          Add Subscription
        </button>
      </div>

      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
              color: colors.text,
            }}
          />
        </div>

        <div
          className="flex rounded-lg border"
          style={{ borderColor: colors.accent + "30" }}
        >
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-l-lg transition-all ${
              viewMode === "grid" ? "opacity-100" : "opacity-50"
            }`}
            style={{
              backgroundColor:
                viewMode === "grid" ? colors.primary : "transparent",
              color: viewMode === "grid" ? colors.background : colors.text,
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-r-lg transition-all ${
              viewMode === "list" ? "opacity-100" : "opacity-50"
            }`}
            style={{
              backgroundColor:
                viewMode === "list" ? colors.primary : "transparent",
              color: viewMode === "list" ? colors.background : colors.text,
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredSubscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <CreditCard
              size={48}
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              No subscriptions found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="rounded-lg border shadow-sm p-6 transition-all hover:shadow-md relative"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold text-white"
                    style={{
                      backgroundColor: getBadgeColor(subscription.badge),
                    }}
                  >
                    {subscription.badge?.toUpperCase()}
                  </span>
                  <button
                    onClick={() =>
                      handleStatusToggle(subscription._id, subscription.status)
                    }
                    className={`px-2 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                      subscription.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {subscription.status}
                  </button>
                </div>

                <div className="text-center mb-4">
                  <h3
                    className="text-xl font-bold capitalize mb-2"
                    style={{ color: colors.text }}
                  >
                    {subscription.planType} Plan
                  </h3>
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: colors.primary }}
                  >
                    ₹{subscription.price}
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {subscription.duration}
                  </p>
                </div>

                <div className="mb-4">
                  <h4
                    className="font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    Benefits:
                  </h4>
                  <ul
                    className="text-sm space-y-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {subscription.benefits
                      ?.split(", ")
                      .map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {benefit}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/website/subscriptions/view/${subscription._id}`,
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: colors.primary + "20",
                      color: colors.primary,
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/website/subscriptions/edit/${subscription._id}`,
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(subscription._id, subscription.planType)
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="rounded-lg border shadow-sm p-4 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="font-bold text-lg capitalize"
                            style={{ color: colors.text }}
                          >
                            {subscription.planType} Plan
                          </h3>
                          <span
                            className="px-2 py-1 rounded text-xs font-bold text-white"
                            style={{
                              backgroundColor: getBadgeColor(
                                subscription.badge,
                              ),
                            }}
                          >
                            {subscription.badge?.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                          <div
                            className="text-xl font-bold"
                            style={{ color: colors.primary }}
                          >
                            ₹{subscription.price}
                          </div>
                          <span
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {subscription.duration}
                          </span>
                        </div>

                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {subscription.benefits}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleStatusToggle(
                              subscription._id,
                              subscription.status,
                            )
                          }
                          className={`px-3 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                            subscription.status === "Active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {subscription.status}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/subscriptions/view/${subscription._id}`,
                              )
                            }
                            className="p-2 rounded transition-all"
                            style={{
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            }}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/subscriptions/edit/${subscription._id}`,
                              )
                            }
                            className="p-2 rounded transition-all"
                            style={{
                              backgroundColor: colors.accent + "20",
                              color: colors.text,
                            }}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                subscription._id,
                                subscription.planType,
                              )
                            }
                            className="p-2 rounded transition-all text-red-600 bg-red-50 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteSubscriptions;
