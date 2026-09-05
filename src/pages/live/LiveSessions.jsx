import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Radio, Square, Copy, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import liveSessionApi from "../../apis/liveSession";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

function LiveSessions() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await liveSessionApi.getAll();
      setSessions(res.data);
    } catch {
      toast.error("Failed to fetch live sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const filtered = sessions.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoLive = async (session) => {
    const result = await Swal.fire({
      title: "Go Live?",
      html: `<p>This will mark <b>${session.title}</b> as LIVE and students will see the Join button.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, Go Live!",
    });
    if (!result.isConfirmed) return;

    try {
      setActionLoading(session._id);
      await liveSessionApi.goLive(session._id);
      setSessions((prev) => prev.map((s) => s._id === session._id ? { ...s, status: "live" } : s));
      toast.success("Session is now LIVE!");

      // Show OBS credentials
      Swal.fire({
        title: "🎥 OBS Stream Credentials",
        html: `
          <div style="text-align:left; font-size:13px;">
            <p style="margin-bottom:8px;"><b>Server (Ingest Endpoint):</b></p>
            <code style="background:#f3f4f6;padding:6px 10px;border-radius:4px;display:block;word-break:break-all;margin-bottom:12px;">${session.ingestEndpoint}</code>
            <p style="margin-bottom:8px;"><b>Stream Key:</b></p>
            <code style="background:#f3f4f6;padding:6px 10px;border-radius:4px;display:block;word-break:break-all;">${session.streamKey}</code>
            <p style="margin-top:12px;color:#6b7280;font-size:12px;">OBS → Settings → Stream → Service: Custom → paste above values</p>
          </div>
        `,
        confirmButtonText: "Got it!",
        confirmButtonColor: "#EF4444",
      });
    } catch {
      toast.error("Failed to go live");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndLive = async (session) => {
    const { value: recordingUrl } = await Swal.fire({
      title: "End Live Session",
      input: "url",
      inputLabel: "Recording URL (S3 .m3u8 link) — leave empty if not ready",
      inputPlaceholder: "https://s3.amazonaws.com/...",
      showCancelButton: true,
      confirmButtonText: "End Session",
      confirmButtonColor: "#6B7280",
    });

    if (recordingUrl === undefined) return; // cancelled

    try {
      setActionLoading(session._id);
      await liveSessionApi.endLive(session._id, recordingUrl || "");
      setSessions((prev) => prev.map((s) => s._id === session._id ? { ...s, status: "ended", recordingUrl: recordingUrl || "" } : s));
      toast.success("Session ended. Students can now see the recording.");
    } catch {
      toast.error("Failed to end session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Session?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setActionLoading(id);
        await liveSessionApi.delete(id);
        setSessions((prev) => prev.filter((s) => s._id !== id));
        toast.success("Deleted successfully");
      } catch {
        toast.error("Failed to delete");
      } finally {
        setActionLoading(null);
      }
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status) => {
    const map = {
      scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled" },
      live: { bg: "bg-red-100", text: "text-red-700", label: "🔴 LIVE" },
      ended: { bg: "bg-gray-100", text: "text-gray-600", label: "Ended" },
    };
    const s = map[status] || map.scheduled;
    return <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Live Classes</h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Manage live streaming sessions</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/live/create")}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} /> Schedule Live Class
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={{ backgroundColor: colors.background, borderColor: colors.accent + "30", color: colors.text }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-20"><Loader size={80} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 opacity-40" style={{ color: colors.text }}>
          <Radio size={48} className="mx-auto mb-4" />
          <p className="font-bold">No live sessions yet</p>
          <p className="text-sm">Schedule your first live class</p>
        </div>
      ) : (
        <div className="rounded border overflow-hidden" style={{ borderColor: colors.accent + "20" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: colors.accent + "10" }}>
                {["Title / Topic", "Course", "Scheduled At", "Duration", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest opacity-60" style={{ color: colors.text }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((session, i) => (
                <tr
                  key={session._id}
                  style={{ backgroundColor: i % 2 === 0 ? colors.background : colors.accent + "05", borderTop: `1px solid ${colors.accent}15` }}
                >
                  <td className="px-4 py-3">
                    <p className="font-bold" style={{ color: colors.text }}>{session.title}</p>
                    <p className="text-xs opacity-50" style={{ color: colors.text }}>{session.topic}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold opacity-70" style={{ color: colors.text }}>
                    {session.course?.title || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold opacity-70" style={{ color: colors.text }}>
                    {formatDate(session.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold opacity-70" style={{ color: colors.text }}>
                    {session.durationMinutes} min
                  </td>
                  <td className="px-4 py-3">{statusBadge(session.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Go Live */}
                      {session.status === "scheduled" && (
                        <button
                          onClick={() => handleGoLive(session)}
                          disabled={actionLoading === session._id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: "#EF4444", color: "#fff" }}
                        >
                          {actionLoading === session._id ? <Loader size={14} variant="button" /> : <><Radio size={12} /> Go Live</>}
                        </button>
                      )}

                      {/* End Live */}
                      {session.status === "live" && (
                        <button
                          onClick={() => handleEndLive(session)}
                          disabled={actionLoading === session._id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: "#6B7280", color: "#fff" }}
                        >
                          {actionLoading === session._id ? <Loader size={14} variant="button" /> : <><Square size={12} /> End Live</>}
                        </button>
                      )}

                      {/* Copy stream key */}
                      {(session.status === "scheduled" || session.status === "live") && (
                        <button
                          onClick={() => copyToClipboard(session.streamKey, session._id + "_key")}
                          title="Copy Stream Key"
                          className="p-1.5 rounded border text-xs transition-all hover:bg-black/5 cursor-pointer"
                          style={{ borderColor: colors.accent + "30", color: colors.text }}
                        >
                          {copiedId === session._id + "_key" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(session._id)}
                        disabled={actionLoading === session._id}
                        className="p-1.5 rounded border text-xs transition-all hover:bg-red-50 cursor-pointer disabled:opacity-50"
                        style={{ borderColor: "#EF444430", color: "#EF4444" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LiveSessions;
