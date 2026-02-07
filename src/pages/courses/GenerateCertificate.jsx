import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Text, Image, Transformer } from "react-konva";
import useImage from "use-image";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  ArrowLeft,
  Upload,
  Save,
  Type,
  RotateCcw,
  Move,
  Pencil,
  Maximize2,
  Bold,
  Italic,
  Type as FontIcon,
} from "lucide-react";
import { getAllCourses } from "../../apis/course";
import {
  saveCertificateTemplate,
  getCertificateTemplate,
} from "../../apis/certificate";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const EditableText = ({
  text,
  x,
  y,
  fontSize,
  color,
  fontFamily,
  fontWeight,
  fontStyle,
  onDragEnd,
  isSelected,
  onSelect,
}) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        text={text}
        x={x}
        y={y}
        fontSize={fontSize}
        fill={color}
        fontFamily={fontFamily || "Arial"}
        fontStyle={`${fontStyle || "normal"} ${fontWeight || "normal"}`}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onDragEnd({
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
          enabledAnchors={[]}
          rotateEnabled={false}
        />
      )}
    </>
  );
};

function GenerateCertificate() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [templateImg] = useImage(previewUrl);
  const [selectedId, setSelectedId] = useState(null);
  const [stageScale, setStageScale] = useState(1);

  const STAGE_WIDTH = 1200;
  const STAGE_HEIGHT = 900;

  const fontFamilies = [
    "Arial",
    "Courier New",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Impact",
    "Comic Sans MS",
  ];

  const [settings, setSettings] = useState({
    positions: {
      userName: { x: 600, y: 450 },
      courseName: { x: 600, y: 550 },
      issueDate: { x: 300, y: 750 },
      certificateId: { x: 900, y: 750 },
    },
    fontSize: {
      userName: 40,
      courseName: 30,
      issueDate: 20,
      certificateId: 20,
    },
    color: {
      userName: "#000000",
      courseName: "#000000",
      issueDate: "#000000",
      certificateId: "#000000",
    },
    fontFamily: {
      userName: "Arial",
      courseName: "Arial",
      issueDate: "Arial",
      certificateId: "Arial",
    },
    fontWeight: {
      userName: "bold",
      courseName: "bold",
      issueDate: "normal",
      certificateId: "normal",
    },
    fontStyle: {
      userName: "normal",
      courseName: "normal",
      issueDate: "normal",
      certificateId: "normal",
    },
  });

  const [placeholders, setPlaceholders] = useState({
    userName: "John Doe",
    courseName: "Web Development Bootcamp",
    issueDate: "Issue Date: 12/10/2026",
    certificateId: "ID: CERT-12345678",
  });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = (containerWidth - 48) / STAGE_WIDTH;
        setStageScale(Math.min(scale, 1));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getAllCourses({ limit: 100 });
        if (res.success) setCourses(res.data);
      } catch (err) {
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = async (e) => {
    const cid = e.target.value;
    setSelectedCourse(cid);
    if (!cid) return;

    const course = courses.find((c) => c._id === cid);
    if (course)
      setPlaceholders((prev) => ({ ...prev, courseName: course.title }));

    try {
      setLoading(true);
      const res = await getCertificateTemplate(cid);
      if (res.success && res.template) {
        setSettings({
          positions: res.template.positions || settings.positions,
          fontSize: res.template.fontSize || settings.fontSize,
          color: res.template.color || settings.color,
          fontFamily: res.template.fontFamily || settings.fontFamily,
          fontWeight: res.template.fontWeight || settings.fontWeight,
          fontStyle: res.template.fontStyle || settings.fontStyle,
        });
        setPreviewUrl(res.template.templateImage.url);
      }
    } catch (err) {
      console.log("No template found.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) return toast.error("Please select a course");
    if (!previewUrl) return toast.error("Please upload a template image");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("courseId", selectedCourse);
      if (imageFile) formData.append("templateImage", imageFile);
      formData.append("positions", JSON.stringify(settings.positions));
      formData.append("fontSize", JSON.stringify(settings.fontSize));
      formData.append("color", JSON.stringify(settings.color));
      formData.append("fontFamily", JSON.stringify(settings.fontFamily));
      formData.append("fontWeight", JSON.stringify(settings.fontWeight));
      formData.append("fontStyle", JSON.stringify(settings.fontStyle));

      const res = await saveCertificateTemplate(formData);
      if (res.success) toast.success("Template saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (type, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-all border hover:bg-black/5"
            style={{ color: colors.text, borderColor: colors.accent + "20" }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Certificate Designer
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-black/5"
            style={{ color: colors.text, borderColor: colors.accent + "20" }}
          >
            <RotateCcw size={18} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-semibold shadow-lg active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <Loader size={20} color="#fff" />
            ) : (
              <>
                <Save size={18} /> Save Template
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative">
        {/* Sidebar Controls - Custom styled */}
        <div className="w-full xl:w-[450px] space-y-6">
          <div
            className="p-6 rounded-2xl border bg-white shadow-sm"
            style={{ borderColor: colors.accent + "10" }}
          >
            <label className="block text-xs font-black mb-3 tracking-widest uppercase opacity-50">
              1. SETUP COURSE
            </label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full p-3 rounded-xl outline-none border transition-all text-sm font-medium"
              style={{
                backgroundColor: colors.sidebar,
                color: colors.text,
                borderColor: colors.accent + "20",
              }}
            >
              <option value="">Choose a course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div
            className="p-6 rounded-2xl border bg-white shadow-sm"
            style={{ borderColor: colors.accent + "10" }}
          >
            <label className="block text-xs font-black mb-3 tracking-widest uppercase opacity-50">
              2. TEMPLATE BACKGROUND
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="temp-up"
            />
            <label
              htmlFor="temp-up"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-blue-50 transition-all"
              style={{ borderColor: colors.primary + "30" }}
            >
              <Upload
                size={24}
                className="mb-2"
                style={{ color: colors.primary }}
              />
              <span className="text-sm font-bold">Upload Background</span>
            </label>
          </div>

          <div
            className="p-6 rounded-2xl border bg-white shadow-sm overflow-visible"
            style={{ borderColor: colors.accent + "10" }}
          >
            <label className="block text-xs font-black mb-4 tracking-widest uppercase opacity-50">
              3. STYLE & POSITIONING
            </label>
            <div className="space-y-4 pr-2">
              {Object.keys(settings.positions).map((key) => (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === key ? "ring-2" : ""}`}
                  style={{
                    borderColor:
                      selectedId === key
                        ? colors.primary
                        : colors.accent + "10",
                    ringColor: colors.primary,
                    backgroundColor:
                      selectedId === key
                        ? colors.primary + "05"
                        : "transparent",
                  }}
                  onClick={() => setSelectedId(key)}
                >
                  <div className="flex items-center justify-between mb-3 text-gray-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={placeholders[key]}
                    onChange={(e) =>
                      setPlaceholders((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full p-2 mb-3 bg-gray-50 rounded-lg text-xs border border-gray-100 outline-none"
                    placeholder="Sample Text"
                  />

                  {/* Manual Positioning */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 p-1 bg-white rounded border">
                      <span className="text-[9px] font-bold px-1 opacity-30">
                        X
                      </span>
                      <input
                        type="number"
                        value={settings.positions[key].x}
                        onChange={(e) =>
                          updateSetting("positions", key, {
                            ...settings.positions[key],
                            x: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-white rounded border">
                      <span className="text-[9px] font-bold px-1 opacity-30">
                        Y
                      </span>
                      <input
                        type="number"
                        value={settings.positions[key].y}
                        onChange={(e) =>
                          updateSetting("positions", key, {
                            ...settings.positions[key],
                            y: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Styling Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold opacity-30">
                        FONT FAMILY
                      </label>
                      <select
                        value={settings.fontFamily[key]}
                        onChange={(e) =>
                          updateSetting("fontFamily", key, e.target.value)
                        }
                        className="w-full p-1 text-[10px] bg-white border rounded outline-none"
                      >
                        {fontFamilies.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold opacity-30">
                        SIZE & COLOR
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={settings.fontSize[key]}
                          onChange={(e) =>
                            updateSetting(
                              "fontSize",
                              key,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-12 p-1 text-[10px] bg-white border rounded outline-none"
                        />
                        <input
                          type="color"
                          value={settings.color[key]}
                          onChange={(e) =>
                            updateSetting("color", key, e.target.value)
                          }
                          className="w-6 h-6 p-0 border-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight & Style Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting(
                          "fontWeight",
                          key,
                          settings.fontWeight[key] === "bold"
                            ? "normal"
                            : "bold",
                        );
                      }}
                      className={`p-2 rounded-lg border flex-1 flex justify-center transition-all ${settings.fontWeight[key] === "bold" ? "bg-gray-100 shadow-inner" : "bg-white"}`}
                    >
                      <Bold
                        size={14}
                        className={
                          settings.fontWeight[key] === "bold"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting(
                          "fontStyle",
                          key,
                          settings.fontStyle[key] === "italic"
                            ? "normal"
                            : "italic",
                        );
                      }}
                      className={`p-2 rounded-lg border flex-1 flex justify-center transition-all ${settings.fontStyle[key] === "italic" ? "bg-gray-100 shadow-inner" : "bg-white"}`}
                    >
                      <Italic
                        size={14}
                        className={
                          settings.fontStyle[key] === "italic"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area - Fixed/Sticky Position */}
        <div className="flex-1 min-w-0 xl:sticky xl:top-4">
          <div
            ref={containerRef}
            className="p-6 rounded-[32px] border bg-gray-50 flex flex-col items-center min-h-[600px] shadow-sm"
            style={{ borderColor: colors.accent + "10" }}
          >
            <div className="w-full flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Maximize2 size={16} className="text-blue-500" />
                <span className="text-xs font-black text-gray-500 tracking-widest">
                  LIVE TEMPLATE PREVIEW
                </span>
              </div>
            </div>

            <div
              className="relative shadow-2xl rounded-xl border-8 border-white bg-white overflow-hidden origin-top"
              style={{
                width: STAGE_WIDTH * stageScale,
                height: STAGE_HEIGHT * stageScale,
              }}
            >
              <div
                style={{
                  transform: `scale(${stageScale})`,
                  transformOrigin: "0 0",
                }}
              >
                <Stage
                  width={STAGE_WIDTH}
                  height={STAGE_HEIGHT}
                  onMouseDown={(e) =>
                    e.target === e.target.getStage() && setSelectedId(null)
                  }
                >
                  <Layer>
                    {templateImg && (
                      <Image
                        image={templateImg}
                        width={STAGE_WIDTH}
                        height={STAGE_HEIGHT}
                      />
                    )}
                    {Object.keys(settings.positions).map((key) => (
                      <EditableText
                        key={key}
                        text={placeholders[key]}
                        x={settings.positions[key].x}
                        y={settings.positions[key].y}
                        fontSize={settings.fontSize[key]}
                        color={settings.color[key]}
                        fontFamily={settings.fontFamily[key]}
                        fontWeight={settings.fontWeight[key]}
                        fontStyle={settings.fontStyle[key]}
                        isSelected={selectedId === key}
                        onSelect={() => setSelectedId(key)}
                        onDragEnd={(pos) =>
                          updateSetting("positions", key, pos)
                        }
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>

            <div className="mt-8 flex gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-white/50 px-6 py-2 rounded-full border">
              <span>Drag to Position</span>
              <span className="opacity-20">•</span>
              <span>Select for Manual Edit</span>
              <span className="opacity-20">•</span>
              <span>Auto-Scales for Screen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateCertificate;
