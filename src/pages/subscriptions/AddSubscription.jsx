import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Hash,
  BookOpen,
  FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription as apiUpdateSubscription,
} from "../../apis/subscription";
import { getAllCourses } from "../../apis/course";
import { getEbooks } from "../../apis/ebook";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";

function AddSubscription() {
  const { colors } = useTheme();
  // const { subscriptions, addSubscription, updateSubscription, courses, ebooks } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    planType: "",
    duration: "1 Month",
    planPricingType: "paid",
    price: "",
    freeJobs: "",
    planBenefits: [""],
    includedCourses: [],
    includedEbooks: [],
    planStatus: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, ebooksRes] = await Promise.all([
          getAllCourses(),
          getEbooks(),
        ]);
        if (coursesRes.success) setCourses(coursesRes.data);
        if (ebooksRes.success) setEbooks(ebooksRes.data);

        if (isEdit) {
          const res = await getSubscriptionById(id);
          if (res.success && res.data) {
            const found = res.data;
            setFormData({
              ...found,
              includedCourses: found.includedCourses
                ? found.includedCourses.map((c) => c._id)
                : [],
              includedEbooks: found.includedEbooks
                ? found.includedEbooks.map((e) => e._id)
                : [],
              planBenefits: found.planBenefits || [""],
              planPricingType: found.planPricingType || "paid",
            });
          } else {
            toast.error("Plan not found");
            navigate("/dashboard/subscriptions");
          }
        }
      } catch (error) {
        toast.error("Failed to fetch dependencies");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, isEdit]);

  const handleAddBenefit = () => {
    setFormData({ ...formData, planBenefits: [...formData.planBenefits, ""] });
  };

  const handleBenefitChange = (index, value) => {
    const updated = [...formData.planBenefits];
    updated[index] = value;
    setFormData({ ...formData, planBenefits: updated });
  };

  const handleRemoveBenefit = (index) => {
    if (formData.planBenefits.length > 1) {
      setFormData({
        ...formData,
        planBenefits: formData.planBenefits.filter((_, i) => i !== index),
      });
    }
  };

  const handleCourseToggle = (courseId) => {
    const updated = formData.includedCourses.includes(courseId)
      ? formData.includedCourses.filter((id) => id !== courseId)
      : [...formData.includedCourses, courseId];
    setFormData({ ...formData, includedCourses: updated });
  };

  const handleEbookToggle = (ebookId) => {
    const updated = formData.includedEbooks.includes(ebookId)
      ? formData.includedEbooks.filter((id) => id !== ebookId)
      : [...formData.includedEbooks, ebookId];
    setFormData({ ...formData, includedEbooks: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.planType) {
      toast.warning("Please enter a plan type");
      return;
    }
    if (!formData.price) {
      toast.warning("Please enter a price");
      return;
    }

    const cleanBenefits = formData.planBenefits.filter((b) => b.trim() !== "");
    const dataToSave = { ...formData, planBenefits: cleanBenefits };

    try {
      setActionLoading(true);
      if (isEdit) {
        const res = await apiUpdateSubscription(id, dataToSave);
        if (res.success) {
          toast.success("Subscription plan updated");
          navigate("/dashboard/subscriptions");
        }
      } else {
        const res = await createSubscription(dataToSave);
        if (res.success) {
          toast.success("New subscription plan added");
          navigate("/dashboard/subscriptions");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving plan");
    } finally {
      setActionLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "30",
    color: colors.text,
  };
  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8">
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
            {isEdit ? "Edit Plan" : "Add New Plan"}
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Subscription Management
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-full space-y-6">
        {/* Basic Details */}
        <div
          className="p-6 rounded border shadow-sm space-y-6"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-wider opacity-60"
            style={{ color: colors.text }}
          >
            Basic Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label style={labelStyle}>Plan Type</label>
              <input
                type="text"
                required
                value={formData.planType}
                onChange={(e) =>
                  setFormData({ ...formData, planType: e.target.value })
                }
                placeholder="e.g. Mobile, Premium"
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                style={inputStyle}
              />
            </div>

            <div className="space-y-1">
              <label style={labelStyle}>Duration</label>
              <ModernSelect
                options={[
                  { value: "1 Month", label: "1 Month" },
                  { value: "3 Months", label: "3 Months" },
                  { value: "6 Months", label: "6 Months" },
                  { value: "1 Year", label: "1 Year" },
                ]}
                value={formData.duration}
                onChange={(value) =>
                  setFormData({ ...formData, duration: value })
                }
                placeholder="Select Duration"
              />
            </div>

            <div className="space-y-1">
              <label style={labelStyle}>Price (₹)</label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                  size={18}
                />
                <input
                  type="number"
                  disabled={formData.planPricingType === "free"}
                  value={
                    formData.planPricingType === "free" ? 0 : formData.price
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="e.g. 299"
                  className="w-full pl-10 pr-4 py-2.5 rounded border outline-none text-sm font-semibold"
                  style={{
                    ...inputStyle,
                    opacity: formData.planPricingType === "free" ? 0.5 : 1,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label style={labelStyle}>Plan Pricing Type</label>
              <ModernSelect
                options={[
                  { value: "paid", label: "Paid" },
                  { value: "free", label: "Free" },
                ]}
                value={formData.planPricingType}
                onChange={(value) =>
                  setFormData({ ...formData, planPricingType: value })
                }
                placeholder="Select Pricing Type"
              />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Free Jobs</label>
              <div className="relative">
                {/* <Hash className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} /> */}
                <input
                  type="number"
                  required
                  value={formData.freeJobs}
                  onChange={(e) =>
                    setFormData({ ...formData, freeJobs: e.target.value })
                  }
                  placeholder="e.g. 3"
                  className="w-full pl-5 pr-4 py-2.5 rounded border outline-none text-sm font-semibold"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label style={labelStyle}>Plan Status</label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {[true, false].map((stat) => (
                <button
                  key={stat ? "Active" : "Disabled"}
                  type="button"
                  onClick={() => setFormData({ ...formData, planStatus: stat })}
                  className="py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      formData.planStatus === stat
                        ? colors.primary
                        : "transparent",
                    color:
                      formData.planStatus === stat
                        ? colors.background
                        : colors.text,
                    borderColor:
                      formData.planStatus === stat
                        ? colors.primary
                        : colors.accent + "20",
                  }}
                >
                  {stat ? "Active" : "Disabled"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div
          className="p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-bold uppercase tracking-wider opacity-60"
              style={{ color: colors.text }}
            >
              Plan Benefits
            </h3>
            <button
              type="button"
              onClick={handleAddBenefit}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all hover:opacity-100 opacity-60 cursor-pointer"
              style={{ color: colors.primary }}
            >
              <Plus size={14} /> Add Benefit
            </button>
          </div>

          <div className="space-y-3">
            {formData.planBenefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="e.g. HD Quality Streaming"
                  className="flex-1 px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(index)}
                  className="p-2.5 text-red-500 rounded hover:bg-red-50 transition-all border border-transparent cursor-pointer"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Courses */}
        <div
          className="p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: colors.primary }} />
            <h3
              className="text-sm font-bold uppercase tracking-wider opacity-60"
              style={{ color: colors.text }}
            >
              Included Courses
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.map((course) => (
              <label
                key={course._id}
                className="flex items-center gap-3 p-3 rounded border cursor-pointer transition-all hover:bg-black/5"
                style={{
                  borderColor: formData.includedCourses.includes(course._id)
                    ? colors.primary
                    : colors.accent + "20",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.includedCourses.includes(course._id)}
                  onChange={() => handleCourseToggle(course._id)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: colors.primary }}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-semibold block truncate"
                    style={{ color: colors.text }}
                  >
                    {course.title}
                  </span>
                  {course.badge && course.badge !== "Normal" && (
                    <span className="text-[8px] font-black uppercase text-amber-500">
                      {course.badge}
                    </span>
                  )}
                </div>
              </label>
            ))}
            {courses.length === 0 && (
              <p className="text-xs opacity-40 italic col-span-2">
                No courses available
              </p>
            )}
          </div>
        </div>

        {/* E-Books */}
        <div
          className="p-6 rounded border shadow-sm space-y-4"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: colors.primary }} />
            <h3
              className="text-sm font-bold uppercase tracking-wider opacity-60"
              style={{ color: colors.text }}
            >
              Included E-Books
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ebooks.map((ebook) => (
              <label
                key={ebook._id}
                className="flex items-center gap-3 p-3 rounded border cursor-pointer transition-all hover:bg-black/5"
                style={{
                  borderColor: formData.includedEbooks.includes(ebook._id)
                    ? colors.primary
                    : colors.accent + "20",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.includedEbooks.includes(ebook._id)}
                  onChange={() => handleEbookToggle(ebook._id)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: colors.primary }}
                />
                <span
                  className="text-sm font-semibold flex-1"
                  style={{ color: colors.text }}
                >
                  {ebook.title}
                </span>
              </label>
            ))}
            {ebooks.length === 0 && (
              <p className="text-xs opacity-40 italic col-span-2">
                No e-books available
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={actionLoading}
            className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            {actionLoading ? (
              <Loader size={18} variant="button" />
            ) : (
              <>
                <Save size={18} /> {isEdit ? "Update Plan" : "Publish Plan"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/subscriptions")}
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

export default AddSubscription;
