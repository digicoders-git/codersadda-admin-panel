import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Eye,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Type,
  Layout,
  Grid,
  Loader2,
  Copy,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../../components/Loader";
import { getAllCourses } from "../../apis/course";
import {
  saveCertificateTemplate,
  getCertificateTemplate,
} from "../../apis/certificate";
import ModernSelect from "../../components/ModernSelect";
import Toggle from "../../components/ui/Toggle";

export default function GenerateCertificate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const canvasRef = useRef(null);
  const [draggingLayer, setDraggingLayer] = useState(null);
  const layerBounds = useRef([]);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lobster&family=Pacifico&family=Great+Vibes&family=Satisfy&family=Kaushan+Script&family=Dancing+Script&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    fetchCourses();

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses({ isActive: true, limit: 1000 });
      if (response.success) {
        const fetchedCourses = response.data || [];
        setCourses(fetchedCourses);
        // Pre-select course if coming from manage list
        if (location.state?.courseId) {
          handleCourseChange(location.state.courseId, fetchedCourses);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  const initialFormState = {
    name: "",
    image: null,
    imageFile: null,
    width: 1200, // default
    height: 800, // default
    studentName: {
      status: true,
      textColor: "#000000",
      verticalPosition: "400",
      horizontalPosition: "600",
      fontSize: "40px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    courseName: {
      status: true,
      textColor: "#000000",
      verticalPosition: "480",
      horizontalPosition: "600",
      fontSize: "30px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    certificateId: {
      status: true,
      textColor: "#000000",
      verticalPosition: "600",
      horizontalPosition: "960",
      fontSize: "18px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
    collegeName: {
      status: false,
      textColor: "#000000",
      verticalPosition: "200",
      horizontalPosition: "600",
      fontSize: "18px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
    issueDate: {
      status: true,
      textColor: "#000000",
      verticalPosition: "600",
      horizontalPosition: "240",
      fontSize: "18px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [sampleTexts, setSampleTexts] = useState({
    studentName: "Abhay",
    courseName: "Course Name",
    certificateId: "dct-2026",
    collegeName: "MMIT Kushinagar",
    issueDate: "27/01/2026",
  });

  const handleCourseChange = async (cid, fetchedCourses = courses) => {
    setSelectedCourse(cid);
    if (!cid) {
      setFormData(initialFormState);
      return;
    }

    const course = fetchedCourses.find((c) => c._id === cid);

    try {
      setLoading(true);
      const res = await getCertificateTemplate(cid);
      if (res.success && res.template) {
        const cert = res.template;
        setFormData({
          name: cert.certificateName,
          image: cert.certificateImage,
          imageFile: null,
          width: cert.width || 1200,
          height: cert.height || 800,
          studentName: cert.studentName || initialFormState.studentName,
          courseName:
            cert.courseName ||
            cert.assessmentName ||
            initialFormState.courseName,
          certificateId:
            cert.certificateId ||
            cert.assessmentCode ||
            initialFormState.certificateId,
          collegeName: cert.collegeName || initialFormState.collegeName,
          issueDate: cert.issueDate || cert.date || initialFormState.issueDate,
        });
        if (cert.sampleTexts) {
          setSampleTexts(cert.sampleTexts);
        } else if (course) {
          setSampleTexts((prev) => ({ ...prev, courseName: course.title }));
        }
      } else {
        setFormData({
          ...initialFormState,
          name: course ? `${course.title} Certificate` : "",
        });
        if (course) {
          setSampleTexts((prev) => ({ ...prev, courseName: course.title }));
        }
      }
    } catch (error) {
      setFormData({
        ...initialFormState,
        name: course ? `${course.title} Certificate` : "",
      });
      if (course) {
        setSampleTexts((prev) => ({ ...prev, courseName: course.title }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setFormData((prev) => ({
          ...prev,
          image: url,
          imageFile: file,
          width: img.width,
          height: img.height,
        }));
      };
      img.src = url;
    }
  };

  const updateNestedState = (section, field, value) => {
    if (
      (field === "verticalPosition" ||
        field === "horizontalPosition" ||
        field === "fontSize") &&
      typeof value === "string" &&
      value.includes(" ")
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedCourse) return toast.error("Please select a course first");
    if (!formData.image)
      return toast.error("Please upload a certificate template image");

    setSaving(true);
    try {
      const data = new FormData();
      data.append("courseId", selectedCourse);
      data.append("certificateName", formData.name || "Default Certificate");
      data.append("width", formData.width);
      data.append("height", formData.height);

      if (formData.imageFile) {
        data.append("certificateImage", formData.imageFile);
      }

      const layers = [
        "studentName",
        "courseName",
        "certificateId",
        "collegeName",
        "issueDate",
      ];
      layers.forEach((layer) => {
        data.append(layer, JSON.stringify(formData[layer]));
      });

      data.append("sampleTexts", JSON.stringify(sampleTexts));

      const response = await saveCertificateTemplate(data);
      if (response.success)
        toast.success("Certificate template saved successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const fontFamilies = [
    { name: "Inter", value: "Inter, sans-serif" },
    { name: "Roboto", value: "Roboto, sans-serif" },
    { name: "Playfair Display", value: "Playfair Display, serif" },
    { name: "Montserrat", value: "Montserrat, sans-serif" },
    { name: "Dancing Script", value: "Dancing Script, cursive" },
    { name: "Courier New", value: "Courier New, monospace" },
    { name: "Lobster", value: "Lobster, cursive" },
    { name: "Pacifico", value: "Pacifico, cursive" },
    { name: "Great Vibes", value: "Great Vibes, cursive" },
    { name: "Satisfy", value: "Satisfy, cursive" },
    { name: "Kaushan Script", value: "Kaushan Script, cursive" },
    { name: "Crimson Text", value: "Crimson Text, serif" },
    { name: "Libre Baskerville", value: "Libre Baskerville, serif" },
    { name: "Cormorant Garamond", value: "Cormorant Garamond, serif" },
  ];

  // Canvas drawing effect
  useEffect(() => {
    if (!formData.image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = formData.image;

    img.onload = () => {
      const width = formData.width || img.width;
      const height = formData.height || img.height;
      canvas.width = width;
      canvas.height = height;

      layerBounds.current = [];
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const layers = [
        { id: "studentName", sample: sampleTexts.studentName },
        { id: "courseName", sample: sampleTexts.courseName },
        { id: "certificateId", sample: sampleTexts.certificateId },
        { id: "collegeName", sample: sampleTexts.collegeName },
        { id: "issueDate", sample: sampleTexts.issueDate },
      ];

      layers.forEach((layer) => {
        const settings = formData[layer.id];
        if (!settings || !settings.status) return;

        const fontDetail = fontFamilies.find(
          (f) => f.name === settings.fontFamily,
        );
        const fontStyleValue = fontDetail
          ? fontDetail.value
          : "Inter, sans-serif";
        const weight = settings.bold ? "bold " : "";
        const italic = settings.italic ? "italic " : "";
        const sizeVal = parseFloat(settings.fontSize);
        const sizePx = isNaN(sizeVal) ? 30 : sizeVal;

        ctx.font = `${weight}${italic}${sizePx}px ${fontStyleValue}`;
        ctx.fillStyle = settings.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const x = parseFloat(settings.horizontalPosition) || 0;
        const y = parseFloat(settings.verticalPosition) || 0;

        ctx.fillText(layer.sample, x, y);

        // Store bounds for dragging
        const metrics = ctx.measureText(layer.sample);
        const textWidth = metrics.width;
        const textHeight = sizePx; // Approximation
        layerBounds.current.push({
          id: layer.id,
          x: x - textWidth / 2,
          y: y - textHeight / 2,
          width: textWidth,
          height: textHeight,
        });

        if (settings.underline) {
          const metrics = ctx.measureText(layer.sample);
          const lineWidth = metrics.width;
          const lineY = y + sizePx * 0.5;
          ctx.beginPath();
          ctx.strokeStyle = settings.textColor;
          ctx.lineWidth = sizePx * 0.05;
          ctx.moveTo(x - lineWidth / 2, lineY);
          ctx.lineTo(x + lineWidth / 2, lineY);
          ctx.stroke();
        }
      });
    };
  }, [formData, sampleTexts]);

  // Dragging logic
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    // Search layers from top to bottom (reverse of rendering)
    const clickedLayer = [...layerBounds.current]
      .reverse()
      .find(
        (l) =>
          pos.x >= l.x &&
          pos.x <= l.x + l.width &&
          pos.y >= l.y &&
          pos.y <= l.y + l.height,
      );

    if (clickedLayer) {
      setDraggingLayer(clickedLayer.id);
      canvasRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);

    if (draggingLayer) {
      const xPx = Math.round(pos.x);
      const yPx = Math.round(pos.y);

      updateNestedState(draggingLayer, "horizontalPosition", xPx.toString());
      updateNestedState(draggingLayer, "verticalPosition", yPx.toString());
    } else {
      // Update cursor if hovering over a layer
      const hoveredLayer = [...layerBounds.current]
        .reverse()
        .find(
          (l) =>
            pos.x >= l.x &&
            pos.x <= l.x + l.width &&
            pos.y >= l.y &&
            pos.y <= l.y + l.height,
        );
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hoveredLayer ? "move" : "default";
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingLayer(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
  };

  return (
    <div
      className="p-6 min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/courses/manage-certificates")}
            className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-all active:scale-95 border"
            style={{
              color: colors.text,
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: colors.text }}
            >
              Certificate Designer
            </h2>
            <p
              className="text-sm opacity-50 font-bold"
              style={{ color: colors.textSecondary }}
            >
              Design and position text on your course certificates
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedCourse}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded font-medium transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center disabled:opacity-70"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          {saving ? (
            <Loader size={18} variant="button" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Template
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Properties */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 custom-scrollbar">
          {/* Course Selection */}
          <div
            className="rounded border p-6 shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "15",
            }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <CheckCircle2
                className="h-4 w-4"
                style={{ color: colors.primary }}
              />
              1. Setup Course
            </h3>
            <div className="relative group">
              <ModernSelect
                options={courses.map((c) => ({
                  label: c.title,
                  value: c._id,
                }))}
                value={selectedCourse}
                onChange={handleCourseChange}
                placeholder="Select an active course..."
              />
            </div>
            {loading && (
              <div
                className="mt-2 flex items-center gap-2 text-xs animate-pulse"
                style={{ color: colors.primary }}
              >
                <Loader2 size={12} className="animate-spin" />
                Loading template data...
              </div>
            )}
          </div>

          {/* Template Background */}
          <div
            className="rounded border p-6 shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "15",
            }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <ImageIcon
                className="h-4 w-4"
                style={{ color: colors.primary }}
              />
              2. Template Background
            </h3>
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cert-upload"
                  accept="image/*"
                />
                <label
                  htmlFor="cert-upload"
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded p-8 transition-all cursor-pointer group"
                  style={{
                    borderColor: colors.accent + "20",
                    backgroundColor: colors.background + "50",
                  }}
                >
                  <div
                    className="p-2 rounded-full transition-colors"
                    style={{ backgroundColor: colors.primary + "10" }}
                  >
                    <ImageIcon
                      className="h-6 w-6"
                      style={{ color: colors.primary }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      {formData.image
                        ? "Change template image"
                        : "Upload certificate template"}
                    </p>
                    <p
                      className="text-xs opacity-50 font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Recommended: 1200x800px or higher
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Style & Positioning */}
          <div className="space-y-4">
            <h3
              className="text-[10px] font-black opacity-40 uppercase tracking-widest px-1"
              style={{ color: colors.text }}
            >
              3. Style & Positioning
            </h3>

            {[
              {
                id: "studentName",
                label: "Username (Student)",
                icon: <Type size={16} />,
              },
              {
                id: "courseName",
                label: "Course Name",
                icon: <Layout size={16} />,
              },
              {
                id: "certificateId",
                label: "Certificate ID",
                icon: <CheckCircle2 size={16} />,
              },
              {
                id: "issueDate",
                label: "Issue Date",
                icon: <Grid size={16} />,
              },
              {
                id: "collegeName",
                label: "College Name",
                icon: <Layout size={16} />,
              },
            ].map((layer) => (
              <div
                key={layer.id}
                className="rounded border transition-all p-5"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: formData[layer.id].status
                    ? colors.primary + "40"
                    : colors.accent + "15",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-sm font-bold flex items-center gap-2"
                    style={{ color: colors.text }}
                  >
                    <span
                      className="p-2 rounded"
                      style={{
                        backgroundColor: formData[layer.id].status
                          ? colors.primary + "10"
                          : colors.background,
                        color: formData[layer.id].status
                          ? colors.primary
                          : colors.textSecondary,
                      }}
                    >
                      {layer.icon}
                    </span>
                    {layer.label}
                  </h3>
                  <Toggle
                    active={formData[layer.id].status}
                    onClick={() =>
                      updateNestedState(
                        layer.id,
                        "status",
                        !formData[layer.id].status,
                      )
                    }
                  />
                </div>

                {formData[layer.id].status && (
                  <div
                    className="space-y-4 pt-4 border-t"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <div>
                      <label
                        className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                        style={{ color: colors.textSecondary }}
                      >
                        Sample Preview Text
                      </label>
                      <input
                        type="text"
                        value={sampleTexts[layer.id]}
                        onChange={(e) =>
                          setSampleTexts((prev) => ({
                            ...prev,
                            [layer.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter preview text..."
                        className="w-full border rounded px-3 py-2 text-xs font-semibold outline-none"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "20",
                          color: colors.text,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                          style={{ color: colors.textSecondary }}
                        >
                          Font Family
                        </label>
                        <select
                          value={formData[layer.id].fontFamily}
                          onChange={(e) =>
                            updateNestedState(
                              layer.id,
                              "fontFamily",
                              e.target.value,
                            )
                          }
                          className="w-full border rounded px-2 py-2 text-xs font-semibold outline-none"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "20",
                            color: colors.text,
                          }}
                        >
                          {fontFamilies.map((f) => (
                            <option
                              key={f.name}
                              value={f.name}
                              style={{
                                backgroundColor: colors.sidebar,
                                color: colors.text,
                              }}
                            >
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                          style={{ color: colors.textSecondary }}
                        >
                          Font Style
                        </label>
                        <div className="flex gap-1">
                          {["bold", "italic", "underline"].map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() =>
                                updateNestedState(
                                  layer.id,
                                  style,
                                  !formData[layer.id][style],
                                )
                              }
                              className={`flex-1 py-2 text-[10px] font-bold border rounded transition-all ${formData[layer.id][style] ? "text-white" : "opacity-30"}`}
                              style={{
                                backgroundColor: formData[layer.id][style]
                                  ? colors.primary
                                  : "transparent",
                                borderColor: formData[layer.id][style]
                                  ? colors.primary
                                  : colors.accent + "20",
                                color: formData[layer.id][style]
                                  ? colors.primary === "#FFFFFF" ||
                                    colors.primary === "#ffffff"
                                    ? "#000000"
                                    : "#FFFFFF"
                                  : colors.text,
                              }}
                            >
                              {style[0].toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                          style={{ color: colors.textSecondary }}
                        >
                          Font Size
                        </label>
                        <input
                          type="text"
                          value={formData[layer.id].fontSize}
                          onChange={(e) =>
                            updateNestedState(
                              layer.id,
                              "fontSize",
                              e.target.value,
                            )
                          }
                          className="w-full border rounded px-3 py-2 text-xs font-semibold outline-none"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "20",
                            color: colors.text,
                          }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                          style={{ color: colors.textSecondary }}
                        >
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={formData[layer.id].textColor}
                            onChange={(e) =>
                              updateNestedState(
                                layer.id,
                                "textColor",
                                e.target.value,
                              )
                            }
                            className="w-8 h-8 rounded border p-0.5"
                            style={{
                              backgroundColor: colors.background,
                              borderColor: colors.accent + "20",
                            }}
                          />
                          <input
                            type="text"
                            value={formData[layer.id].textColor}
                            onChange={(e) =>
                              updateNestedState(
                                layer.id,
                                "textColor",
                                e.target.value,
                              )
                            }
                            className="flex-1 border rounded px-2 py-1 text-[10px] font-mono outline-none uppercase"
                            style={{
                              backgroundColor: colors.background,
                              borderColor: colors.accent + "20",
                              color: colors.text,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                          style={{ color: colors.textSecondary }}
                        >
                          Vertical Pos (px)
                        </label>
                        <input
                          type="text"
                          value={formData[layer.id].verticalPosition}
                          onChange={(e) =>
                            updateNestedState(
                              layer.id,
                              "verticalPosition",
                              e.target.value,
                            )
                          }
                          className="w-full border rounded px-3 py-2 text-xs font-semibold outline-none"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "20",
                            color: colors.text,
                          }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-[10px] font-black opacity-40 mb-1.5 uppercase tracking-widest"
                          style={{ color: colors.textSecondary }}
                        >
                          Horizontal Pos (px)
                        </label>
                        <input
                          type="text"
                          value={formData[layer.id].horizontalPosition}
                          onChange={(e) =>
                            updateNestedState(
                              layer.id,
                              "horizontalPosition",
                              e.target.value,
                            )
                          }
                          className="w-full border rounded px-3 py-2 text-xs font-semibold outline-none"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.accent + "20",
                            color: colors.text,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-7">
          <div
            className="rounded border p-8 sticky top-10"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "15",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
                style={{ color: colors.text }}
              >
                <Grid size={18} style={{ color: colors.primary }} />
                Live Template Preview
              </h3>
              {selectedCourse && (
                <div
                  className="text-[10px] font-bold px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: colors.primary + "10",
                    color: colors.primary,
                    borderColor: colors.primary + "20",
                  }}
                >
                  ID: {selectedCourse.slice(-6).toUpperCase()}
                </div>
              )}
            </div>

            <div
              className="rounded border-2 border-dashed overflow-hidden relative flex items-center justify-center p-2 min-h-[400px]"
              style={{
                borderColor: colors.accent + "20",
                backgroundColor: colors.background + "50",
              }}
            >
              {formData.image ? (
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-auto shadow-2xl rounded bg-white"
                  style={{ maxHeight: "70vh" }}
                />
              ) : (
                <div className="text-center p-12">
                  <ImageIcon
                    size={48}
                    className="mx-auto mb-4 opacity-10"
                    style={{ color: colors.textSecondary }}
                  />
                  <p
                    className="font-bold opacity-30 uppercase tracking-widest text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Upload a template background
                  </p>
                </div>
              )}
            </div>

            {/* <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: colors.primary + "08", borderColor: colors.primary + "15" }}>
                <h4 className="text-[10px] font-black uppercase mb-2 tracking-wider" style={{ color: colors.primary }}>Designer Tip</h4>
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: colors.primary + "CC" }}>
                  Positions are in Pixels (px) relative to the original image dimensions. Drag text to position it.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <h4 className="text-[10px] font-black text-slate-700 uppercase mb-2 tracking-wider">Export Info</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Template is saved per course and used for student completion certificates.
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
