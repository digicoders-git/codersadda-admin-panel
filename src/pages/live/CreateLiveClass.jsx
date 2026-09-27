import React, { useEffect, useState, useRef } from "react";
import { Radio, ArrowLeft, Video, Image as ImageIcon, X, Upload } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import liveClassApi from "../../apis/liveClass";
import { getAllCourses } from "../../apis/course";
import { getInstructors } from "../../apis/instructor";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function CreateLiveClass({
  courseId: propCourseId,
  courseName: propCourseName,
  instructorId: propInstructorId,
  onSuccess,
  onCancel,
}) {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const initialCourseId = propCourseId || searchParams.get("courseId") || "";
  const initialInstructorId = propInstructorId || searchParams.get("instructorId") || "";

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [form, setForm] = useState({
    courseId: initialCourseId,
    instructorId: initialInstructorId,
    title: "",
    topic: "",
    description: "",
    scheduledAt: "",
    expectedDurationMinutes: 60,
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Fetch courses and instructors for dropdowns
  useEffect(() => {
    let isMounted = true;
    setFetchingData(true);

    Promise.all([
      getAllCourses({ limit: 1000 }).catch((err) => {
        console.error("Failed to load courses:", err);
        return { courses: [] };
      }),
      getInstructors({ limit: 1000 }).catch((err) => {
        console.error("Failed to load instructors:", err);
        return { instructors: [] };
      }),
    ])
      .then(([cRes, iRes]) => {
        if (!isMounted) return;
        const fetchedCourses = cRes?.courses || cRes?.data?.courses || cRes?.data || [];
        const fetchedInstructors = iRes?.instructors || iRes?.data?.instructors || iRes?.data || [];
        setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);
        setInstructors(Array.isArray(fetchedInstructors) ? fetchedInstructors : []);

        // If course is selected, auto-select its assigned instructor if available
        if (initialCourseId && !initialInstructorId) {
          const selectedC = (Array.isArray(fetchedCourses) ? fetchedCourses : []).find(
            (c) => c._id === initialCourseId
          );
          if (selectedC?.instructor?._id || selectedC?.instructor) {
            const instId = selectedC.instructor._id || selectedC.instructor;
            setForm((prev) => ({ ...prev, instructorId: instId }));
          }
        }
      })
      .finally(() => {
        if (isMounted) setFetchingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCourseId, initialInstructorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "courseId") {
        const found = courses.find((c) => c._id === value);
        if (found?.instructor) {
          updated.instructorId = found.instructor._id || found.instructor;
        }
      }
      return updated;
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.instructorId || !form.title || !form.scheduledAt) {
      toast.error("Course, Instructor, Title and Date/Time are required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("courseId", form.courseId);
      formData.append("instructorId", form.instructorId);
      formData.append("title", form.title);
      formData.append("topic", form.topic);
      formData.append("description", form.description);
      formData.append("scheduledAt", form.scheduledAt);
      formData.append("expectedDurationMinutes", form.expectedDurationMinutes);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      await liveClassApi.create(formData);
      toast.success("Live class scheduled! Stream credentials auto-generated.");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard/live-classes");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule class");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "30",
    color: colors.text,
  };

  const labelStyle = "block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60";

  const isEmbedded = Boolean(propCourseId || onSuccess);

  return (
    <div className={isEmbedded ? "w-full p-2" : "w-full pb-20 pt-4 px-4 h-full overflow-auto"}>
      <div className={isEmbedded ? "w-full" : "max-w-2xl mx-auto"}>

        {/* Header (Only if full page) */}
        {!isEmbedded && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 rounded border transition-all hover:bg-black/5 cursor-pointer"
              style={{ borderColor: colors.accent + "30", color: colors.text }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.text }}>Schedule Live Class</h1>
              <p className="text-xs opacity-40 uppercase tracking-widest mt-0.5">
                Stream credentials will be auto-generated
              </p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{ borderColor: "#3B82F630", backgroundColor: "#EFF6FF" }}
        >
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-1.5">
            <Video size={14} /> SRS Live Streaming Workflow
          </p>
          <ul className="text-xs text-blue-700 space-y-1 mt-2 list-disc ml-4">
            <li>Schedule the class — stream key is generated automatically</li>
            <li>Teacher gets RTMP credentials from their panel or OBS Setup</li>
            <li>Teacher goes live via OBS &rarr; Admin previews & clicks <b>"Show on App"</b></li>
            <li>Class ends &rarr; Recording compressed via FFmpeg & saved automatically</li>
          </ul>
        </div>

        {fetchingData ? (
          <div className="flex items-center justify-center p-12">
            <Loader size={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Course */}
            <div>
              <label className={labelStyle} style={{ color: colors.text }}>Course *</label>
              {propCourseId ? (
                <div
                  className="w-full px-4 py-2.5 rounded border text-sm font-bold bg-black/5"
                  style={{ borderColor: colors.accent + "30", color: colors.text }}
                >
                  {propCourseName || courses.find((c) => c._id === propCourseId)?.title || "Selected Course"}
                </div>
              ) : (
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold cursor-pointer"
                  style={inputStyle}
                  required
                >
                  <option value="">— Select Course —</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Instructor */}
            <div>
              <label className={labelStyle} style={{ color: colors.text }}>Instructor (Teacher) *</label>
              <select
                name="instructorId"
                value={form.instructorId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold cursor-pointer"
                style={inputStyle}
                required
              >
                <option value="">— Select Instructor —</option>
                {instructors.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.fullName} ({i.email || i.phone || "Instructor"})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className={labelStyle} style={{ color: colors.text }}>Class Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Live Masterclass: React Hooks & State Management"
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                style={inputStyle}
                required
              />
            </div>

            {/* Topic */}
            <div>
              <label className={labelStyle} style={{ color: colors.text }}>Topic / Subtitle</label>
              <input
                type="text"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder="e.g. useEffect, useMemo, custom hooks"
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                style={inputStyle}
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className={labelStyle} style={{ color: colors.text }}>
                Class Thumbnail (Poster Image)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This image will be displayed in the App & Dashboard until the class goes live.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="hidden"
              />

              {thumbnailPreview ? (
                <div className="relative rounded-xl border overflow-hidden max-w-sm" style={{ borderColor: colors.accent + "30" }}>
                  <img
                    src={thumbnailPreview}
                    alt="Class Thumbnail Preview"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
                    title="Remove Thumbnail"
                  >
                    <X size={16} />
                  </button>
                  <div className="p-2 bg-black/40 text-[11px] text-white truncate text-center">
                    {thumbnailFile?.name}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition hover:bg-black/5 flex flex-col items-center justify-center gap-2"
                  style={{ borderColor: colors.accent + "40" }}
                >
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                    <Upload size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: colors.text }}>
                      Click to upload Thumbnail Image
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      PNG, JPG, WEBP (Recommended: 16:9 ratio, 1280x720)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={labelStyle} style={{ color: colors.text }}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What will be covered in this live session?"
                rows={3}
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold resize-none"
                style={inputStyle}
              />
            </div>

            {/* Date & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle} style={{ color: colors.text }}>Date & Time *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className={labelStyle} style={{ color: colors.text }}>Duration (minutes)</label>
                <input
                  type="number"
                  name="expectedDurationMinutes"
                  value={form.expectedDurationMinutes}
                  onChange={handleChange}
                  min={15}
                  max={480}
                  className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-7 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: colors.primary, color: colors.background }}
              >
                {loading ? <Loader size={14} variant="button" /> : <><Radio size={14} /> Schedule Live Class</>}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all hover:bg-black/5 cursor-pointer"
                style={{ borderColor: colors.accent + "30", color: colors.text }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateLiveClass;
