import React, { useEffect, useState, useCallback } from "react";
import { Plus, Eye, Radio, Square, EyeOff, X, RefreshCw, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import liveClassApi from "../../apis/liveClass";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import { getMediaUrl } from "../../utils/mediaUrl";
import LiveStreamPreviewModal from "../../components/LiveStreamPreviewModal";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SCHEDULED:   { label: "Scheduled",   bg: "#EFF6FF", color: "#3B82F6", dot: "#3B82F6" },
  LIVE_HIDDEN: { label: "Live (Hidden)",bg: "#FFF7ED", color: "#F97316", dot: "#F97316" },
  LIVE:        { label: "🔴 LIVE",     bg: "#FEF2F2", color: "#EF4444", dot: "#EF4444" },
  ENDED:       { label: "Ended",       bg: "#F9FAFB", color: "#6B7280", dot: "#9CA3AF" },
  PROCESSING:  { label: "Processing…", bg: "#FEFCE8", color: "#CA8A04", dot: "#EAB308" },
  RECORDED:    { label: "✅ Recorded", bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  CANCELLED:   { label: "Cancelled",  bg: "#FFF1F2", color: "#E11D48", dot: "#FDA4AF" },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ── Main Component ─────────────────────────────────────────────────────────
function LiveClasses() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ scheduled: 0, liveHidden: 0, live: 0, processing: 0, recorded: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [previewClass, setPreviewClass] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [classRes, statsRes] = await Promise.all([
        liveClassApi.getAll(),
        liveClassApi.getStats(),
      ]);
      setClasses(classRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 30s when any class is LIVE or LIVE_HIDDEN
  useEffect(() => {
    const hasLive = classes.some(c => ["LIVE", "LIVE_HIDDEN", "PROCESSING"].includes(c.status));
    if (!hasLive) return;
    const t = setInterval(fetchAll, 30000);
    return () => clearInterval(t);
  }, [classes, fetchAll]);

  const filtered = classes.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.courseId?.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructorId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Actions ────────────────────────────────────────────────────────────
  const withAction = async (id, fn, successMsg) => {
    setActionLoading(id);
    try {
      await fn();
      toast.success(successMsg);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShowOnApp = (cls) =>
    Swal.fire({
      title: "Show on App?",
      html: `<p>Students will see <b>${cls.title}</b> as 🔴 LIVE and can join.</p>`,
      icon: "question", showCancelButton: true,
      confirmButtonColor: "#EF4444", confirmButtonText: "Yes, Show on App!",
    }).then(r => r.isConfirmed && withAction(cls._id, () => liveClassApi.showOnApp(cls._id), "Class is now LIVE for students!"));

  const handleHide = (cls) =>
    Swal.fire({
      title: "Hide from App?",
      html: `<p>Students will not see <b>${cls.title}</b> until you show again.</p>`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#F97316", confirmButtonText: "Hide",
    }).then(r => r.isConfirmed && withAction(cls._id, () => liveClassApi.hideFromApp(cls._id), "Class hidden from students"));

  const handleCancel = (cls) =>
    Swal.fire({
      title: "Cancel Class?",
      text: "This cannot be undone.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#EF4444", confirmButtonText: "Cancel Class",
    }).then(r => r.isConfirmed && withAction(cls._id, () => liveClassApi.cancel(cls._id), "Class cancelled"));

  const handleDelete = (cls) =>
    Swal.fire({
      title: "Delete Class?",
      text: "This will permanently delete the class record.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#EF4444", confirmButtonText: "Delete",
    }).then(r => r.isConfirmed && withAction(cls._id, () => liveClassApi.delete(cls._id).then(() => setClasses(p => p.filter(c => c._id !== cls._id))), "Deleted"));

  const inputStyle = { backgroundColor: colors.background, borderColor: colors.accent + "30", color: colors.text };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-20 pt-4 px-4 h-full overflow-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Live Classes</h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-0.5">
            SRS-powered live streaming
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            title="Refresh"
            className="p-2.5 rounded border transition-all hover:bg-black/5 cursor-pointer"
            style={{ borderColor: colors.accent + "30", color: colors.text }}
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => navigate("/dashboard/live-classes/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: colors.primary, color: colors.background }}
          >
            <Plus size={16} /> Schedule Class
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Scheduled",   value: stats.scheduled,  color: "#3B82F6" },
          { label: "Live Hidden", value: stats.liveHidden, color: "#F97316" },
          { label: "🔴 Live",    value: stats.live,        color: "#EF4444" },
          { label: "Processing",  value: stats.processing, color: "#EAB308" },
          { label: "✅ Recorded", value: stats.recorded,   color: "#22C55E" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-lg border p-4 text-center"
            style={{ borderColor: s.color + "30", backgroundColor: s.color + "0A" }}
          >
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value ?? 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1" style={{ color: colors.text }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
        <input
          type="text"
          placeholder="Search classes, course, teacher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded border outline-none text-sm font-semibold"
          style={inputStyle}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader size={60} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 opacity-40" style={{ color: colors.text }}>
          <Radio size={48} className="mx-auto mb-3" />
          <p className="font-bold">No classes found</p>
          <p className="text-sm mt-1">Schedule your first live class above</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: colors.accent + "20" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: colors.accent + "10" }}>
                {["Class Title", "Course", "Instructor", "Scheduled At", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest opacity-60" style={{ color: colors.text }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((cls, i) => {
                const sc = STATUS_CONFIG[cls.status] || STATUS_CONFIG.SCHEDULED;
                const busy = actionLoading === cls._id;
                return (
                  <tr
                    key={cls._id}
                    style={{
                      backgroundColor: i % 2 === 0 ? colors.background : colors.accent + "05",
                      borderTop: `1px solid ${colors.accent}15`,
                    }}
                  >
                    {/* Title & Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getMediaUrl(cls.thumbnailUrl || cls.courseId?.thumbnail) ? (
                          <img
                            src={getMediaUrl(cls.thumbnailUrl || cls.courseId?.thumbnail)}
                            alt={cls.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/100x60?text=Live";
                            }}
                            className="w-12 h-8 rounded object-cover border shrink-0 bg-black/5"
                            style={{ borderColor: colors.accent + "30" }}
                          />
                        ) : (
                          <div
                            className="w-12 h-8 rounded flex items-center justify-center border shrink-0 bg-black/5"
                            style={{ borderColor: colors.accent + "20" }}
                          >
                            <Radio size={14} className="opacity-30" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-[200px]" style={{ color: colors.text }}>{cls.title}</p>
                          {cls.topic && (
                            <p className="text-[11px] font-semibold text-blue-500 truncate max-w-[200px]">{cls.topic}</p>
                          )}
                          {cls.description && (
                            <p className="text-xs opacity-40 mt-0.5 truncate max-w-[200px]" style={{ color: colors.text }}>{cls.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-4 py-3 font-semibold opacity-70 text-xs" style={{ color: colors.text }}>
                      {cls.courseId?.title || "—"}
                    </td>

                    {/* Instructor */}
                    <td className="px-4 py-3 text-xs font-semibold opacity-70" style={{ color: colors.text }}>
                      {cls.instructorId?.fullName || "—"}
                    </td>

                    {/* Scheduled At */}
                    <td className="px-4 py-3 text-xs font-semibold opacity-70" style={{ color: colors.text }}>
                      {formatDate(cls.scheduledAt)}
                      {cls.expectedDurationMinutes && (
                        <span className="block opacity-50">{cls.expectedDurationMinutes} min</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {cls.status === "LIVE" && (
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sc.dot }} />
                        )}
                        {sc.label}
                      </span>
                      {cls.status === "LIVE_HIDDEN" && (
                        <p className="text-[9px] opacity-50 mt-1" style={{ color: colors.text }}>Admin preview only</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {busy && <Loader size={18} variant="button" />}

                        {/* Show on App — only when LIVE_HIDDEN */}
                        {!busy && cls.status === "LIVE_HIDDEN" && (
                          <button
                            onClick={() => handleShowOnApp(cls)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                            style={{ backgroundColor: "#EF4444", color: "#fff" }}
                            title="Show to students"
                          >
                            <Eye size={11} /> Show on App
                          </button>
                        )}

                        {/* Hide from App — only when LIVE */}
                        {!busy && cls.status === "LIVE" && (
                          <button
                            onClick={() => handleHide(cls)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                            style={{ backgroundColor: "#F97316", color: "#fff" }}
                            title="Hide from students"
                          >
                            <EyeOff size={11} /> Hide
                          </button>
                        )}

                        {/* Preview Stream in Embedded Video Player Modal */}
                        {!busy && ["SCHEDULED", "LIVE_HIDDEN", "LIVE"].includes(cls.status) && cls.streamName && (
                          <button
                            onClick={() => setPreviewClass(cls)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all hover:bg-black/5"
                            style={{ borderColor: colors.accent + "30", color: colors.text }}
                            title="Open Live Video Preview"
                          >
                            <Radio size={11} className={cls.status === "LIVE" ? "text-red-500 animate-pulse" : ""} /> Preview
                          </button>
                        )}

                        {/* Watch Recording */}
                        {!busy && cls.status === "RECORDED" && cls.recordingUrl && (
                          <a
                            href={cls.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all hover:bg-black/5"
                            style={{ borderColor: "#22C55E30", color: "#16A34A" }}
                          >
                            ▶ Recording
                          </a>
                        )}

                        {/* Cancel — only SCHEDULED */}
                        {!busy && cls.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleCancel(cls)}
                            className="p-1.5 rounded border text-[10px] cursor-pointer hover:bg-orange-50 transition-all"
                            style={{ borderColor: "#F9731630", color: "#F97316" }}
                            title="Cancel class"
                          >
                            <X size={13} />
                          </button>
                        )}

                        {/* Delete — only SCHEDULED / CANCELLED / RECORDED / ENDED */}
                        {!busy && ["SCHEDULED", "CANCELLED", "RECORDED", "ENDED"].includes(cls.status) && (
                          <button
                            onClick={() => handleDelete(cls)}
                            className="p-1.5 rounded border text-[10px] cursor-pointer hover:bg-red-50 transition-all"
                            style={{ borderColor: "#EF444430", color: "#EF4444" }}
                            title="Delete class"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Live Stream Embedded Preview Modal */}
      {previewClass && (
        <LiveStreamPreviewModal
          classData={previewClass}
          isOpen={!!previewClass}
          onClose={() => setPreviewClass(null)}
          onStatusChange={(id, newStatus) => {
            setClasses((prev) =>
              prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
            );
            fetchAll();
          }}
        />
      )}
    </div>
  );
}

export default LiveClasses;
