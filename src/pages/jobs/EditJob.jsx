import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Building2, Briefcase } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getJobById, updateJob as apiUpdateJob } from "../../apis/job";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function EditJob() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await getJobById(id);
        if (res.success && res.data) {
          setFormData(res.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await apiUpdateJob(id, formData);
      if (res.success) {
        toast.success("Job details updated successfully");
        navigate("/dashboard/jobs");
      }
    } catch (err) {
      toast.error("Failed to update job");
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
          Edit Job Posting
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : formData ? (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
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
                Update Job Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label style={labelStyle}>Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Category / Role</label>
                  <input
                    type="text"
                    required
                    value={formData.jobCategory || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, jobCategory: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Salary / Package</label>
                  <input
                    type="text"
                    required
                    value={formData.salaryPackage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryPackage: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Experience</label>
                  <select
                    value={formData.requiredExperience || "Fresher"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiredExperience: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none cursor-pointer text-sm"
                    style={inputStyle}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Work Type</label>
                  <select
                    value={formData.workType || "Work From Office"}
                    onChange={(e) =>
                      setFormData({ ...formData, workType: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none cursor-pointer text-sm"
                    style={inputStyle}
                  >
                    <option value="Work From Office">Work From Office</option>
                    <option value="Work From Home">Work From Home</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Openings</label>
                  <input
                    type="number"
                    required
                    value={formData.numberOfOpenings || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfOpenings: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Skills</label>
                  <input
                    type="text"
                    value={formData.requiredSkills || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiredSkills: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <label style={labelStyle}>Description</label>
                <textarea
                  rows="5"
                  value={formData.jobDescription || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, jobDescription: e.target.value })
                  }
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
                Company Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label style={labelStyle}>Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Mobile</label>
                  <input
                    type="text"
                    value={formData.companyMobile || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyMobile: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Website</label>
                  <input
                    type="url"
                    value={formData.companyWebsite || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyWebsite: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <label style={labelStyle}>Address</label>
                <textarea
                  rows="3"
                  value={formData.fullAddress || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fullAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-md border outline-none resize-none text-sm"
                  style={inputStyle}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className="p-6 rounded-lg border shadow-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h3
                className="text-sm font-bold mb-4"
                style={{ color: colors.text }}
              >
                Job Status
              </h3>
              <div className="flex gap-4 mb-6">
                {["Active", "Disabled"].map((stat) => (
                  <button
                    key={stat}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, jobStatus: stat })
                    }
                    className="flex-1 py-2 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
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

              <h3
                className="text-sm font-bold mb-4"
                style={{ color: colors.text }}
              >
                Pricing Model
              </h3>
              <div className="flex gap-4 mb-4">
                {["free", "paid"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, priceType: type })
                    }
                    className="flex-1 py-2 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
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
                <div className="space-y-1 mb-6">
                  <label style={labelStyle}>Unlock Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm font-bold"
                    style={inputStyle}
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-md font-bold transition-all shadow-md text-sm uppercase tracking-wider active:scale-[0.98] cursor-pointer mb-3 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                <Save size={18} /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/jobs")}
                className="w-full py-3 rounded-md font-bold transition-all border text-xs uppercase tracking-wider opacity-60 hover:opacity-100 cursor-pointer"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center p-20 opacity-40">Job not found</div>
      )}
    </div>
  );
}

export default EditJob;
