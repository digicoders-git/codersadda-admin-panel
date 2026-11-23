import React, { useState } from "react";
import { Radio } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import liveSessionApi from "../../apis/liveSession";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

// courseId and onSuccess are passed as props when used inside ViewCourse
function CreateLiveSession({ courseId, courseName, onSuccess, onCancel }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    teacherName: "",
    scheduledAt: "",
    durationMinutes: 60,
    playbackUrl: "",      // e.g. YouTube Live link, HLS URL, Zoom link
    streamKey: "",        // Optional: OBS stream key
    ingestEndpoint: "",   // Optional: RTMP ingest endpoint
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) {
      toast.error("Title and Scheduled At are required");
      return;
    }

    setLoading(true);
    try {
      await liveSessionApi.create({
        ...form,
        course: courseId,
        durationMinutes: Number(form.durationMinutes),
        status: "scheduled",
      });
      toast.success("Live session scheduled!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "30",
    color: colors.text,
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold" style={{ color: colors.text }}>Schedule Live Class</h2>
        {courseName && (
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">
            Course: {courseName}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
            Session Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. State Management in Flutter"
            className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={inputStyle}
            required
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
            Topic
          </label>
          <input
            type="text"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="e.g. Provider, Riverpod, BLoC"
            className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={inputStyle}
          />
        </div>

        {/* Teacher Name */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
            Teacher Name
          </label>
          <input
            type="text"
            name="teacherName"
            value={form.teacherName}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={inputStyle}
          />
        </div>

        {/* Date & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
              Date & Time *
            </label>
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
            <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
              Duration (minutes)
            </label>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              min={15}
              max={480}
              className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Playback / Stream URL */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
            Live / Playback URL
          </label>
          <input
            type="url"
            name="playbackUrl"
            value={form.playbackUrl}
            onChange={handleChange}
            placeholder="e.g. YouTube Live link, Zoom link, HLS .m3u8 URL"
            className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={inputStyle}
          />
          <p className="text-[10px] opacity-40 mt-1" style={{ color: colors.text }}>
            Students will see this link to join / watch the live class.
          </p>
        </div>

        {/* Optional OBS fields */}
        <details className="rounded border p-3" style={{ borderColor: colors.accent + "20" }}>
          <summary className="text-xs font-black uppercase tracking-widest opacity-50 cursor-pointer" style={{ color: colors.text }}>
            OBS Stream Credentials (Optional)
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
                RTMP Ingest Endpoint
              </label>
              <input
                type="text"
                name="ingestEndpoint"
                value={form.ingestEndpoint}
                onChange={handleChange}
                placeholder="rtmps://..."
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1.5 opacity-60" style={{ color: colors.text }}>
                Stream Key
              </label>
              <input
                type="text"
                name="streamKey"
                value={form.streamKey}
                onChange={handleChange}
                placeholder="Stream key for OBS"
                className="w-full px-4 py-2.5 rounded border outline-none text-sm font-semibold"
                style={inputStyle}
              />
            </div>
          </div>
        </details>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: colors.primary, color: colors.background }}
          >
            {loading ? <Loader size={14} variant="button" /> : <><Radio size={14} /> Schedule</>}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded border font-bold text-xs uppercase tracking-widest transition-all hover:bg-black/5 cursor-pointer"
              style={{ borderColor: colors.accent + "30", color: colors.text }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateLiveSession;
