import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CreditCard,
  Clock,
  DollarSign,
  Award,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSubscriptionById,
  deleteSubscription as apiDeleteSubscription,
} from "../../apis/subscription";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ViewWebsiteSubscription() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const res = await getSubscriptionById(id);
        if (res.success) {
          setSubscription(res.data);
        } else {
          toast.error("Subscription not found");
          navigate("/dashboard/website/subscriptions");
        }
      } catch (error) {
        toast.error("Failed to fetch subscription details");
        navigate("/dashboard/website/subscriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${subscription.planType}" subscription?`,
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
          toast.success("Subscription deleted successfully");
          navigate("/dashboard/website/subscriptions");
        }
      } catch (err) {
        toast.error("Failed to delete subscription");
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Subscription not found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-all cursor-pointer border"
            style={{
              color: colors.text,
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <CreditCard size={24} style={{ color: colors.primary }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                Subscription Details
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Subscription plan information
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate(`/dashboard/website/subscriptions/edit/${id}`)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary + "20",
              color: colors.primary,
            }}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div
              className="rounded-lg border shadow-sm p-6 text-center"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <div className="mb-4">
                <span
                  className="px-3 py-1 rounded text-sm font-bold text-white"
                  style={{ backgroundColor: getBadgeColor(subscription.badge) }}
                >
                  {subscription.badge?.toUpperCase()}
                </span>
              </div>

              <h3
                className="text-2xl font-bold capitalize mb-2"
                style={{ color: colors.text }}
              >
                {subscription.planType} Plan
              </h3>

              <div
                className="text-4xl font-bold mb-2"
                style={{ color: colors.primary }}
              >
                ₹{subscription.price}
              </div>

              <p
                className="text-lg mb-4"
                style={{ color: colors.textSecondary }}
              >
                {subscription.duration}
              </p>

              <span
                className={`inline-block px-3 py-1 rounded text-sm font-bold text-white ${
                  subscription.status === "Active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {subscription.status}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div
              className="rounded-lg border shadow-sm p-6"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: colors.text }}
              >
                Plan Details
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Clock size={20} style={{ color: colors.primary }} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Plan Type & Duration
                    </p>
                    <p
                      className="font-semibold text-lg"
                      style={{ color: colors.text }}
                    >
                      {subscription.planType} - {subscription.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign size={20} style={{ color: colors.primary }} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Pricing
                    </p>
                    <p
                      className="font-semibold text-lg"
                      style={{ color: colors.text }}
                    >
                      ₹{subscription.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award
                    size={20}
                    style={{ color: colors.primary }}
                    className="mt-1"
                  />
                  <div>
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Badge
                    </p>
                    <span
                      className="px-3 py-1 rounded text-sm font-bold text-white"
                      style={{
                        backgroundColor: getBadgeColor(subscription.badge),
                      }}
                    >
                      {subscription.badge?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.primary }}
                  >
                    Plan Benefits
                  </h3>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.accent}30`,
                    }}
                  >
                    <ul className="space-y-2">
                      {subscription.benefits &&
                        subscription.benefits
                          .split(", ")
                          .map((benefit, index) => (
                            <li
                              key={index}
                              className="flex items-start"
                              style={{ color: colors.text }}
                            >
                              <span className="text-green-500 mr-2 mt-1">
                                ✓
                              </span>
                              {benefit}
                            </li>
                          ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.primary + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    ₹{subscription.price}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Price
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.accent + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {subscription.benefits
                      ? subscription.benefits.split(", ").length
                      : 0}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Benefits
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor:
                      subscription.status === "Active"
                        ? "#22C55E20"
                        : "#EF444420",
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color:
                        subscription.status === "Active"
                          ? "#22C55E"
                          : "#EF4444",
                    }}
                  >
                    {subscription.status}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Status
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewWebsiteSubscription;
