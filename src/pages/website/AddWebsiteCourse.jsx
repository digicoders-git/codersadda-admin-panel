import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { createCourse } from "../../apis/course";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";

function AddWebsiteCourse() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    courseType: "Beginner",
    title: "",
    technology: "",
    progress: 0,
    instructor: "",
    status: "Active",
    badge: "normal",
  });
  const [imageFile, setImageFile] = useState(null);
  const [instructorImageFile, setInstructorImageFile] = useState(null);
  const [preview, setPreview] = useState("https://via.placeholder.com/300x200");
  const [instructorPreview, setInstructorPreview] = useState(
    "https://via.placeholder.com/40x40",
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be under 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstructorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Instructor image size should be under 1MB");
        return;
      }
      setInstructorImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInstructorPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.technology || !formData.instructor) {
      toast.warning("Please fill in all required fields");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("technology", formData.technology);
    data.append("courseType", formData.courseType);
    data.append("progress", formData.progress);
    data.append("instructor", formData.instructor);
    data.append("status", formData.status);
    data.append("badge", formData.badge);

    if (imageFile) {
      data.append("image", imageFile);
    }
    if (instructorImageFile) {
      data.append("instructorImage", instructorImageFile);
    }

    try {
      const res = await createCourse(data);
      if (res.success) {
        toast.success("Course added successfully!");
        navigate("/dashboard/website/courses");
      }
    } catch (err) {
      toast.error("Failed to add course");
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
          Add Website Course
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div
          className="p-6 rounded-lg border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h2
            className="text-lg font-bold mb-6"
            style={{ color: colors.primary }}
          >
            Course Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Course Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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

              <div className="space-y-1">
                <label style={labelStyle}>Technology Stack *</label>
                <input
                  type="text"
                  required
                  value={formData.technology}
                  onChange={(e) =>
                    setFormData({ ...formData, technology: e.target.value })
                  }
                  placeholder="Ex: React, JavaScript"
                  className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Course Type</label>
                <ModernSelect
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advance", label: "Advance" },
                  ]}
                  value={formData.courseType}
                  onChange={(value) =>
                    setFormData({ ...formData, courseType: value })
                  }
                  placeholder="Select Course Type"
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      progress: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0-100"
                  className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label style={labelStyle}>Instructor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  placeholder="Enter instructor name"
                  className="w-full px-4 py-2 rounded-md border outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Badge</label>
                <ModernSelect
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "popular", label: "Popular" },
                    { value: "trending", label: "Trending" },
                    { value: "top", label: "Top" },
                  ]}
                  value={formData.badge}
                  onChange={(value) =>
                    setFormData({ ...formData, badge: value })
                  }
                  placeholder="Select Badge"
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Status</label>
                <ModernSelect
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Disabled", label: "Disabled" },
                  ]}
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  placeholder="Select Status"
                />
              </div>

              <div className="space-y-1">
                <label style={labelStyle}>Instructor Image</label>
                <div className="flex items-center gap-4">
                  <img
                    src={instructorPreview}
                    alt="Instructor"
                    className="w-16 h-16 rounded-full object-cover border"
                    style={{ borderColor: colors.accent + "30" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("instructorImageInput").click()
                    }
                    className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    Upload Image
                  </button>
                  <input
                    id="instructorImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleInstructorImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Image */}
        <div
          className="p-6 rounded-lg border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h2
            className="text-lg font-bold mb-6"
            style={{ color: colors.primary }}
          >
            Course Image
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <img
                src={preview}
                alt="Course"
                className="w-full h-48 object-cover rounded-lg border"
                style={{ borderColor: colors.accent + "30" }}
              />
            </div>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed transition-all cursor-pointer"
                style={{
                  borderColor: colors.accent + "40",
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
              >
                <Upload size={20} />
                Upload Course Image
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Recommended: 300x200px, Max size: 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Save size={18} />
            Add Course
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/website/courses")}
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

export default AddWebsiteCourse;
