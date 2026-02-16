import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Play,
  Lock,
  Info,
  Layout,
  Award,
  User,
  Plus,
  DollarSign,
  Upload,
  Video,
  Image as ImageIcon,
  X,
  Star,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getCourseById,
  updateCourse as apiUpdateCourse,
} from "../../apis/course";
import { getCourseCategories } from "../../apis/courseCategory";
import { getInstructors } from "../../apis/instructor";
import { getAllCertificateTemplates } from "../../apis/certificate";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function EditCourse() {
  const { colors } = useTheme();
  // const { categories, courses, updateCourse, instructors } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, catsRes, insRes, templatesRes] = await Promise.all([
          getCourseById(id),
          getCourseCategories(),
          getInstructors(),
          getAllCertificateTemplates(),
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (insRes.success) setInstructors(insRes.data);
        if (templatesRes.success) setTemplates(templatesRes.data);

        if (courseRes.success) {
          const course = courseRes.data;
          setFormData({
            ...course,
            instructor: course.instructor?._id || course.instructor || "",
            category: course.category?._id || course.category || "",
            priceType: (course.priceType || "free").toLowerCase(),
            description: course.description || course.about || "",
            thumbnailPreview: course.thumbnail?.url || course.image || "",
            thumbnailFile: null,
            promoVideoFile: null,
            promoVideoUrl: course.promoVideo?.url || course.promoVideoUrl || "",
            badge: (course.badge || "normal").toLowerCase(),
            status: course.isActive ? "Active" : "Disabled",
            priceForInstructor: course.priceForInstructor || 0,
            reviews: (course.reviews || []).map((r) => ({
              studentName: r.studentName || r.user || "",
              rating: r.rating || 5,
              comment: r.comment || "",
            })),
          });
        }
      } catch (error) {
        toast.error("Failed to fetch course data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // File Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be under 2MB");
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
        promoVideoUrl: URL.createObjectURL(file),
      });
      toast.info("Video selected: " + file.name);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, thumbnailFile: null, thumbnailPreview: "" });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeVideo = () => {
    setFormData({ ...formData, promoVideoFile: null, promoVideoUrl: "" });
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
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
    try {
      setActionLoading(true);
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("instructor", formData.instructor);
      payload.append("category", formData.category);
      payload.append("technology", formData.technology || "");
      payload.append("description", formData.description || "");
      payload.append("priceForInstructor", formData.priceForInstructor || "0");
      payload.append("priceType", formData.priceType);
      payload.append("badge", formData.badge);

      payload.append(
        "price",
        formData.priceType === "paid" ? formData.price : 0,
      );
      payload.append("isActive", formData.status === "Active");

      if (formData.reviews) {
        payload.append("reviews", JSON.stringify(formData.reviews));
      }

      if (formData.whatYouWillLearn) {
        payload.append(
          "whatYouWillLearn",
          JSON.stringify(formData.whatYouWillLearn),
        );
      }

      if (formData.faqs) {
        payload.append("faqs", JSON.stringify(formData.faqs));
      }

      if (formData.thumbnailFile) {
        payload.append("thumbnail", formData.thumbnailFile);
      }

      if (formData.promoVideoFile) {
        payload.append("promoVideo", formData.promoVideoFile);
      }

      const res = await apiUpdateCourse(id, payload);
      if (res.success) {
        toast.success("Course updated successfully!");
        navigate("/dashboard/courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating course");
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
    <div className="w-full mx-auto pb-20 pt-2 px-4 h-full overflow-auto">
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
          Edit Course
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : formData ? (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
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
                style={{ color: colors.text }}
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
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none transition-all text-sm"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="space-y-1 w-full">
                    <label style={labelStyle}>Instructor Name</label>
                    <select
                      required
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-md border outline-none cursor-pointer text-sm"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "30",
                        color: colors.text,
                      }}
                    >
                      <option value="">Select Instructor</option>
                      {(instructors || []).map((ins) => (
                        <option key={ins._id} value={ins._id}>
                          {ins.fullName || ins.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 w-full">
                    <label style={labelStyle}>Price (%) for Instructor</label>
                    <input
                      type="number"
                      required
                      value={formData.priceForInstructor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priceForInstructor: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-md border outline-none text-sm"
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
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none cursor-pointer text-sm"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Technology</label>
                  <input
                  required
                    type="text"
                    value={formData.technology}
                    onChange={(e) =>
                      setFormData({ ...formData, technology: e.target.value })
                    }
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
                        className={`flex-1 py-2 rounded-md border text-sm font-semibold transition-all cursor-pointer ${formData.priceType === type ? "shadow-sm" : "opacity-50"}`}
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
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {formData.priceType === "paid" ? (
                  <div className="space-y-1">
                    <label style={labelStyle}>Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "30",
                        color: colors.text,
                      }}
                    />
                  </div>
                ) : (
                  <div className="hidden md:block"></div>
                )}

                <div className="space-y-1">
                  <label style={labelStyle}>Course Badge</label>
                  <select
                    required
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md border outline-none cursor-pointer text-sm"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    <option value="normal">Normal</option>
                    <option value="top">Top Course</option>
                    <option value="popular">Popular Course</option>
                    <option value="trending">Trending Course</option>
                  </select>
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
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
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
                            handleWhatYoullLearnChange(index, e.target.value)
                          }
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

            {/* Media Assets - Thumb & Promo in a row */}
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
                <ImageIcon
                  size={18}
                  className="text-primary"
                  style={{ color: colors.primary }}
                />{" "}
                Course Assets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Thumbnail Image</label>
                  <div
                    onClick={() => imageInputRef.current.click()}
                    className="relative h-44 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-black/5"
                    style={{
                      borderColor: colors.accent + "30",
                      backgroundColor: colors.background,
                    }}
                  >
                    {formData.thumbnailPreview ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={formData.thumbnailPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center opacity-40">
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
                    className="h-44 rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative transition-all overflow-hidden"
                    style={{
                      borderColor: colors.accent + "30",
                      backgroundColor: colors.background,
                    }}
                  >
                    {formData.promoVideoFile || formData.promoVideoUrl ? (
                      <div className="relative w-full h-full group">
                        {formData.promoVideoUrl && (
                          <video
                            src={formData.promoVideoUrl}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Video size={24} className="text-white mb-1" />
                          <p className="text-[10px] text-white font-bold px-4 truncate w-full text-center">
                            {formData.promoVideoFile
                              ? formData.promoVideoFile.name
                              : "Current Video"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => videoInputRef.current.click()}
                              className="px-3 py-1 rounded bg-white text-black text-[10px] font-bold"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeVideo}
                              className="px-3 py-1 rounded bg-red-500 text-white text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => videoInputRef.current.click()}
                        className="text-center opacity-40 cursor-pointer w-full h-full flex flex-col items-center justify-center"
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
          </div>

          {/* Sidebar Controls - Now part of single column */}
          <div className="space-y-6">
            {/* Course Status */}
            {/* FAQs Section */}
            <div
              className="p-6 rounded border shadow-sm space-y-6"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
                  Course FAQs
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      faqs: [
                        ...(prev.faqs || []),
                        { question: "", answer: "" },
                      ],
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
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...(formData.faqs || [])];
                          newFaqs[index].question = e.target.value;
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                        placeholder="Question"
                        className="w-full bg-transparent border-b border-black/10 outline-none text-sm font-bold"
                      />
                      <textarea
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
                  <p className="text-xs opacity-40 text-center py-4">
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
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
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
                          type="text"
                          value={review.studentName}
                          onChange={(e) => {
                            const newReviews = [...(formData.reviews || [])];
                            newReviews[index].studentName = e.target.value;
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
                              setFormData({
                                ...formData,
                                reviews: newReviews,
                              });
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
                  <p className="text-xs opacity-40 text-center py-4">
                    No reviews added yet.
                  </p>
                )}
              </div>
            </div>

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
                Course Status
              </h3>
              <div className="flex gap-4">
                {["Active", "Disabled"].map((stat) => (
                  <button
                    key={stat}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: stat })}
                    className={`flex-1 py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      formData.status === stat
                        ? "bg-primary text-white border-primary"
                        : "bg-transparent opacity-40 border-accent/20"
                    }`}
                    style={{
                      backgroundColor:
                        formData.status === stat
                          ? colors.primary
                          : "transparent",
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

            {/* Submit */}
            <div
              className="p-6 rounded-lg border shadow-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <button
                type="submit"
                className="w-full py-3 rounded-md font-bold transition-all shadow-md text-sm uppercase tracking-wider active:scale-[0.98] cursor-pointer mb-3 disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader size={18} variant="button" />
                ) : (
                  "Update Course"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/courses")}
                className="w-full py-3 rounded-md font-bold transition-all border text-xs uppercase tracking-wider opacity-60 hover:opacity-100 cursor-pointer disabled:opacity-50"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center p-20 opacity-40">Course not found</div>
      )}
    </div>
  );
}

export default EditCourse;
