import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Type,
  Layout,
  Grid,
  Loader2,
  CheckCircle2,
  Hash,
  Phone,
  Clock,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import { getQuizzes } from "../../apis/quiz";
import {
  saveQuizCertificateTemplate,
  getQuizCertificateTemplate,
} from "../../apis/quizCertificate";
import ModernSelect from "../../components/ModernSelect";
import Toggle from "../../components/ui/Toggle";

export default function GenerateQuizCertificate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
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

    fetchQuizzes();

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await getQuizzes({ isActive: true, limit: 1000 });
      if (response.success) {
        const fetchedQuizzes = response.data || [];
        setQuizzes(fetchedQuizzes);
        if (location.state?.quizId) {
          handleQuizChange(location.state.quizId, fetchedQuizzes);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch quizzes");
    }
  };

  const initialFormState = {
    name: "",
    image: null,
    imageFile: null,
    width: 1200,
    height: 800,
    studentName: {
      status: true,
      textColor: "#000000",
      verticalPosition: "350",
      horizontalPosition: "600",
      fontSize: "45px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    quizName: {
      status: true,
      textColor: "#000000",
      verticalPosition: "450",
      horizontalPosition: "600",
      fontSize: "30px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    quizCode: {
      status: false,
      textColor: "#000000",
      verticalPosition: "500",
      horizontalPosition: "600",
      fontSize: "18px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
    userMobile: {
      status: false,
      textColor: "#000000",
      verticalPosition: "550",
      horizontalPosition: "600",
      fontSize: "18px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
    collegeName: {
      status: false,
      textColor: "#000000",
      verticalPosition: "250",
      horizontalPosition: "600",
      fontSize: "20px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
    rank: {
      status: true,
      textColor: "#000000",
      verticalPosition: "520",
      horizontalPosition: "400",
      fontSize: "24px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    totalScore: {
      status: true,
      textColor: "#000000",
      verticalPosition: "520",
      horizontalPosition: "600",
      fontSize: "24px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    timeTaken: {
      status: true,
      textColor: "#000000",
      verticalPosition: "520",
      horizontalPosition: "800",
      fontSize: "24px",
      fontFamily: "Inter",
      bold: true,
      italic: false,
      underline: false,
    },
    certificateId: {
      status: true,
      textColor: "#000000",
      verticalPosition: "700",
      horizontalPosition: "960",
      fontSize: "16px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
    issueDate: {
      status: true,
      textColor: "#000000",
      verticalPosition: "700",
      horizontalPosition: "240",
      fontSize: "16px",
      fontFamily: "Inter",
      bold: false,
      italic: false,
      underline: false,
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [sampleTexts, setSampleTexts] = useState({
    studentName: "John Doe",
    quizName: "Full Stack Quiz",
    quizCode: "FS-101",
    userMobile: "9876543210",
    collegeName: "CodersAdda Academy",
    rank: "1",
    totalScore: "45 / 50",
    timeTaken: "15 mins",
    certificateId: "QC-2026-X8",
    issueDate: "10/02/2026",
  });

  const handleQuizChange = async (qid, fetchedQuizzes = quizzes) => {
    setSelectedQuiz(qid);
    if (!qid) {
      setFormData(initialFormState);
      return;
    }

    const quiz = fetchedQuizzes.find((q) => q._id === qid);

    try {
      setLoading(true);
      const res = await getQuizCertificateTemplate(qid);
      if (res.success && res.template) {
        const cert = res.template;
        setFormData({
          name: cert.certificateName,
          image: cert.certificateImage.startsWith("/uploads")
            ? `${import.meta.env.VITE_API_BASE_URL}${cert.certificateImage}`
            : cert.certificateImage,
          imageFile: null,
          width: cert.width || 1200,
          height: cert.height || 800,
          studentName: cert.studentName || initialFormState.studentName,
          quizName: cert.quizName || initialFormState.quizName,
          quizCode: cert.quizCode || initialFormState.quizCode,
          userMobile: cert.userMobile || initialFormState.userMobile,
          collegeName: cert.collegeName || initialFormState.collegeName,
          rank: cert.rank || initialFormState.rank,
          totalScore: cert.totalScore || initialFormState.totalScore,
          timeTaken: cert.timeTaken || initialFormState.timeTaken,
          certificateId: cert.certificateId || initialFormState.certificateId,
          issueDate: cert.issueDate || initialFormState.issueDate,
        });
        if (cert.sampleTexts) {
          setSampleTexts(cert.sampleTexts);
        } else if (quiz) {
          setSampleTexts((prev) => ({
            ...prev,
            quizName: quiz.title,
            quizCode: quiz.quizCode,
          }));
        }
      } else {
        setFormData({
          ...initialFormState,
          name: quiz ? `${quiz.title} Certificate` : "",
        });
        if (quiz) {
          setSampleTexts((prev) => ({
            ...prev,
            quizName: quiz.title,
            quizCode: quiz.quizCode,
          }));
        }
      }
    } catch (error) {
      setFormData({
        ...initialFormState,
        name: quiz ? `${quiz.title} Certificate` : "",
      });
      if (quiz) {
        setSampleTexts((prev) => ({
          ...prev,
          quizName: quiz.title,
          quizCode: quiz.quizCode,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: url,
        imageFile: file,
      }));
      // Width/Height logic moved to img onload if needed, keeping it simple for now
    }
  };

  const updateNestedState = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedQuiz) return toast.error("Please select a quiz first");
    if (!formData.image)
      return toast.error("Please upload a certificate template image");

    setSaving(true);
    try {
      const data = new FormData();
      data.append("quizId", selectedQuiz);
      data.append("certificateName", formData.name || "Quiz Certificate");
      data.append("width", formData.width);
      data.append("height", formData.height);

      if (formData.imageFile) {
        data.append("certificateImage", formData.imageFile);
      }

      const layers = [
        "studentName",
        "quizName",
        "quizCode",
        "userMobile",
        "collegeName",
        "rank",
        "totalScore",
        "timeTaken",
        "certificateId",
        "issueDate",
      ];
      layers.forEach((layer) => {
        data.append(layer, JSON.stringify(formData[layer]));
      });

      data.append("sampleTexts", JSON.stringify(sampleTexts));

      const response = await saveQuizCertificateTemplate(data);
      if (response.success)
        toast.success("Quiz certificate template saved successfully!");
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
    { name: "Lobster", value: "Lobster, cursive" },
    { name: "Pacifico", value: "Pacifico, cursive" },
    { name: "Great Vibes", value: "Great Vibes, cursive" },
    { name: "Satisfy", value: "Satisfy, cursive" },
    { name: "Kaushan Script", value: "Kaushan Script, cursive" },
  ];

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
        { id: "quizName", sample: sampleTexts.quizName },
        { id: "quizCode", sample: sampleTexts.quizCode },
        { id: "userMobile", sample: sampleTexts.userMobile },
        { id: "collegeName", sample: sampleTexts.collegeName },
        { id: "rank", sample: sampleTexts.rank },
        { id: "totalScore", sample: sampleTexts.totalScore },
        { id: "timeTaken", sample: sampleTexts.timeTaken },
        { id: "certificateId", sample: sampleTexts.certificateId },
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

        const metrics = ctx.measureText(layer.sample);
        layerBounds.current.push({
          id: layer.id,
          x: x - metrics.width / 2,
          y: y - sizePx / 2,
          width: metrics.width,
          height: sizePx,
        });

        if (settings.underline) {
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
      updateNestedState(
        draggingLayer,
        "horizontalPosition",
        Math.round(pos.x).toString(),
      );
      updateNestedState(
        draggingLayer,
        "verticalPosition",
        Math.round(pos.y).toString(),
      );
    } else {
      const hoveredLayer = [...layerBounds.current]
        .reverse()
        .find(
          (l) =>
            pos.x >= l.x &&
            pos.x <= l.x + l.width &&
            pos.y >= l.y &&
            pos.y <= l.y + l.height,
        );
      if (canvasRef.current)
        canvasRef.current.style.cursor = hoveredLayer ? "move" : "default";
    }
  };

  const handleMouseUp = () => {
    setDraggingLayer(null);
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  };

  return (
    <div
      className="p-6 min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/quizzes/manage-certificates")}
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
              Quiz Certificate Designer
            </h2>
            <p
              className="text-sm opacity-50 font-bold"
              style={{ color: colors.textSecondary }}
            >
              Design templates for quiz completion certificates
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedQuiz}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded font-medium transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center disabled:opacity-70"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          {saving ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
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
              <CheckCircle2 size={16} style={{ color: colors.primary }} /> 1.
              Select Quiz
            </h3>
            <ModernSelect
              options={quizzes.map((q) => ({ label: q.title, value: q._id }))}
              value={selectedQuiz}
              onChange={handleQuizChange}
              placeholder="Select a quiz..."
            />
          </div>

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
              <ImageIcon size={16} style={{ color: colors.primary }} /> 2.
              Background Image
            </h3>
            <label
              className="flex flex-col items-center justify-center border-2 border-dashed rounded p-6 cursor-pointer transition-colors"
              style={{
                borderColor: colors.accent + "20",
                backgroundColor: colors.background + "50",
              }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <ImageIcon
                className="h-8 w-8 mb-2 opacity-30"
                style={{ color: colors.text }}
              />
              <p
                className="text-xs font-bold opacity-50"
                style={{ color: colors.text }}
              >
                Click to upload template
              </p>
            </label>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "studentName",
                label: "Student Name",
                icon: <Type size={14} />,
              },
              {
                id: "quizName",
                label: "Quiz Title",
                icon: <Layout size={14} />,
              },
              {
                id: "quizCode",
                label: "Quiz Code",
                icon: <Hash size={14} />,
              },
              {
                id: "userMobile",
                label: "User Mobile",
                icon: <Phone size={14} />,
              },
              {
                id: "collegeName",
                label: "College Name",
                icon: <Layout size={14} />,
              },
              {
                id: "rank",
                label: "Rank",
                icon: <Award size={14} />,
              },
              {
                id: "totalScore",
                label: "Total Score",
                icon: <Hash size={14} />,
              },
              {
                id: "timeTaken",
                label: "Time Taken",
                icon: <Clock size={14} />,
              },
              {
                id: "certificateId",
                label: "Certificate ID",
                icon: <CheckCircle2 size={14} />,
              },
              {
                id: "issueDate",
                label: "Issue Date",
                icon: <Grid size={14} />,
              },
            ].map((layer) => (
              <div
                key={layer.id}
                className="rounded border p-4 shadow-sm"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "15",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-bold flex items-center gap-2"
                    style={{ color: colors.text }}
                  >
                    {layer.icon} {layer.label}
                  </span>
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
                    className="space-y-3 pt-3 border-t"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <input
                      type="text"
                      value={sampleTexts[layer.id]}
                      onChange={(e) =>
                        setSampleTexts({
                          ...sampleTexts,
                          [layer.id]: e.target.value,
                        })
                      }
                      className="w-full text-xs p-2 border rounded outline-none"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "20",
                        color: colors.text,
                      }}
                      placeholder="Preview Text"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData[layer.id].fontFamily}
                        onChange={(e) =>
                          updateNestedState(
                            layer.id,
                            "fontFamily",
                            e.target.value,
                          )
                        }
                        className="text-xs p-2 border rounded outline-none"
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
                        className="text-xs p-2 border rounded outline-none"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.accent + "20",
                          color: colors.text,
                        }}
                        placeholder="Size (e.g. 30px)"
                      />
                    </div>
                    <div className="flex items-center gap-2">
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
                      <div
                        className="flex rounded p-1 flex-1"
                        style={{ backgroundColor: colors.background + "80" }}
                      >
                        {["bold", "italic", "underline"].map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              updateNestedState(
                                layer.id,
                                s,
                                !formData[layer.id][s],
                              )
                            }
                            className={`flex-1 text-[10px] font-bold p-1 rounded transition-all ${formData[layer.id][s] ? "shadow-sm" : "opacity-30"}`}
                            style={{
                              backgroundColor: formData[layer.id][s]
                                ? colors.sidebar
                                : "transparent",
                              color: colors.text,
                            }}
                          >
                            {s[0].toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div
            className="rounded border p-2 shadow-inner overflow-auto flex items-center justify-center min-h-[500px]"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "15",
            }}
          >
            {formData.image ? (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="max-w-full h-auto shadow-2xl"
              />
            ) : (
              <div
                className="font-bold uppercase tracking-widest text-sm text-center"
                style={{ color: colors.textSecondary, opacity: 0.3 }}
              >
                <ImageIcon size={48} className="mx-auto mb-4" />
                Upload template to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
