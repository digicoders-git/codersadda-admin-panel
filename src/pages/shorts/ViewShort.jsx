import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MessageCircle,
  Heart,
  Share2,
  Send,
  CornerDownRight,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getShorts,
  getShortComments,
  replyToShortComment,
  deleteShortComment,
} from "../../apis/short";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

function ViewShort() {
  const { colors, isDarkMode } = useTheme();
  // const { shorts, replyToComment } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [short, setShort] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch short details
        const shortRes = await getShorts();
        if (shortRes.success) {
          const found = shortRes.data.find((s) => s._id === id);
          if (found) {
            setShort(found);
          } else {
            toast.error("Short not found");
            navigate("/dashboard/shorts");
            return;
          }
        }

        // Fetch comments - Initial load with loader
        await fetchComments(true);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const fetchComments = async (showLoader = false) => {
    try {
      if (showLoader) setCommentsLoading(true);
      const res = await getShortComments(id);
      if (res.success) {
        setComments(res.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  if (!short) return null;

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      const res = await replyToShortComment(commentId, {
        commentText: replyText,
      });
      if (res.success) {
        toast.success("Reply added successfully");
        setReplyText("");
        setActiveReplyId(null); // Close the reply box immediately

        // Update local count instantly
        setShort((prev) =>
          prev
            ? { ...prev, totalComments: (prev.totalComments || 0) + 1 }
            : prev,
        );

        await fetchComments(false); // Re-fetch quietly to show the new reply instantly
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reply");
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! All nested replies will also be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: colors.primary,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteShortComment(commentId);
        if (res.success) {
          Swal.fire("Deleted!", "The comment has been deleted.", "success");
          // Update local count instantly
          setShort((prev) =>
            prev
              ? {
                  ...prev,
                  totalComments: Math.max(
                    0,
                    (prev.totalComments || 0) - (res.deletedCount || 1),
                  ),
                }
              : prev,
          );
          fetchComments(false); // Refresh list
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete comment",
        );
      }
    }
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard/shorts")}
          className="p-2 rounded transition-all cursor-pointer border"
          style={{
            color: colors.text,
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            View Short
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Left Column: Player */}
        <div className="flex justify-center bg-black/5 rounded-xl p-4">
          <div className="relative aspect-9/16 w-full max-w-sm rounded-lg overflow-hidden shadow-2xl bg-black">
            <video
              src={short.video?.url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              loop
            />
          </div>
        </div>

        {/* Right Column: Details & Comments */}
        <div className="flex flex-col h-[600px] lg:h-auto">
          {/* Details Card */}
          <div
            className="p-6 rounded border shadow-sm mb-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: colors.text }}
            >
              {short.caption}
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="opacity-50" />
              </div>
              <div>
                <p className="text-sm font-bold">{short.instructorName}</p>
                <p className="text-xs opacity-50">Instructor</p>
              </div>
            </div>

            <div
              className="flex items-center gap-6 py-4 border-t border-b"
              style={{ borderColor: colors.accent + "10" }}
            >
              <div className="flex flex-col items-center gap-1">
                <Heart size={20} />
                <span className="text-xs font-bold">
                  {short.totalLikes || 0}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <MessageCircle size={20} />
                <span className="text-xs font-bold">
                  {short.totalComments || 0}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Share2 size={20} />
                <span className="text-xs font-bold">
                  {short.totalShares || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div
            className="flex-1 flex flex-col rounded border shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div
              className="p-4 border-b"
              style={{ borderColor: colors.accent + "20" }}
            >
              <h3 className="font-bold flex items-center gap-2">
                Comments{" "}
                <span className="opacity-40 text-xs">
                  ({short.totalComments || 0})
                </span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {commentsLoading ? (
                <div className="flex justify-center p-10">
                  <Loader size={40} />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <NavLink
                      to={
                        comment.isAdminReply
                          ? "#"
                          : `/dashboard/users/view/${comment.userId?._id}`
                      }
                      className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      {comment.userId?.profilePicture?.url ||
                      comment.userId?.profilePhoto ? (
                        <img
                          src={
                            comment.userId.profilePicture?.url ||
                            comment.userId.profilePhoto
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-blue-600">
                          {comment.userId?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </NavLink>
                    <div className="flex-1">
                      <div
                        className="rounded-lg p-3"
                        style={{
                          backgroundColor:
                            colors.accent + (isDarkMode ? "20" : "10"),
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <NavLink
                            to={
                              comment.isAdminReply
                                ? "#"
                                : `/dashboard/users/view/${comment.userId?._id}`
                            }
                            className="text-xs font-bold hover:underline"
                            style={{ color: colors.text }}
                          >
                            {comment.userId?.name || "Unknown User"}
                          </NavLink>
                          <p
                            className="text-[10px]"
                            style={{
                              color: colors.textSecondary,
                              opacity: 0.6,
                            }}
                          >
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: colors.text, opacity: 0.9 }}
                        >
                          {comment.commentText}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center gap-4 mt-1 px-1">
                        <button
                          onClick={() =>
                            setActiveReplyId(
                              activeReplyId === comment._id
                                ? null
                                : comment._id,
                            )
                          }
                          className="text-[10px] font-bold opacity-60 hover:opacity-100 uppercase tracking-wide cursor-pointer"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-[10px] font-bold text-red-500 opacity-60 hover:opacity-100 uppercase tracking-wide cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Reply Input */}
                      {activeReplyId === comment._id && (
                        <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <input
                            type="text"
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 rounded text-xs outline-none border transition-all"
                            style={{
                              backgroundColor: colors.background,
                              color: colors.text,
                              borderColor: colors.primary + "40",
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter")
                                handleReplySubmit(comment._id);
                            }}
                          />
                          <button
                            onClick={() => handleReplySubmit(comment._id)}
                            disabled={replying}
                            className="p-2 rounded text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            style={{ backgroundColor: colors.primary }}
                          >
                            {replying ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Replies List */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div
                          className="mt-2 space-y-2 pl-4 border-l-2"
                          style={{ borderColor: colors.accent + "10" }}
                        >
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="flex gap-2">
                              <NavLink
                                to={
                                  reply.isAdminReply
                                    ? "#"
                                    : `/dashboard/users/view/${reply.userId?._id}`
                                }
                                className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden"
                              >
                                {reply.userId?.profilePicture?.url ||
                                reply.userId?.profilePhoto ? (
                                  <img
                                    src={
                                      reply.userId.profilePicture?.url ||
                                      reply.userId.profilePhoto
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-purple-600">
                                    {reply.isAdminReply
                                      ? "A"
                                      : reply.userId?.name?.charAt(0) || "U"}
                                  </span>
                                )}
                              </NavLink>
                              <div className="flex-1">
                                <div
                                  className="rounded p-2"
                                  style={{
                                    backgroundColor: reply.isAdminReply
                                      ? colors.primary + "15"
                                      : colors.accent +
                                        (isDarkMode ? "15" : "05"),
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-0.5">
                                    <div className="flex items-center gap-1">
                                      <NavLink
                                        to={
                                          reply.isAdminReply
                                            ? "#"
                                            : reply.userId?._id
                                              ? `/dashboard/users/view/${reply.userId._id}`
                                              : "#"
                                        }
                                        className="text-[10px] font-bold hover:underline"
                                        style={{
                                          color: reply.isAdminReply
                                            ? colors.primary
                                            : colors.text,
                                        }}
                                      >
                                        {reply.userId?.name ||
                                          (reply.isAdminReply
                                            ? "Admin"
                                            : "User")}{" "}
                                      </NavLink>
                                      {reply.isAdminReply && (
                                        <span
                                          className="text-[8px] text-white px-1 rounded uppercase font-bold"
                                          style={{
                                            backgroundColor: colors.primary,
                                          }}
                                        >
                                          Staff
                                        </span>
                                      )}
                                      <span
                                        className="text-[9px] font-normal"
                                        style={{
                                          color: colors.textSecondary,
                                          opacity: 0.7,
                                        }}
                                      >
                                        •{" "}
                                        {new Date(
                                          reply.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <p
                                    className="text-xs"
                                    style={{ color: colors.text, opacity: 0.9 }}
                                  >
                                    {reply.commentText}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 px-1">
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(reply._id)
                                    }
                                    className="text-[8px] font-bold text-red-500 opacity-50 hover:opacity-100 uppercase tracking-wide cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-40">
                  <MessageCircle size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    No comments yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewShort;
