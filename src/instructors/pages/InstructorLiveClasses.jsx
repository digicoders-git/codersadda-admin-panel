import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Radio,
  Calendar,
  Clock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Video,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import http from "../../apis/http";
import { toast } from "react-toastify";
import { getMediaUrl } from "../../utils/mediaUrl";

const InstructorLiveClasses = () => {
  const { colors } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState(null);
  const [obsLoading, setObsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const res = await http.get("/live-class/instructor/classes");
      if (res.data?.success) {
        setClasses(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load your live classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const openObsModal = async (classItem) => {
    try {
      setObsLoading(true);
      setSelectedObs(null);
      setShowKey(false);
      const res = await http.get(
        `/live-class/instructor/classes/${classItem._id}/obs`
      );
      if (res.data?.success) {
        setSelectedObs({
          classInfo: classItem,
          ...res.data.data,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load OBS configuration");
    } finally {
      setObsLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: { bg: "#3b82f620", text: "#3b82f6", label: "Scheduled" },
      LIVE_HIDDEN: { bg: "#eab30820", text: "#eab308", label: "Live (Preview)" },
      LIVE: { bg: "#ef444420", text: "#ef4444", label: "● LIVE ON APP" },
      ENDED: { bg: "#6b728020", text: "#6b7280", label: "Ended" },
      PROCESSING: { bg: "#a855f720", text: "#a855f7", label: "Processing Recording" },
      RECORDED: { bg: "#22c55e20", text: "#22c55e", label: "Recorded" },
      CANCELLED: { bg: "#64748b20", text: "#64748b", label: "Cancelled" },
    };
    const b = badges[status] || { bg: "#64748b20", text: "#64748b", label: status };
    return (
      <span
        className="px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5"
        style={{ backgroundColor: b.bg, color: b.text }}
      >
        {b.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Radio className="text-red-500 animate-pulse" size={26} />
            My Live Classes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your live teaching sessions and obtain OBS stream keys
          </p>
        </div>
        <button
          onClick={fetchMyClasses}
          className="px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 hover:opacity-80 transition"
          style={{
            borderColor: colors.accent + "40",
            color: colors.text,
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Guide Banner */}
      <div
        className="p-4 rounded-2xl border flex items-start gap-3.5"
        style={{
          backgroundColor: colors.card || colors.background,
          borderColor: "#3b82f630",
        }}
      >
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
          <Info size={20} />
        </div>
        <div className="text-sm space-y-1">
          <p className="font-semibold" style={{ color: colors.text }}>
            How to go live using OBS Studio:
          </p>
          <p className="text-gray-500">
            1. Click <b>"Get OBS Stream Key"</b> on your scheduled class. <br />
            2. Open OBS Studio &rarr; Settings &rarr; Stream &rarr; Select Service: <b>Custom...</b> <br />
            3. Paste the <b>Server URL</b> and <b>Stream Key</b> &rarr; Click <b>Start Streaming</b>. <br />
            4. Once you start streaming, the Admin will preview and make it Live for students!
          </p>
        </div>
      </div>

      {/* Classes List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-2 text-sm">Loading your classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border p-8"
          style={{
            backgroundColor: colors.card || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <Video className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            No Live Classes Scheduled
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
            You do not have any upcoming live classes assigned right now. Please check with your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-lg"
              style={{
                backgroundColor: colors.card || colors.background,
                borderColor: colors.accent + "30",
              }}
            >
              <div className="space-y-3">
                {getMediaUrl(item.thumbnailUrl || item.courseId?.thumbnail) && (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 border" style={{ borderColor: colors.accent + "20" }}>
                    <img
                      src={getMediaUrl(item.thumbnailUrl || item.courseId?.thumbnail)}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x180?text=Live+Class";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-medium truncate max-w-[160px]">
                    {item.courseId?.title || "Course"}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3
                  className="font-semibold text-lg line-clamp-2"
                  style={{ color: colors.text }}
                >
                  {item.title}
                </h3>

                {item.topic && (
                  <p className="text-xs font-semibold text-blue-500 line-clamp-1">
                    Topic: {item.topic}
                  </p>
                )}

                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="pt-2 border-t space-y-1.5 text-xs text-gray-500" style={{ borderColor: colors.accent + "20" }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>
                      {item.scheduledAt || item.scheduledStartTime
                        ? new Date(item.scheduledAt || item.scheduledStartTime).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      {item.scheduledAt || item.scheduledStartTime
                        ? new Date(item.scheduledAt || item.scheduledStartTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                      {item.expectedDurationMinutes && ` (${item.expectedDurationMinutes} min)`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t" style={{ borderColor: colors.accent + "20" }}>
                <button
                  onClick={() => openObsModal(item)}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white transition shadow-md hover:opacity-90"
                  style={{
                    backgroundColor: colors.primary || "#0045e7",
                  }}
                >
                  <Key size={16} />
                  Get OBS Stream Key
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OBS Modal */}
      {selectedObs && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="rounded-3xl border w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
            style={{
              backgroundColor: colors.card || "#1e293b",
              borderColor: colors.accent + "40",
              color: colors.text,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Key className="text-yellow-500" size={20} />
                  OBS Studio Setup
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedObs.classInfo?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedObs(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Server Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Server (RTMP URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedObs.streamUrl}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-black/30 border border-gray-700 select-all"
                />
                <button
                  onClick={() => copyToClipboard(selectedObs.streamUrl, "Server URL")}
                  className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition flex-shrink-0"
                  title="Copy Server URL"
                >
                  {copiedField === "Server URL" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Stream Key Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Stream Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  readOnly
                  value={selectedObs.streamKey}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-black/30 border border-gray-700 select-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition flex-shrink-0"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(selectedObs.streamKey, "Stream Key")}
                  className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition flex-shrink-0"
                  title="Copy Stream Key"
                >
                  {copiedField === "Stream Key" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300/90 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} /> Keep this key confidential!
              </p>
              <p className="text-[11px] opacity-80">
                Anyone with this stream key can stream directly to your live session.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedObs(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-700/50 hover:bg-gray-700 text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorLiveClasses;
