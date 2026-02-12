import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Lock,
  Info,
  Layout,
  Award,
  CheckCircle2,
  DollarSign,
  Upload,
  Video,
  Image as ImageIcon,
  X,
  Star,
} from "lucide-react";
import { createCourse } from "../../apis/course";
import { getCourseCategories } from "../../apis/courseCategory";
import { getInstructors } from "../../apis/instructor";
import { getAllCertificateTemplates } from "../../apis/certificate";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../components/Loader";

function AddCourse() {
  const { colors } = useTheme();
  // const { categories, addCourse, instructors } = useData(); // Removed
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        console.log("Fetching instructors and categories...");
        const [catsRes, insRes, templatesRes] = await Promise.all([
          getCourseCategories(),
          getInstructors(),
          getAllCertificateTemplates(),
        ]);
        if (catsRes.success) {
          setCategories(catsRes.data.filter((cat) => cat.isActive));
        }

        if (insRes.success) {
          setInstructors(insRes.data.filter((ins) => ins.isActive));
        }

        if (templatesRes.success) {
          setTemplates(templatesRes.data);
        }
      } catch (error) {
        console.error("Error fetching dependencies:", error);
        toast.error("Failed to fetch dependencies: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  const initialFormState = {
    title: "",
    instructor: "", // Will store instructor ID
    priceForInstructor: "",
    thumbnailFile: null, // Actual file object
    thumbnailPreview: "", // For preview
    promoVideoFile: null, // Actual file object
    promoVideoPreview: "", // For preview
    description: "",
    category: "", // Will store category ID
    technology: "",
    priceType: "free",
    price: "",
    badge: "normal",
    whatYouWillLearn: [""],
    faqs: [],
    reviews: [],
    status: "Active",
  };

  const [formData, setFormData] = useState(initialFormState);

  // File Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be under 5MB");
        return;
      }
      setFormData({
        ...formData,
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        promoVideoFile: file,
        promoVideoPreview: URL.createObjectURL(file),
      });
      toast.info("Video selected: " + file.name);
    }
  };

  const removeVideo = () => {
    setFormData({ ...formData, promoVideoFile: null, promoVideoPreview: "" });
  };

  const handleAddWhatYoullLearn = () => {
    setFormData({
      ...formData,
      whatYouWillLearn: [...formData.whatYouWillLearn, ""],
    });
  };

  const handleRemoveWhatYoullLearn = (index) => {
    const newList = formData.whatYouWillLearn.filter((_, i) => i !== index);
    setFormData({ ...formData, whatYouWillLearn: newList });
  };

  const handleWhatYoullLearnChange = (index, value) => {
    const newList = [...formData.whatYouWillLearn];
    newList[index] = value;
    setFormData({ ...formData, whatYouWillLearn: newList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.category || !formData.instructor) {
      toast.warning("Please fill in all required fields");
      return;
    }

    if (formData.priceType === "paid" && !formData.price) {
      toast.warning("Please enter course price");
      return;
    }

    try {
      setActionLoading(true);
      // Create FormData for multipart/form-data
      const payload = new FormData();

      // Add basic fields
      payload.append("title", formData.title);
      payload.append("instructor", formData.instructor); // ID
      payload.append("category", formData.category); // ID
      payload.append("technology", formData.technology || "");
      payload.append("description", formData.description || "");
      payload.append("priceForInstructor", formData.priceForInstructor || "0");
      payload.append("priceType", formData.priceType);
      payload.append("badge", formData.badge);
      payload.append("isActive", formData.status === "Active");

      // Add price only if paid
      if (formData.priceType === "paid") {
        payload.append("price", formData.price);
      }

      // Add whatYouWillLearn as JSON string
      const validLearningPoints = formData.whatYouWillLearn.filter(
        (point) => point.trim() !== "",
      );
      if (validLearningPoints.length > 0) {
        payload.append("whatYouWillLearn", JSON.stringify(validLearningPoints));
      }

      // Add FAQs as JSON string
      if (formData.faqs && formData.faqs.length > 0) {
        payload.append("faqs", JSON.stringify(formData.faqs));
      }

      // Add reviews as JSON string (filter out empty names/comments)
      const validReviews = (formData.reviews || []).filter(
        (rev) => rev.studentName?.trim() !== "" || rev.comment?.trim() !== "",
      );
      if (validReviews.length > 0) {
        payload.append("reviews", JSON.stringify(validReviews));
      }

      // Add files
      if (formData.thumbnailFile) {
        payload.append("thumbnail", formData.thumbnailFile);
      }

      if (formData.promoVideoFile) {
        payload.append("promoVideo", formData.promoVideoFile);
      }

      const res = await createCourse(payload);
      if (res.success) {
        toast.success("Course created successfully!");
        navigate("/dashboard/courses");
      }
    } catch (error) {
      console.error("Course creation error:", error);
      toast.error(error.response?.data?.message || "Error creating course");
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
          Add New Course
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={80} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-full mx-auto space-y-6">
          {/* General Information */}
          <div
            className="p-6 rounded-lg border shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h2
              className="text-lg font-bold mb-6 flex items-center gap-2"
              style={{ color: colors.primary }}
            >
              <Info
                size={18}
                className="text-primary"
                style={{ color: colors.primary }}
              />{" "}
              General Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label style={labelStyle}>Course Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value.replace(/[0-9]/g, ""),
                    })
                  }
                  placeholder="Enter course title"
                  className="w-full px-4 py-2 rounded-md border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
              <div className="flex gap-3 w-full">
                <div className="space-y-1 w-full">
                  <label style={labelStyle}>Instructor Name</label>
                  <ModernSelect
                    options={instructors.map((ins) => ({
                      value: ins._id,
                      label: ins.fullName || ins.name || "Unknown",
                    }))}
                    value={formData.instructor}
                    onChange={(value) =>
                      setFormData({ ...formData, instructor: value })
                    }
                    placeholder="Select Instructor"
                    required
                  />
                </div>
                <div className="space-y-1 w-full">
                  <label style={labelStyle}>Price(%) for Instructor</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.priceForInstructor}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      // Ensure only one decimal point
                      const parts = val.split(".");
                      const cleanVal =
                        parts.length > 2
                          ? parts[0] + "." + parts.slice(1).join("")
                          : val;
                      setFormData({
                        ...formData,
                        priceForInstructor: cleanVal,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "+" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="15 (without % sign)"
                    className="w-full px-4 py-2 rounded-md border outline-none transition-all text-sm"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label style={labelStyle}>Category</label>
                <ModernSelect
                  options={categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  }))}
                  value={formData.category}
                  onChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  placeholder="Select Category"
                  required
                />
              </div>
              <div className="space-y-1">
                <label style={labelStyle}>Technology</label>
                <input
                  type="text"
                  value={formData.technology}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      technology: e.target.value.replace(/[0-9]/g, ""),
                    })
                  }
                  placeholder="Ex: React, Flutter"
                  className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Price Type</label>
                <div className="flex gap-2">
                  {["free", "paid"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          priceType: type,
                          price: type === "free" ? "" : formData.price,
                        })
                      }
                      className={`flex-1 py-2 rounded-md border text-sm font-semibold transition-all cursor-pointer ${
                        formData.priceType === type ? "shadow-sm" : "opacity-50"
                      }`}
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
                            : colors.accent + "30",
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {formData.priceType === "paid" && (
                <div className="space-y-1">
                  <label style={labelStyle}>Course Price (₹)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={formData.price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = val.split(".");
                      const cleanVal =
                        parts.length > 2
                          ? parts[0] + "." + parts.slice(1).join("")
                          : val;
                      setFormData({ ...formData, price: cleanVal });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "+" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter course price"
                    className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>
              )}
              <div className="space-y-1">
                <label style={labelStyle}>Course Badge</label>
                <ModernSelect
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "top", label: "Top Course" },
                    { value: "popular", label: "Popular Course" },
                    { value: "trending", label: "Trending Course" },
                  ]}
                  value={formData.badge}
                  onChange={(value) =>
                    setFormData({ ...formData, badge: value })
                  }
                  placeholder="Select Badge"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description & Learning Objectives */}
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
              <Layout
                size={18}
                className="text-primary"
                style={{ color: colors.primary }}
              />{" "}
              Course Details
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Course Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what students will learn..."
                  className="w-full px-4 py-3 rounded-md border outline-none resize-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                ></textarea>
              </div>

              <div className="space-y-2">
                <label style={labelStyle}>What you will learn</label>
                <div className="space-y-2">
                  {formData.whatYouWillLearn.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) =>
                          handleWhatYoullLearnChange(
                            index,
                            e.target.value.replace(/[0-9]/g, ""),
                          )
                        }
                        placeholder={`Point ${index + 1}`}
                        className="flex-1 px-4 py-2 rounded-md border outline-none text-sm"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "30",
                          color: colors.text,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveWhatYoullLearn(index)}
                        className="p-2 text-red-500 border rounded-md hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddWhatYoullLearn}
                  className="mt-2 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                  style={{ color: colors.primary }}
                >
                  <Plus size={16} /> Add Point
                </button>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div
            className="p-6 rounded border shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-4"
              style={{ color: colors.text }}
            >
              Course Assets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Thumbnail Image</label>
                <div
                  onClick={() => imageInputRef.current.click()}
                  className="relative h-40 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-black/5"
                  style={{
                    borderColor: colors.accent + "30",
                    backgroundColor: colors.background,
                  }}
                >
                  {formData.thumbnailPreview ? (
                    <img
                      src={formData.thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="text-center opacity-40"
                      style={{ color: colors.text }}
                    >
                      <ImageIcon size={32} className="mx-auto mb-2" />
                      <p className="text-xs font-bold">Upload Image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Promo Video</label>
                <div
                  onClick={() => videoInputRef.current.click()}
                  className="relative h-40 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/5"
                  style={{
                    borderColor: colors.accent + "30",
                    backgroundColor: colors.background,
                  }}
                >
                  {formData.promoVideoFile ? (
                    <div className="text-center p-4">
                      <Video
                        size={32}
                        className="mx-auto mb-2"
                        style={{ color: colors.primary }}
                      />
                      <p
                        className="text-xs font-bold truncate"
                        style={{ color: colors.text }}
                      >
                        {formData.promoVideoFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVideo();
                        }}
                        className="mt-2 text-[10px] text-red-500 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      className="text-center opacity-40"
                      style={{ color: colors.text }}
                    >
                      <Video size={32} className="mx-auto mb-2" />
                      <p className="text-xs font-bold">Upload Video</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Actions - Sections Added Here */}

          {/* FAQs Section */}
          <div
            className="p-6 rounded border shadow-sm space-y-6"
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
                Course FAQs
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    faqs: [...(prev.faqs || []), { question: "", answer: "" }],
                  }))
                }
                className="text-[10px] font-black uppercase tracking-widest text-blue-500 cursor-pointer hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add FAQ
              </button>
            </div>

            <div className="space-y-4">
              {(formData.faqs || []).map((faq, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 rounded bg-black/5"
                >
                  <div className="flex-1 space-y-3">
                    <input
                      style={{ color: colors.text }}
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...(formData.faqs || [])];
                        newFaqs[index].question = e.target.value.replace(
                          /[0-9]/g,
                          "",
                        );
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder="Question"
                      className="w-full bg-transparent border-b border-black/10 outline-none text-sm font-bold"
                    />
                    <textarea
                      style={{ color: colors.text }}
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...(formData.faqs || [])];
                        newFaqs[index].answer = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder="Answer"
                      rows={2}
                      className="w-full bg-transparent outline-none text-xs opacity-80 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFaqs = formData.faqs.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, faqs: newFaqs });
                    }}
                    className="text-red-500 opacity-50 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!formData.faqs || formData.faqs.length === 0) && (
                <p
                  className="text-xs opacity-40 text-center py-4"
                  style={{ color: colors.text }}
                >
                  No FAQs added yet.
                </p>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div
            className="p-6 rounded border shadow-sm space-y-6"
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
                Course Reviews
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    reviews: [
                      ...(prev.reviews || []),
                      { studentName: "", rating: 5, comment: "" },
                    ],
                  }))
                }
                className="text-[10px] font-black uppercase tracking-widest text-blue-500 cursor-pointer hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Review
              </button>
            </div>

            <div className="space-y-4">
              {(formData.reviews || []).map((review, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 rounded bg-black/5"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <input
                        style={{ color: colors.text }}
                        type="text"
                        value={review.studentName}
                        onChange={(e) => {
                          const newReviews = [...(formData.reviews || [])];
                          newReviews[index].studentName =
                            e.target.value.replace(/[0-9]/g, "");
                          setFormData({ ...formData, reviews: newReviews });
                        }}
                        placeholder="Student Name"
                        className="flex-1 bg-transparent border-b border-black/10 outline-none text-sm font-bold"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold opacity-60">
                          Rating:
                        </span>
                        <select
                          value={review.rating}
                          onChange={(e) => {
                            const newReviews = [...(formData.reviews || [])];
                            newReviews[index].rating = Number(e.target.value);
                            setFormData({ ...formData, reviews: newReviews });
                          }}
                          className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <Star
                          size={12}
                          fill="currentColor"
                          className="text-yellow-500"
                        />
                      </div>
                    </div>
                    <textarea
                      style={{ color: colors.text }}
                      value={review.comment}
                      onChange={(e) => {
                        const newReviews = [...(formData.reviews || [])];
                        newReviews[index].comment = e.target.value;
                        setFormData({ ...formData, reviews: newReviews });
                      }}
                      placeholder="Review Comment"
                      rows={2}
                      className="w-full bg-transparent outline-none text-xs opacity-80 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newReviews = formData.reviews.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, reviews: newReviews });
                    }}
                    className="text-red-500 opacity-50 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!formData.reviews || formData.reviews.length === 0) && (
                <p
                  className="text-xs opacity-40 text-center py-4"
                  style={{ color: colors.text }}
                >
                  No reviews added yet.
                </p>
              )}
            </div>
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
              Course Status
            </h3>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {["Active", "Disabled"].map((stat) => (
                <button
                  key={stat}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: stat })}
                  className="py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{
                    backgroundColor:
                      formData.status === stat ? colors.primary : "transparent",
                    color:
                      formData.status === stat
                        ? colors.background
                        : colors.text,
                    borderColor:
                      formData.status === stat
                        ? colors.primary
                        : colors.accent + "20",
                  }}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              {actionLoading ? (
                <Loader size={18} variant="button" />
              ) : (
                "Publish Course"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/courses")}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all cursor-pointer"
              style={{ color: colors.text, borderColor: colors.accent + "30" }}
            >
              Discard
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddCourse;
