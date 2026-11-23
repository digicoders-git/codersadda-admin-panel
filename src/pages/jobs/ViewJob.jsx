import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getJobById } from "../../apis/job";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
} from "lucide-react";
import Loader from "../../components/Loader";

function ViewJob() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await getJobById(id);
        if (res.success && res.data) {
          setJob(res.data);
        } else {
          toast.error("Job not found");
          navigate("/dashboard/jobs");
        }
      } catch (error) {
        toast.error("Failed to fetch job details");
        navigate("/dashboard/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div
        className="p-2 rounded-lg"
        style={{
          backgroundColor: colors.primary + "10",
          color: colors.primary,
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-wider opacity-50"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </p>
        <p className="text-sm font-bold" style={{ color: colors.text }}>
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
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
          Job Intelligence
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : job ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="p-8 rounded-2xl border shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              {/* Decorative Background Icon */}
              <Briefcase
                className="absolute -right-8 -top-8 opacity-[0.03] rotate-12"
                size={200}
              />

              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2
                    className="text-3xl font-black"
                    style={{ color: colors.primary }}
                  >
                    {job.jobTitle}
                  </h2>
                  <span
                    className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{
                      backgroundColor: colors.primary + "15",
                      color: colors.primary,
                    }}
                  >
                    {job.jobCategory}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="opacity-40" />
                    <span className="text-sm font-bold opacity-70">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="opacity-40" />
                    <span className="text-sm font-bold opacity-70">
                      {job.workType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="opacity-40" />
                    <span className="text-sm font-bold opacity-70">
                      {job.requiredExperience}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="opacity-40" />
                    <span className="text-sm font-bold opacity-70">
                      {job.salaryPackage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="opacity-40" />
                    <span className="text-sm font-bold opacity-70">
                      {job.numberOfOpenings} Openings
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[2px] opacity-40 mb-3">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills && job.requiredSkills.map ? (
                        job.requiredSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-4 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-105"
                            style={{
                              borderColor: colors.accent + "30",
                              backgroundColor: colors.background,
                            }}
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm opacity-50">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-xs font-black uppercase tracking-[2px] opacity-40 mb-3">
                      Narrative / Description
                    </h3>
                    <p className="text-sm font-semibold leading-relaxed opacity-70 whitespace-pre-line">
                      {job.jobDescription ||
                        "No detailed description provided for this role."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div
              className="p-6 rounded-2xl border shadow-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h3 className="text-sm font-black mb-6 flex items-center gap-2">
                <Building2
                  size={18}
                  className="text-primary"
                  style={{ color: colors.primary }}
                />{" "}
                Organization Details
              </h3>
              <div className="space-y-6">
                <DetailItem
                  icon={Building2}
                  label="Company Name"
                  value={job.companyName}
                />
                <DetailItem
                  icon={Mail}
                  label="Email Address"
                  value={job.contactEmail}
                />
                <DetailItem
                  icon={Phone}
                  label="Mobile Number"
                  value={job.companyMobile}
                />
                <DetailItem
                  icon={Globe}
                  label="Digital Presence"
                  value={job.companyWebsite}
                />
                <DetailItem
                  icon={MapPin}
                  label="Full Address"
                  value={job.fullAddress}
                />
              </div>
            </div>

            <div
              className="p-6 rounded-2xl border border-dashed flex items-start gap-4"
              style={{ borderColor: colors.accent + "30" }}
            >
              <ShieldCheck size={24} className="text-green-500 shrink-0" />
              <div>
                <p className="text-xs font-bold mb-1">Verified Opportunity</p>
                <p className="text-[10px] opacity-50 font-semibold leading-relaxed">
                  This job posting has been auto-indexed and verified by
                  CodersAdda Admin Network.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-20 opacity-40">Job not found</div>
      )}
    </div>
  );
}

export default ViewJob;
