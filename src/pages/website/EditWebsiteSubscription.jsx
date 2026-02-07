import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSubscriptionById,
  updateSubscription as apiUpdateSubscription,
} from "../../apis/subscription";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";

function EditWebsiteSubscription() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    planType: "monthly",
    duration: "",
    price: "",
    benefits: "",
    badge: "normal",
    status: "Active",
  });

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const res = await getSubscriptionById(id);
        if (res.success && res.data) {
          setFormData(res.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.duration || !formData.price || !formData.benefits) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      const res = await apiUpdateSubscription(id, {
        ...formData,
        price: parseInt(formData.price),
      });
      if (res.success) {
        toast.success("Subscription updated successfully!");
        navigate("/dashboard/website/subscriptions");
      }
    } catch (err) {
      toast.error("Failed to update subscription");
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8">
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
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Edit Subscription Plan
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div
          className="p-6 rounded-lg border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h2
            className="text-lg font-bold mb-6"
            style={{ color: colors.primary }}
          >
            Subscription Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Plan Type</label>
                <ModernSelect
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                  value={formData.planType}
                  onChange={(value) =>
                    setFormData({ ...formData, planType: value })
                  }
                  placeholder="Select Plan Type"
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Duration *</label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="Ex: 1 Month, 12 Months"
                  className="w-full px-4 py-2 rounded-md border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Enter price"
                  className="w-full px-4 py-2 rounded-md border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Badge</label>
                <ModernSelect
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "popular", label: "Popular" },
                    { value: "best-value", label: "Best Value" },
                    { value: "premium", label: "Premium" },
                  ]}
                  value={formData.badge}
                  onChange={(value) =>
                    setFormData({ ...formData, badge: value })
                  }
                  placeholder="Select Badge"
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Status</label>
                <ModernSelect
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Disabled", label: "Disabled" },
                  ]}
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  placeholder="Select Status"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-1">
              <label style={labelStyle}>Benefits *</label>
              <textarea
                required
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                placeholder="Enter benefits separated by commas (Ex: Access to all courses, Download materials, Certificate)"
                rows={4}
                className="w-full px-4 py-2 rounded-md border outline-none text-sm resize-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Separate each benefit with a comma
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Save size={18} />
            Update Subscription
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/website/subscriptions")}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all cursor-pointer"
            style={{ color: colors.text, borderColor: colors.accent + "30" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditWebsiteSubscription;
