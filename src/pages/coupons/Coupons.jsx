import {
  Plus,
  Search,
  Trash2,
  Ticket,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllCoupons,
  deleteCoupon as apiDeleteCoupon,
} from "../../apis/coupon";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

function Coupons() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  // Data States
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllCoupons();
      if (res.success) {
        setCoupons(res.coupons);
      }
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This coupon will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await apiDeleteCoupon(id);
          if (res.success) {
            toast.success("Coupon deleted successfully!");
            fetchData();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error deleting coupon");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const cardStyle = {
    backgroundColor: colors.sidebar || colors.background,
    borderColor: colors.accent + "30",
  };

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div
        className="shrink-0 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ backgroundColor: colors.background }}
      >
        <div>
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ color: colors.text }}
          >
            Coupon Management
          </h1>
          <p
            className="text-xs md:text-sm font-medium opacity-60"
            style={{ color: colors.textSecondary }}
          >
            Create and manage discount coupons for your users.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/coupons/add")}
          className="flex items-center cursor-pointer gap-2 px-6 py-2 rounded font-semibold transition-all shadow-md active:scale-95"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
          }}
        >
          <Plus size={18} /> <span>Create Coupon</span>
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 md:px-6 mb-6">
        <div className="relative group max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all text-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
              color: colors.text,
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-auto px-4 md:px-6 pb-6 scrollbar-thin"
        style={{ scrollbarColor: `${colors.accent}40 transparent` }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
            <Loader size={80} />
            <p className="mt-4 text-sm font-medium opacity-40 animate-pulse">
              Fetching coupons...
            </p>
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon._id}
                className="rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md relative overflow-hidden group"
                style={cardStyle}
              >
                {/* Background Pattern */}
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <Ticket size={120} />
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span
                      className="text-2xl font-black tracking-tighter"
                      style={{ color: colors.primary }}
                    >
                      {coupon.code}
                    </span>
                    <span
                      className="text-[10px] uppercase font-bold tracking-widest opacity-50"
                      style={{ color: colors.textSecondary }}
                    >
                      Coupon Code
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${coupon.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {coupon.isActive ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {coupon.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/5 rounded-xl p-3 border border-black/5">
                      <p className="text-[10px] font-bold opacity-40 uppercase mb-1">
                        Discount
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: colors.text }}
                      >
                        {coupon.discountPercent}%
                      </p>
                    </div>
                    <div className="bg-black/5 rounded-xl p-3 border border-black/5">
                      <p className="text-[10px] font-bold opacity-40 uppercase mb-1">
                        Usage
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: colors.text }}
                      >
                        {coupon.usedCount} / {coupon.usageLimit || "∞"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Layers size={14} />
                      <span>
                        Min Purchase: ₹{coupon.minPurchaseAmount || 0}
                      </span>
                    </div>
                    {coupon.maxDiscountAmount && (
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Clock size={14} />
                        <span>Max Cap: ₹{coupon.maxDiscountAmount}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Calendar size={14} />
                      <span>
                        Valid Till:{" "}
                        {coupon.validTill
                          ? new Date(coupon.validTill).toLocaleDateString()
                          : "Lifetime"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-black/5">
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    disabled={actionLoading === coupon._id}
                    className="p-2 cursor-pointer rounded-lg hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === coupon._id ? (
                      <Loader size={18} variant="button" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-32 rounded-3xl border-4 border-dashed flex flex-col items-center justify-center gap-6 opacity-30"
            style={{
              borderColor: colors.accent + "15",
              color: colors.textSecondary,
            }}
          >
            <Ticket size={64} className="animate-pulse" />
            <div>
              <p className="text-2xl font-bold uppercase tracking-widest">
                {searchQuery ? "No matching coupons" : "No coupons created yet"}
              </p>
              <p className="text-sm font-medium mt-2 text-center max-w-sm">
                Create your first promotional coupon to boost your sales.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Coupons;
