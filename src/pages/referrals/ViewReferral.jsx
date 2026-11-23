import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Share2,
  Copy,
  Check,
  School,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getReferralById } from "../../apis/referral";
import { toast } from "react-toastify";

function ViewReferral() {
  const { colors } = useTheme();
  // State
  const navigate = useNavigate();
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        setLoading(true);
        const res = await getReferralById(id);
        if (res.success && res.data) {
          setReferral(res.data);
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

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!referral) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referral.referralCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

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
    fontSize: "16px",
    fontWeight: "600",
  };

  return (
    <div className="w-full  mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
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
            Referral Details
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            User information
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div
          className="p-8 rounded border shadow-sm relative overflow-hidden"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Share2 size={120} />
          </div>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl font-bold shadow-inner">
              {referral.fullName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{referral.fullName}</h2>
              <span className="text-xs font-bold opacity-50 uppercase tracking-wider">
                Referral User
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <div className="mb-6">
                <p style={labelStyle} className="flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </p>
                <p style={valueStyle}>{referral.email}</p>
              </div>
              <div>
                <p style={labelStyle} className="flex items-center gap-1">
                  <Phone size={12} /> Phone Number
                </p>
                <p style={valueStyle}>{referral.phone}</p>
              </div>
            </div>
            <div>
              <div className="mb-6">
                <p style={labelStyle} className="flex items-center gap-1">
                  <School size={12} /> College
                </p>
                <p style={valueStyle}>{referral.college}</p>
              </div>
              <div>
                <p style={labelStyle} className="flex items-center gap-1">
                  <BookOpen size={12} /> Course / Stream
                </p>
                <p style={valueStyle}>{referral.course}</p>
              </div>
            </div>
          </div>

          <div
            className="mt-8 pt-6 border-t relative z-10"
            style={{ borderColor: colors.accent + "10" }}
          >
            <p style={labelStyle}>Referral Code</p>
            <div
              onClick={handleCopy}
              className="bg-black/5 border border-black/5 rounded p-4 flex items-center justify-between cursor-pointer hover:bg-black/10 transition-colors group"
            >
              <span className="font-mono text-xl font-bold tracking-wider">
                {referral.referralCode}
              </span>
              {copied ? (
                <span className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest">
                  <Check size={16} /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-2 opacity-40 group-hover:opacity-100 text-xs font-bold uppercase tracking-widest transition-opacity">
                  <Copy size={16} /> Copy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewReferral;
