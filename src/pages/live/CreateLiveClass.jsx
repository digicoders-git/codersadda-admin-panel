import React, { useEffect, useState } from "react";
import { Radio, ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import liveClassApi from "../../apis/liveClass";
import http from "../../apis/http";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function CreateLiveClass() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [form, setForm] = useState({
    courseId: "",
    instructorId: "",
    title: "",
    description: "",
    scheduledAt: "",
    expectedDurationMinutes: 60,
  });

  // Fetch courses and instructors for dropdowns
  useEffect(() => {
    Promise.all([
      http.get("/course?limit=100&isActive=true").catch(() => ({ data: [] })),
      http.get("/instructor?limit=100").catch(() => ({ data: [] })),
    ]).then(([cRes, iRes]) => {
      setCourses(cRes.data?.courses || cRes.data || []);
      setInstructors(iRes.data?.instructors || iRes.data || []);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.instructorId || !form.title || !form.scheduledAt) {
      toast.error("Course, Instructor, Title and Date/Time are required");
      return;
    }
    setLoading(true);
    try {
      await liveClassApi.create({
        ...form,
        expectedDurationMinutes: Number(form.expectedDurationMinutes),
      });
      toast.success("Live class scheduled! Stream credentials generated.");
      navigate("/dashboard/live-classes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule class");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "30",
    color: colors.text,
  };

  const labelStyle = "block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60";

  return (
    <div className="w-full pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
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

        {/* Info Banner */}
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{ borderColor: "#3B82F630", backgroundColor: "#EFF6FF" }}
        >
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">
            🎬 How it works
          </p>
          <ul className="text-xs text-blue-700 space-y-1 mt-2 list-disc ml-4">
            <li>Schedule the class — stream key is generated automatically</li>
            <li>Teacher gets RTMP credentials from their panel</li>
            <li>Teacher goes live via OBS → you see "Live Hidden" in dashboard</li>
            <li>You preview → click "Show on App" → students can join</li>
            <li>Class ends → recording processed automatically</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Course */}
          <div>
            <label className={labelStyle} style={{ color: colors.text }}>Course *</label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
              style={inputStyle}
              required
            >
              <option value="">— Select Course —</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Instructor */}
          <div>
            <label className={labelStyle} style={{ color: colors.text }}>Instructor (Teacher) *</label>
            <select
              name="instructorId"
              value={form.instructorId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
              style={inputStyle}
              required
            >
              <option value="">— Select Instructor —</option>
              {instructors.map(i => (
                <option key={i._id} value={i._id}>{i.fullName}</option>
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
              placeholder="e.g. React Hooks — useEffect Deep Dive"
              className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
              style={inputStyle}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelStyle} style={{ color: colors.text }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What will be covered in this class?"
              rows={3}
              className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold resize-none"
              style={inputStyle}
            />
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: colors.primary, color: colors.background }}
            >
              {loading ? <Loader size={14} variant="button" /> : <><Radio size={14} /> Schedule Class</>}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all hover:bg-black/5 cursor-pointer"
              style={{ borderColor: colors.accent + "30", color: colors.text }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLiveClass;
