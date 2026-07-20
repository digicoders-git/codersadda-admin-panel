import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  BookOpen,
  Loader2,
  X,
  Maximize2,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllCertificateTemplates,
  deleteCertificateTemplate,
  toggleCertificateTemplateStatus,
} from "../../apis/certificate";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import Toggle from "../../components/ui/Toggle";
import CertificatePreviewCanvas from "../../components/CertificatePreviewCanvas";

export default function ManageCertificates() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showModalContent, setShowModalContent] = useState(false);

  useEffect(() => {
    // Load fonts for canvas
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lobster&family=Pacifico&family=Great+Vibes&family=Satisfy&family=Kaushan+Script&family=Dancing+Script&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    fetchTemplates();

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getAllCertificateTemplates();
      if (res.success) {
        setTemplates(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(id);
      const res = await toggleCertificateTemplateStatus(id);
      if (res.success) {
        setTemplates((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: res.status } : t)),
        );
        toast.success(res.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error toggling status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the certificate template for this course.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await deleteCertificateTemplate(id);
          if (res.success) {
            setTemplates((prev) => prev.filter((t) => t._id !== id));
            toast.success("Template deleted successfully!");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error deleting template",
          );
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const filteredTemplates = templates.filter((template) => {
    const name = template.certificateName || "";
    const course = template.course?.title || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden p-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative">
          <h1
            className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight"
            style={{ color: colors.text }}
          >
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
            Manage Certificates
          </h1>
          <p
            className="text-xs md:text-sm font-semibold opacity-40 mt-1 uppercase tracking-widest"
            style={{ color: colors.text }}
          >
            Manage and design course completion certificates
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 transition-opacity group-focus-within:opacity-100"
              style={{ color: colors.text }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 rounded border outline-none text-xs font-semibold transition-all"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "15",
                color: colors.text,
              }}
            />
          </div>

          <button
            onClick={() => navigate("/dashboard/courses/generate-certificate")}
            className="flex-none px-6 py-2.5 cursor-pointer rounded font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="flex-1 min-h-0 flex flex-col rounded border w-full overflow-hidden"
        style={{
          borderColor: colors.accent + "10",
          backgroundColor: colors.sidebar || colors.background,
        }}
      >
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center p-20 h-64">
              <Loader size={80} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-auto">
              <thead
                className="sticky top-0 z-30"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                }}
              >
                <tr
                  style={{
                    borderBottom: `2.5px solid ${colors.accent}15`,
                  }}
                >
                  <th
                    className="px-6 py-5 text-[10px] uppercase tracking-[2px] w-20 text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Sr.
                  </th>
                  <th
                    className="px-6 py-5 text-[10px] uppercase tracking-[2px]"
                    style={{ color: colors.textSecondary }}
                  >
                    Associated Course
                  </th>
                  <th
                    className="px-6 py-5 text-[10px] uppercase tracking-[2px]"
                    style={{ color: colors.textSecondary }}
                  >
                    Template Name
                  </th>
                  <th
                    className="px-6 py-5 text-[10px] uppercase tracking-[2px] text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-5 text-[10px] uppercase tracking-[2px] text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Real Preview
                  </th>
                  <th
                    className="px-6 py-5 text-[10px]  uppercase tracking-[2px] text-right"
                    style={{ color: colors.textSecondary }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ divideColor: colors.accent + "05" }}
              >
                {filteredTemplates.map((template, index) => (
                  <tr
                    key={template._id}
                    className="hover:bg-slate-500/5 transition-colors group"
                    style={{ color: colors.text }}
                  >
                    <td className="px-6 py-4 text-xs font-black opacity-20 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 rounded overflow-hidden border shadow-sm shrink-0">
                          {template.course?.thumbnail?.url ? (
                            <img
                              src={template.course.thumbnail.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <BookOpen size={14} className="opacity-20" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold truncate max-w-[200px]">
                          {template.course?.title || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award
                          size={16}
                          style={{ color: colors.primary }}
                          className="opacity-60"
                        />
                        <span className="text-sm font-semibold">
                          {template.certificateName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Toggle
                          active={template.status}
                          onClick={() =>
                            handleToggleStatus(template._id, template.status)
                          }
                        />
                        <span
                          className={`text-[8px] font-black uppercase tracking-tighter ${template.status ? "text-green-500" : "text-red-500"}`}
                        >
                          {template.status ? "ACTIVE" : "DISABLED"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div
                          className="relative group/img w-24 h-16 rounded overflow-hidden border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                          onClick={() => {
                            setPreviewTemplate(template);
                            setShowModalContent(true);
                          }}
                        >
                          <CertificatePreviewCanvas
                            template={template}
                            width={120}
                            height={80}
                            className="w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 size={16} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              "/dashboard/courses/generate-certificate",
                              { state: { courseId: template.course?._id } },
                            )
                          }
                          className="p-2.5 cursor-pointer rounded transition-all hover:bg-opacity-20"
                          style={{
                            color: colors.primary,
                            backgroundColor: colors.primary + "10",
                          }}
                          title="Edit Template"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          disabled={actionLoading === template._id}
                          onClick={() => handleDelete(template._id)}
                          className="p-2.5 cursor-pointer rounded transition-all hover:bg-opacity-20 disabled:opacity-50"
                          style={{
                            color: "#ef4444",
                            backgroundColor: "#ef444415",
                          }}
                          title="Delete Template"
                        >
                          {actionLoading === template._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {templates.length === 0 && !loading && (
        <div
          className="text-center py-20 rounded border-2 border-dashed flex flex-col items-center justify-center gap-4 opacity-30 mt-8"
          style={{
            borderColor: colors.accent + "15",
            color: colors.textSecondary,
          }}
        >
          <Award size={64} />
          <div>
            <p className="text-xl font-black uppercase tracking-widest">
              No Templates Found
            </p>
            <p className="text-sm font-semibold mt-1">
              Start by creating a certificate design for a course
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/courses/generate-certificate")}
            className="mt-4 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Create Your First Template
          </button>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10 overflow-hidden">
          {/* Subtle Overlay with Light Blur */}
          <div
            className={`absolute inset-0 bg-black/20 backdrop-blur-[4px] transition-opacity duration-500 ease-in-out ${
              showModalContent ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              setShowModalContent(false);
              setTimeout(() => setPreviewTemplate(null), 500);
            }}
          />

          {/* Animated Container with Smooth Scaling */}
          <div
            className={`relative max-w-[95vw] max-h-[90vh] flex items-center justify-center transition-all duration-500 transform ease-out ${
              showModalContent
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-90 opacity-0 translate-y-10"
            }`}
          >
            <button
              onClick={() => {
                setShowModalContent(false);
                setTimeout(() => setPreviewTemplate(null), 500);
              }}
              className="absolute -top-12 right-0 md:top-2 md:-right-12 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10 cursor-pointer shadow-xl"
            >
              <X size={24} />
            </button>
            <div className="rounded shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border-4 border-white/20 overflow-hidden bg-white flex items-center justify-center">
              <CertificatePreviewCanvas
                template={previewTemplate}
                width={previewTemplate.width || 1200}
                height={previewTemplate.height || 800}
                className="max-w-full max-h-[90vh] object-contain block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
