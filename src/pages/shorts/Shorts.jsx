import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Video,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getShorts,
  deleteShort as apiDeleteShort,
  updateShort as apiUpdateShort,
  toggleShortStatus as apiToggleShortStatus,
} from "../../apis/short";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";

function Shorts() {
  const { colors } = useTheme();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchShorts = async () => {
    try {
      const res = await getShorts();
      if (res.success) {
        setShorts(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch shorts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredShorts = shorts.filter(
    (short) =>
      short.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      short.instructorName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Short?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await apiDeleteShort(id);
          if (res.success) {
            setShorts((prev) => prev.filter((s) => s._id !== id));
            toast.success("Short deleted successfully!");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Error deleting short");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(id);
      const res = await apiToggleShortStatus(id);
      if (res.success) {
        setShorts((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s)),
        );
        toast.info(`Short status updated`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* {actionLoading && <Loader size={128} fullPage={true} />} */}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Shorts Videos
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Manage short form content
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/shorts/add")}
          className="flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
          }}
        >
          <Plus size={18} /> Add Short
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
            size={18}
          />
          <input
            type="text"
            placeholder="Search shorts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none text-sm font-semibold"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
              color: colors.text,
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-20">
            <Loader size={80} />
          </div>
        ) : (
          filteredShorts.map((short) => (
            <div
              key={short._id}
              className="rounded border overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              {/* Video Preview / Placeholder */}
              <div className="relative aspect-[9/16] bg-black/5 flex items-center justify-center overflow-hidden group">
                <video
                  src={short.video?.url}
                  className={`w-full h-full object-cover transition-opacity ${!short.isActive ? "opacity-50 grayscale" : ""}`}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <Video className="text-white opacity-80" size={48} />
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white flex items-center gap-1">
                  <Play size={10} fill="white" /> Preview
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${short.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {short.isActive ? "Active" : "Disabled"}
                  </span>
                  <Toggle
                    active={short.isActive}
                    onClick={() =>
                      handleToggleStatus(short._id, short.isActive)
                    }
                  />
                </div>

                <h3
                  className="text-sm font-bold line-clamp-2 mb-1"
                  style={{ color: colors.text }}
                >
                  {short.caption}
                </h3>
                <p
                  className="text-xs opacity-60 font-semibold mb-4"
                  style={{ color: colors.text }}
                >
                  {short.instructorName}
                </p>

                <div
                  className="flex items-center gap-4 mb-4 text-xs font-bold opacity-50"
                  style={{ color: colors.text }}
                >
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {short.totalLikes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {short.totalComments || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 size={12} /> {short.totalShares || 0}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/shorts/view/${short._id}`)
                    }
                    className="flex-1 cursor-pointer py-2 rounded border text-xs font-bold uppercase tracking-wider transition-all hover:bg-black/5 flex items-center justify-center gap-1"
                    style={{
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/shorts/edit/${short._id}`)
                    }
                    className="p-2 cursor-pointer rounded border text-xs font-bold uppercase tracking-wider transition-all hover:bg-black/5"
                    style={{
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(short._id)}
                    disabled={actionLoading === short._id}
                    className="p-2 cursor-pointer rounded border text-xs font-bold uppercase tracking-wider transition-all hover:bg-red-50 disabled:opacity-50"
                    style={{ borderColor: "#EF444430", color: "#EF4444" }}
                  >
                    {actionLoading === short._id ? (
                      <Loader size={14} variant="button" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Icon helper
const Play = ({ size, fill }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill || "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

export default Shorts;
