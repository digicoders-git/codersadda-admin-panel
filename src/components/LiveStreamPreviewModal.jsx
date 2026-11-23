import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  X,
  Radio,
  Eye,
  EyeOff,
  Copy,
  Check,
  Maximize2,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import liveClassApi from "../apis/liveClass";
import { toast } from "react-toastify";
import Loader from "./Loader";

const LiveStreamPreviewModal = ({
  classData,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { colors } = useTheme();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [streamStatus, setStreamStatus] = useState("checking"); // 'checking' | 'online' | 'offline'
  const [currentStatus, setCurrentStatus] = useState(classData?.status || "SCHEDULED");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // default muted for autoplay compliance
  const [retryKey, setRetryKey] = useState(0);

  const streamName = classData?.streamName || "";
  const hlsUrl = streamName ? `https://live.codersadda.com/live/${streamName}.m3u8` : "";
  const rtmpServer = "rtmp://live.codersadda.com/live";

  useEffect(() => {
    if (classData?.status) {
      setCurrentStatus(classData.status);
    }
  }, [classData]);

  // Setup HLS video playback
  useEffect(() => {
    if (!isOpen || !hlsUrl) return;

    let hlsInstance = null;
    let pollInterval = null;
    let isCancelled = false;

    const attachHls = () => {
      const video = videoRef.current;
      if (!video || isCancelled) return;

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch (e) {}
        }

        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 6,
          manifestLoadingTimeOut: 6000,
          manifestLoadingMaxRetry: Infinity,
          manifestLoadingRetryDelay: 2000,
          levelLoadingTimeOut: 6000,
          levelLoadingMaxRetry: Infinity,
          levelLoadingRetryDelay: 2000,
        });

        hlsRef.current = hlsInstance;
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isCancelled) return;
          setStreamStatus("online");
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (isCancelled) return;
          if (data.fatal) {
            setStreamStatus("offline");
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("[HLS] Network error, restarting load in 2s...");
                setTimeout(() => {
                  if (!isCancelled && hlsRef.current) {
                    try {
                      hlsRef.current.startLoad();
                    } catch (e) {
                      attachHls();
                    }
                  }
                }, 2000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("[HLS] Media error, attempting recovery...");
                hlsInstance.recoverMediaError();
                break;
              default:
                console.log("[HLS] Unrecoverable error, reinitializing in 3s...");
                try {
                  hlsInstance.destroy();
                } catch (e) {}
                setTimeout(() => {
                  if (!isCancelled) attachHls();
                }, 3000);
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native Safari HLS
        video.src = hlsUrl;
        video.muted = true;
        setIsMuted(true);
        video.addEventListener("loadedmetadata", () => {
          if (isCancelled) return;
          setStreamStatus("online");
          video.play().catch(() => {});
        });
        video.addEventListener("error", () => {
          if (isCancelled) return;
          setStreamStatus("offline");
        });
      }
    };

    // Initial check and start
    attachHls();

    // Fallback periodic poll if stream stays offline
    pollInterval = setInterval(() => {
      if (streamStatus !== "online" && !isCancelled) {
        // Test if manifest is available via quick fetch
        fetch(hlsUrl, { method: "HEAD", cache: "no-cache" })
          .then((res) => {
            if (res.ok && streamStatus !== "online" && !isCancelled) {
              attachHls();
            }
          })
          .catch(() => {});
      }
    }, 4000);

    return () => {
      isCancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {}
        hlsRef.current = null;
      }
    };
  }, [isOpen, hlsUrl, retryKey]);

  if (!isOpen || !classData) return null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGoLiveOnApp = async () => {
    try {
      setActionLoading(true);
      await liveClassApi.showOnApp(classData._id);
      setCurrentStatus("LIVE");
      toast.success("🎉 Class is now LIVE on Mobile App! Students can join now.");
      if (onStatusChange) onStatusChange(classData._id, "LIVE");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to make class live");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHideFromApp = async () => {
    try {
      setActionLoading(true);
      await liveClassApi.hideFromApp(classData._id);
      setCurrentStatus("LIVE_HIDDEN");
      toast.info("Class is hidden from students (Preview Mode).");
      if (onStatusChange) onStatusChange(classData._id, "LIVE_HIDDEN");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to hide class");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const isLiveOnApp = currentStatus === "LIVE";
  const isPreviewMode = currentStatus === "LIVE_HIDDEN" || currentStatus === "SCHEDULED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        style={{ color: "#fff" }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-950/70 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
              <Radio size={18} className={streamStatus === "online" ? "animate-pulse" : ""} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm md:text-base text-white truncate max-w-[280px] md:max-w-md">
                  {classData.title}
                </h3>
                {isLiveOnApp ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE ON APP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <EyeOff size={10} />
                    ADMIN PREVIEW ONLY
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {classData.courseId?.title || "Course"} • {classData.instructorId?.fullName || "Instructor"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted={isMuted}
            controls={false}
            className="w-full h-full object-contain"
          />

          {/* Stream Overlay Status */}
          {streamStatus === "checking" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 space-y-3">
              <Loader size={40} />
              <p className="text-sm font-semibold text-gray-300">Connecting to stream server...</p>
            </div>
          )}

          {streamStatus === "offline" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-10 p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>
              <div>
                <p className="text-base font-bold text-white">Stream is Offline</p>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  OBS Studio me <b>Start Streaming</b> dabayein. Stream start hone ke baad player automatically live video dikhayega.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <RefreshCw size={12} className="animate-spin text-blue-400" />
                  <span>Auto-detecting stream signals...</span>
                </div>
                <button
                  onClick={() => {
                    setStreamStatus("checking");
                    setRetryKey((k) => k + 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Check Stream Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Player Controls Overlay */}
          {streamStatus === "online" && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs z-20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="font-bold text-green-400 uppercase tracking-widest text-[10px]">
                  Stream Connected (SRS HLS)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar & OBS Stream Info */}
        <div className="p-4 md:p-5 bg-gray-950 border-t border-gray-800 space-y-4">
          {/* Main Action Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900/90 p-3.5 rounded-xl border border-gray-800">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
                {isLiveOnApp ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-400" />
                    Students can currently watch this stream on the app
                  </>
                ) : (
                  <>
                    <Eye size={16} className="text-orange-400" />
                    Preview Ready: Stream is running in hidden mode
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400">
                {isLiveOnApp
                  ? "Click 'Hide from App' to pause student visibility anytime."
                  : "Preview the stream above, then click 'Go Live (Show on App)' to broadcast to students."}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {isPreviewMode && (
                <button
                  onClick={handleGoLiveOnApp}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-red-600 hover:bg-red-500 active:scale-95 transition text-white shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader size={16} variant="button" />
                  ) : (
                    <>
                      <Radio size={14} /> Go Live (Show on App)
                    </>
                  )}
                </button>
              )}

              {isLiveOnApp && (
                <button
                  onClick={handleHideFromApp}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-orange-600 hover:bg-orange-500 active:scale-95 transition text-white cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader size={16} variant="button" />
                  ) : (
                    <>
                      <EyeOff size={14} /> Hide from App
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick Stream Setup Copy Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {/* RTMP Server */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-lg">
              <div className="truncate pr-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">RTMP Server</span>
                <span className="font-mono text-gray-300 select-all">{rtmpServer}</span>
              </div>
              <button
                onClick={() => copyToClipboard(rtmpServer, "RTMP Server")}
                className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer shrink-0"
              >
                {copiedField === "RTMP Server" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Stream Key */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-lg">
              <div className="truncate pr-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Stream Key</span>
                <span className="font-mono text-gray-300 select-all">{streamName || "—"}</span>
              </div>
              <button
                onClick={() => copyToClipboard(streamName, "Stream Key")}
                className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer shrink-0"
              >
                {copiedField === "Stream Key" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPreviewModal;
