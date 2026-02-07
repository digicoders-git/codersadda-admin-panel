import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Star,
  MessageSquare,
  Grid,
  List,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getReviews,
  deleteReview as apiDeleteReview,
  toggleReviewStatus as apiToggleReviewStatus,
} from "../../apis/review";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function WebsiteReviews() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(
    (review) =>
      review.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete review by "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await apiDeleteReview(id);
        if (res.success) {
          toast.success("Review deleted successfully!");
          setReviews((prev) => prev.filter((r) => r._id !== id));
        }
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await apiToggleReviewStatus(id);
      if (res.success) {
        const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)),
        );
        toast.success(`Review status updated successfully`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }
      />
    ));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare size={24} style={{ color: colors.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Student Reviews
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Manage student reviews and testimonials
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/website/reviews/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} />
          Add Review
        </button>
      </div>

      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
              color: colors.text,
            }}
          />
        </div>

        <div
          className="flex rounded-lg border"
          style={{ borderColor: colors.accent + "30" }}
        >
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-l-lg transition-all ${
              viewMode === "grid" ? "opacity-100" : "opacity-50"
            }`}
            style={{
              backgroundColor:
                viewMode === "grid" ? colors.primary : "transparent",
              color: viewMode === "grid" ? colors.background : colors.text,
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-r-lg transition-all ${
              viewMode === "list" ? "opacity-100" : "opacity-50"
            }`}
            style={{
              backgroundColor:
                viewMode === "list" ? colors.primary : "transparent",
              color: viewMode === "list" ? colors.background : colors.text,
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <MessageSquare
              size={48}
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              No reviews found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border shadow-sm p-6 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold" style={{ color: colors.text }}>
                        {review.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {review.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleStatusToggle(review._id, review.status)
                    }
                    className={`px-2 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                      review.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {review.status}
                  </button>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {renderStars(review.rating)}
                  <span
                    className="text-sm font-semibold ml-2"
                    style={{ color: colors.text }}
                  >
                    {review.rating}/5
                  </span>
                </div>

                <p
                  className="text-sm mb-4 line-clamp-3"
                  style={{ color: colors.textSecondary }}
                >
                  {review.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/website/reviews/view/${review._id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: colors.primary + "20",
                      color: colors.primary,
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/website/reviews/edit/${review._id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: colors.accent + "20",
                      color: colors.text,
                    }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id, review.name)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded text-xs font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border shadow-sm p-4 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-bold text-lg mb-1"
                          style={{ color: colors.text }}
                        >
                          {review.name}
                        </h3>
                        <p
                          className="text-sm mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {review.role}
                        </p>

                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(review.rating)}
                          <span
                            className="text-sm font-semibold ml-2"
                            style={{ color: colors.text }}
                          >
                            {review.rating}/5
                          </span>
                        </div>

                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {review.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleStatusToggle(review._id, review.status)
                          }
                          className={`px-3 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                            review.status === "Active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {review.status}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/reviews/view/${review._id}`,
                              )
                            }
                            className="p-2 rounded transition-all"
                            style={{
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            }}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/website/reviews/edit/${review._id}`,
                              )
                            }
                            className="p-2 rounded transition-all"
                            style={{
                              backgroundColor: colors.accent + "20",
                              color: colors.text,
                            }}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(review._id, review.name)
                            }
                            className="p-2 rounded transition-all text-red-600 bg-red-50 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteReviews;
