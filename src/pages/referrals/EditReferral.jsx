import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getReferralById,
  updateReferral as apiUpdateReferral,
} from "../../apis/referral";
import { toast } from "react-toastify";

function EditReferral() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    referralCode: "",
  });

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        setLoading(true);
        const res = await getReferralById(id);
        if (res.success && res.data) {
          setFormData(res.data);
        } else {
          toast.error("Referral not found");
          navigate("/dashboard/referrals");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch referral details");
        navigate("/dashboard/referrals");
      } finally {
        setLoading(false);
      }
    };
    fetchReferral();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.referralCode) {
      toast.warning("Please fill required fields");
      return;
    }
    try {
      const res = await apiUpdateReferral(id, formData);
      if (res.success) {
        toast.success("Referral updated successfully!");
        navigate("/dashboard/referrals");
      }
    } catch (err) {
      toast.error("Failed to update referral");
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };
  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "30",
    color: colors.text,
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
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
            Edit Referral
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Update information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <div
          className="p-8 rounded border shadow-sm space-y-6"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>College Name</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
                className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Course / Stream</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Referral Code</label>
            <input
              type="text"
              value={formData.referralCode}
              onChange={(e) =>
                setFormData({ ...formData, referralCode: e.target.value })
              }
              className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all font-mono"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Save size={18} /> Update Referral
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/referrals")}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-3 cursor-pointer"
            style={{ borderColor: colors.accent + "30", color: colors.text }}
          >
            <X size={18} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditReferral;
