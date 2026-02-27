import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Ticket,
  Calendar,
  DollarSign,
  Percent,
  UserCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import { getSingleCoupon, updateCoupon } from "../../apis/coupon";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function EditCoupon() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    maxDiscountAmount: "",
    minPurchaseAmount: "",
    usageLimit: "",
    validTill: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await getSingleCoupon(id);
        if (res.success) {
          const coupon = res.coupon;
          setFormData({
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            maxDiscountAmount: coupon.maxDiscountAmount || "",
            minPurchaseAmount: coupon.minPurchaseAmount || "",
            usageLimit: coupon.usageLimit || "",
            validTill: coupon.validTill
              ? new Date(coupon.validTill).toISOString().split("T")[0]
              : "",
            isActive: coupon.isActive,
          });
        }
      } catch (error) {
        toast.error("Failed to fetch coupon details");
        navigate("/dashboard/coupons");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupon();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleStatus = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountPercent) {
      return toast.error("Code and Discount Percentage are required");
    }

    try {
      setUpdateLoading(true);
      const res = await updateCoupon(id, formData);
      if (res.success) {
        toast.success(res.message);
        navigate("/dashboard/coupons");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating coupon");
    } finally {
      setUpdateLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.sidebar || colors.background,
    borderColor: colors.accent + "20",
    color: colors.text,
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div className="shrink-0 p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/coupons")}
            className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            style={{ color: colors.text }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              className="text-xl md:text-2xl font-bold"
              style={{ color: colors.text }}
            >
              Edit Coupon
            </h1>
            <p
              className="text-xs md:text-sm font-medium opacity-60"
              style={{ color: colors.textSecondary }}
            >
              Update your existing discount offer.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Main Info */}
          <div className="space-y-6">
            <div
              className="p-6 rounded-3xl border shadow-sm space-y-5"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "15",
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <Ticket size={16} /> Basic Details
                </h2>
                <button
                  type="button"
                  onClick={toggleStatus}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${formData.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                >
                  {formData.isActive ? (
                    <ToggleRight size={16} />
                  ) : (
                    <ToggleLeft size={16} />
                  )}
                  {formData.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 ml-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. WELCOME50"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border outline-none transition-all text-sm font-bold uppercase"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 ml-1">
                  Discount PERCENTAGE (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPercent"
                    placeholder="e.g. 20"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-all text-sm font-bold"
                    style={inputStyle}
                  />
                  <Percent
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-3xl border shadow-sm space-y-5"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "15",
              }}
            >
              <h2 className="text-sm font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Validity & Limits
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 ml-1">
                  Valid Till (Optional)
                </label>
                <input
                  type="date"
                  name="validTill"
                  value={formData.validTill}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border outline-none transition-all text-sm"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 ml-1">
                  Usage Limit (Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="usageLimit"
                    placeholder="e.g. 100"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-all text-sm"
                    style={inputStyle}
                  />
                  <UserCheck
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Constraints */}
          <div className="space-y-6">
            <div
              className="p-6 rounded-3xl border shadow-sm space-y-5"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "15",
              }}
            >
              <h2 className="text-sm font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                <DollarSign size={16} /> Constraints
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 ml-1">
                  Min Purchase Amount (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    placeholder="e.g. 500"
                    value={formData.minPurchaseAmount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-all text-sm"
                    style={inputStyle}
                  />
                  <Layers
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 ml-1">
                  Max Discount Amount (₹ / Cap)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    placeholder="e.g. 200"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-all text-sm"
                    style={inputStyle}
                  />
                  <DollarSign
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                {updateLoading ? (
                  <Loader size={20} variant="button" />
                ) : (
                  <>
                    <Send size={18} /> <span>Update Coupon</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/coupons")}
                className="w-full py-4 rounded-2xl font-bold border transition-all hover:bg-black/5 cursor-pointer"
                style={{
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const Layers = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

export default EditCoupon;
