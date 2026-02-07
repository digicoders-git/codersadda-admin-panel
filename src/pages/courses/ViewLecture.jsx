import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getCourseById } from "../../apis/course";
import { getLectureById } from "../../apis/lecture";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  ArrowLeft,
  Play,
  Info,
  Layout,
  Clock,
  Video,
  Monitor,
  Lock,
  CheckCircle,
  ChevronRight,
  FileText,
} from "lucide-react";

function ViewLecture() {
  const { colors } = useTheme();
  // const { courses } = useData(); // Removed
  const { id, lectureId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState(null);
  const [lecture, setLecture] = useState(null);

  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        const [courseRes, lectureRes] = await Promise.all([
          getCourseById(id),
          getLectureById(lectureId),
        ]);

        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        if (lectureRes.success) {
          const l = lectureRes.data;
          // Map backend lecture fields to frontend state
          setLecture({
            ...l,
            lectureSrNo: l.srNo,
            isLocked: l.privacy === "locked",
            videoUrl: l.video?.url,
            thumbnailUrl: l.thumbnail?.url,
            pdfUrl: l.resource?.url,
            pdfFileName:
              l.resource?.public_id?.split("/").pop() || "Download Notes",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch lecture data");
        navigate(`/dashboard/courses/view/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLectureData();
  }, [id, lectureId, navigate]);

  return (
    <div className="w-full h-full flex flex-col">
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-20">
          <Loader size={100} />
        </div>
      ) : course && lecture ? (
        <>
          {/* Dynamic Header with Category and Course Name */}
          <div
            className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 cursor-pointer rounded-lg hover:bg-black/5 transition-all"
              >
                <ArrowLeft size={20} style={{ color: colors.text }} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                  {course.category?.name ||
                    (typeof course.category === "string"
                      ? course.category
                      : "")}
                  <ChevronRight size={12} />
                  <span>{course.title}</span>
                </div>
                <h1
                  className="text-xl font-black mt-1"
                  style={{ color: colors.text }}
                >
                  {lecture.lectureSrNo && (
                    <span className="mr-2 opacity-30">
                      #{lecture.lectureSrNo}
                    </span>
                  )}
                  {lecture.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-6 pr-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="opacity-40" />
                <span className="text-xs font-bold opacity-70">
                  {lecture.duration || "00:00"}
                </span>
              </div>
              {lecture.isLocked ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Lock size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Premium Lecture
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                  <CheckCircle size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Free Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Video Player Area */}
              <div className="w-full aspect-video rounded-3xl bg-black shadow-2xl overflow-hidden relative group">
                {lecture.videoUrl ? (
                  <video
                    src={lecture.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    poster={
                      lecture.thumbnailUrl ||
                      course.thumbnail?.url ||
                      course.image
                    }
                  ></video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                    <Video size={80} className="mb-4 animate-pulse" />
                    <p className="font-bold text-lg">
                      Lecture Video Processing...
                    </p>
                    <p className="text-sm opacity-50 mt-2">
                      File: {lecture.videoFileName || "Direct Stream"}
                    </p>
                  </div>
                )}
              </div>

              {/* Lecture Context */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[2px] opacity-40 mb-4">
                      Lecture Description
                    </h3>
                    <p className="text-sm font-semibold opacity-60 leading-relaxed whitespace-pre-wrap">
                      {lecture.description ||
                        `This lecture covers essential concepts within the ${course.title} series. Ensure you have completed previous units before proceeding for better understanding.`}
                    </p>
                  </div>

                  <div
                    className="p-8 rounded-3xl border border-dashed"
                    style={{ borderColor: colors.accent + "20" }}
                  >
                    <Info size={24} className="mb-4 opacity-20" />
                    <h4 className="text-sm font-bold mb-4">
                      Instructor's Note
                    </h4>
                    <p className="text-xs font-medium opacity-50 leading-relaxed">
                      Watch the video carefully and follow along with the source
                      code provided in the course resources section. If you
                      encounter any issues, feel free to reach out via the
                      discussion forum.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {lecture.pdfUrl && (
                    <div
                      className="p-6 rounded-3xl border"
                      style={{
                        backgroundColor: colors.sidebar || colors.background,
                        borderColor: colors.accent + "15",
                      }}
                    >
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">
                        Lecture Resources
                      </h3>
                      <a
                        href={lecture.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border hover:bg-black/5 transition-all group"
                        style={{ borderColor: colors.accent + "20" }}
                      >
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-xs font-bold truncate"
                            style={{ color: colors.text }}
                          >
                            {lecture.pdfFileName || "Download Notes"}
                          </p>
                          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                            PDF Document
                          </p>
                        </div>
                      </a>
                    </div>
                  )}

                  <div
                    className="p-6 rounded-3xl border"
                    style={{
                      backgroundColor: colors.sidebar || colors.background,
                      borderColor: colors.accent + "15",
                    }}
                  >
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
                      Course Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.technology?.split(",").map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider"
                          style={{
                            borderColor: colors.accent + "20",
                            color: colors.primary,
                          }}
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-40">
          <Monitor size={48} className="mb-4" />
          <p className="font-bold">Lecture not found</p>
        </div>
      )}
    </div>
  );
}

export default ViewLecture;
