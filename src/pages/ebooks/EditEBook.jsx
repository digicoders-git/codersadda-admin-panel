import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { updateEbook, getEbookById } from "../../apis/ebook";
import { getCourseCategories } from "../../apis/courseCategory";
import { ChevronLeft, Upload, Check } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import ModernSelect from "../../components/ModernSelect";

function EditEBook() {
  const { id } = useParams();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [ebookCategories, setEbookCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    authorName: "",
    category: "",
    priceType: "free",
    price: "",
    fileSize: "",
    description: "",
    fileName: "",
    isActive: true,
  });
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ebRes, catRes] = await Promise.all([
          getEbookById(id),
          getCourseCategories(),
        ]);

        if (catRes.success) setEbookCategories(catRes.data);

        if (ebRes.success && ebRes.data) {
          const data = ebRes.data;
          setFormData({
            title: data.title || "",
            authorName: data.authorName || "",
            category: data.category?._id || data.category || "",
            priceType: (data.priceType || "free").toLowerCase(),
            price: data.price || "",
            fileSize: data.fileSize || "",
            description: data.description || "",
            fileName: data.fileName || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
          });
        } else {
          toast.error("E-Book not found");
          navigate("/dashboard/ebooks");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load data");
        navigate("/dashboard/ebooks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData({
        ...formData,
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB",
      });
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setImage(selectedImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title && formData.category) {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (file) data.append("pdf", file);
      if (image) data.append("image", image);

      try {
        setActionLoading(true);
        const res = await updateEbook(id, data);
        if (res.success) {
          toast.success("E-Book updated successfully!");
          navigate("/dashboard/ebooks");
        } else {
          toast.error(res.message || "Failed to update E-Book");
        }
      } catch (err) {
        toast.error("Error updating ebook");
      } finally {
        setActionLoading(false);
      }
    } else {
      toast.error("Please fill required fields");
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };
  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "20",
    color: colors.text,
  };

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* {actionLoading && <Loader size={128} fullPage={true} />} */}
      {/* Header */}
      <div className="shrink-0 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/ebooks")}
            className="p-2 rounded-xl transition-all hover:bg-black/5 cursor-pointer"
            style={{ color: colors.text }}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Edit E-Book
            </h1>
            <p
              className="text-xs font-bold opacity-40 uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Update your digital resource details
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader size={80} />
          </div>
        ) : (
          <div
            className="bg-white/5 rounded-2xl border p-8"
            style={{
              borderColor: colors.accent + "15",
              backgroundColor: colors.sidebar || colors.background,
            }}
          >
            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label style={labelStyle}>E-Book Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Flutter Complete Guide"
                      className="w-full px-4 py-3 rounded border outline-none font-semibold text-sm transition-all focus:border-primary"
                      style={inputStyle}
                    />
                  </div>

                  <div className="space-y-2">
                    <label style={labelStyle}>Author Name</label>
                    <input
                      type="text"
                      required
                      value={formData.authorName}
                      onChange={(e) =>
                        setFormData({ ...formData, authorName: e.target.value })
                      }
                      placeholder="Ex: Dr. Angela Yu"
                      className="w-full px-4 py-3 rounded border outline-none font-semibold text-sm transition-all"
                      style={inputStyle}
                    />
                  </div>

                  <div className="space-y-2">
                    <label style={labelStyle}>Category</label>
                    <ModernSelect
                      options={ebookCategories.map((cat) => ({
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

                  <div className="space-y-2">
                    <label style={labelStyle}>Cover Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="w-full px-4 py-3 rounded border border-dashed flex items-center gap-3 transition-all"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "40",
                          color: colors.text,
                        }}
                      >
                        <Upload size={18} className="opacity-50" />
                        <span className="text-sm font-semibold truncate">
                          {image
                            ? image.name
                            : "Click to replace Cover Image..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & File */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label style={labelStyle}>Pricing System</label>
                    <div className="flex gap-4">
                      {["free", "paid"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, priceType: type })
                          }
                          className={`flex-1 py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${formData.priceType === type ? "" : "opacity-40"}`}
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
                  </div>

                  {formData.priceType === "paid" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label style={labelStyle}>Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="Ex: 499"
                        className="w-full px-4 py-3 rounded border outline-none font-semibold text-sm transition-all"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label style={labelStyle}>Upload PDF File</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="w-full px-4 py-3 rounded border border-dashed flex items-center gap-3 transition-all"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "40",
                          color: colors.text,
                        }}
                      >
                        <Upload size={18} className="opacity-50" />
                        <span className="text-sm font-semibold truncate">
                          {file
                            ? file.name
                            : formData.fileName || "Click to upload New PDF..."}
                        </span>
                      </div>
                    </div>
                    {formData.fileSize && (
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Size: {formData.fileSize}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label style={labelStyle}>E-Book Status</label>
                    <div className="flex gap-4">
                      {[true, false].map((active) => (
                        <button
                          key={active ? "Active" : "Disabled"}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, isActive: active })
                          }
                          className={`flex-1 py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${formData.isActive === active ? "" : "opacity-40"}`}
                          style={{
                            backgroundColor:
                              formData.isActive === active
                                ? colors.primary
                                : "transparent",
                            color:
                              formData.isActive === active
                                ? colors.background
                                : colors.text,
                            borderColor:
                              formData.isActive === active
                                ? colors.primary
                                : colors.accent + "20",
                          }}
                        >
                          {active ? "Active" : "Disabled"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label style={labelStyle}>Description (Optional)</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell something about this book..."
                  className="w-full px-4 py-3 rounded border outline-none font-semibold text-sm transition-all resize-none"
                  style={inputStyle}
                />
              </div>

              <div
                className="pt-6 border-t"
                style={{ borderColor: colors.accent + "10" }}
              >
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-10 py-4 rounded font-bold uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 flex items-center gap-3 cursor-pointer disabled:opacity-70"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  {actionLoading ? (
                    <Loader size={18} variant="button" />
                  ) : (
                    <>
                      <Check size={20} /> Update E-Book
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditEBook;
