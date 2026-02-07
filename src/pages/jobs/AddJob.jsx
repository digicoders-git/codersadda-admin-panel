import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { createJob } from "../../apis/job";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";
import Loader from "../../components/Loader";

function AddJob() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const initialFormState = {
    jobTitle: "",
    jobCategory: "Senior Developer",
    location: "",
    workType: "Work From Office",
    requiredExperience: "Fresher",
    salaryPackage: "",
    numberOfOpenings: "",
    requiredSkills: "",
    companyName: "",
    contactEmail: "",
    companyMobile: "",
    companyWebsite: "",
    fullAddress: "",
    jobDescription: "",
    jobStatus: "Active",
    price: 0,
    priceType: "free",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.companyName) {
      toast.warning("Please fill in basic job details");
      return;
    }
    try {
      setActionLoading(true);
      const res = await createJob(formData);
      if (res.success) {
        toast.success("Job opportunity published!");
        navigate("/dashboard/jobs");
      }
    } catch (err) {
      toast.error("Failed to create job");
    } finally {
      setActionLoading(false);
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

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {actionLoading && <Loader size={128} fullPage={true} />}
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
          Post New Job
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Job Info */}
        <div
          className="p-6 rounded-lg border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h2
            className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Briefcase
              size={18}
              className="text-primary"
              style={{ color: colors.primary }}
            />{" "}
            Job Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label style={labelStyle}>Job Title</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                placeholder="Ex: Senior Flutter Developer"
                className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Category / Role</label>
              <input
                type="text"
                required
                value={formData.jobCategory}
                onChange={(e) =>
                  setFormData({ ...formData, jobCategory: e.target.value })
                }
                placeholder="Ex: Senior Developer"
                className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Ex: Lucknow, Noida"
                className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Salary / Package (LPA)</label>
              <input
                type="text"
                required
                value={formData.salaryPackage}
                onChange={(e) =>
                  setFormData({ ...formData, salaryPackage: e.target.value })
                }
                placeholder="Ex: 12-18 LPA"
                className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Required Experience</label>
              <ModernSelect
                options={[
                  { value: "Fresher", label: "Fresher" },
                  { value: "1-2 Years", label: "1-2 Years" },
                  { value: "3-5 Years", label: "3-5 Years" },
                  { value: "5+ Years", label: "5+ Years" },
                ]}
                value={formData.requiredExperience}
                onChange={(value) =>
                  setFormData({ ...formData, requiredExperience: value })
                }
                placeholder="Select Experience"
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Work Type</label>
              <ModernSelect
                options={[
                  { value: "Work From Office", label: "Work From Office" },
                  { value: "Work From Home", label: "Work From Home" },
                  { value: "Hybrid", label: "Hybrid" },
                ]}
                value={formData.workType}
                onChange={(value) =>
                  setFormData({ ...formData, workType: value })
                }
                placeholder="Select Work Type"
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Number of Openings</label>
              <input
                type="number"
                required
                value={formData.numberOfOpenings}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfOpenings: e.target.value })
                }
                placeholder="Ex: 5"
                className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                value={formData.requiredSkills}
                onChange={(e) =>
                  setFormData({ ...formData, requiredSkills: e.target.value })
                }
                placeholder="Ex: Flutter, Dart, Firebase"
                className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label style={labelStyle}>Job Description</label>
            <textarea
              rows="5"
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              placeholder="Detail the responsibilities and requirements..."
              className="w-full px-4 py-3 rounded-md border outline-none resize-none text-sm"
              style={inputStyle}
            ></textarea>
          </div>
        </div>

        {/* Company Details */}
        <div
          className="p-6 rounded-lg border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h2
            className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Building2
              size={18}
              className="text-primary"
              style={{ color: colors.primary }}
            />{" "}
            Company Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label style={labelStyle}>Company Name</label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                  size={16}
                />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="Ex: Tech Solutions Pvt Ltd"
                  className="w-full pl-10 pr-4 py-2 rounded-md border outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Contact Email</label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                  size={16}
                />
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  placeholder="Ex: hr@techsolutions.com"
                  className="w-full pl-10 pr-4 py-2 rounded-md border outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Contact Mobile</label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                  size={16}
                />
                <input
                  type="tel"
                  value={formData.companyMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, companyMobile: e.target.value })
                  }
                  placeholder="Ex: +91 9988776655"
                  className="w-full pl-10 pr-4 py-2 rounded-md border outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Company Website</label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                  size={16}
                />
                <input
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) =>
                    setFormData({ ...formData, companyWebsite: e.target.value })
                  }
                  placeholder="Ex: https://techsolutions.com"
                  className="w-full pl-10 pr-4 py-2 rounded-md border outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Full Address Field */}
          <div className="mt-4 space-y-1">
            <label style={labelStyle}>Full Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 opacity-30" size={16} />
              <textarea
                rows="3"
                value={formData.fullAddress}
                onChange={(e) =>
                  setFormData({ ...formData, fullAddress: e.target.value })
                }
                placeholder="Enter complete company address..."
                className="w-full pl-10 pr-4 py-3 rounded-md border outline-none resize-none text-sm"
                style={inputStyle}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="p-6 rounded border shadow-sm space-y-4"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-wider opacity-60"
              style={{ color: colors.text }}
            >
              Pricing Model
            </h3>
            <div className="flex gap-4 mb-4">
              {["free", "paid"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, priceType: type })}
                  className="flex-1 py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      formData.priceType === type
                        ? colors.primary
                        : "transparent",
                    color:
                      formData.priceType === type
                        ? colors.background
                        : colors.text,
                    borderColor:
                      formData.priceType === type
                        ? colors.primary
                        : colors.accent + "20",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            {formData.priceType === "paid" && (
              <div className="space-y-1">
                <label style={labelStyle}>Unlock Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Ex: 99"
                  className="w-full px-4 py-2 rounded-md border outline-none text-sm font-bold"
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          <div
            className="p-6 rounded border shadow-sm space-y-4"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-wider opacity-60"
              style={{ color: colors.text }}
            >
              Job Status
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {["Active", "Disabled"].map((stat) => (
                <button
                  key={stat}
                  type="button"
                  onClick={() => setFormData({ ...formData, jobStatus: stat })}
                  className="py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      formData.jobStatus === stat
                        ? colors.primary
                        : "transparent",
                    color:
                      formData.jobStatus === stat
                        ? colors.background
                        : colors.text,
                    borderColor:
                      formData.jobStatus === stat
                        ? colors.primary
                        : colors.accent + "20",
                  }}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            Confirm & Post
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/jobs")}
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

export default AddJob;
