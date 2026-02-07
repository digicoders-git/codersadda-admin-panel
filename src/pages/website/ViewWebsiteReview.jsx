import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Star,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getReviewById,
  deleteReview as apiDeleteReview,
} from "../../apis/review";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ViewWebsiteReview() {
  const { colors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await getReviewById(id);
        if (res.success && res.data) {
          setReview(res.data);
        } else {
          toast.error("Review not found");
          navigate("/dashboard/website/reviews");
        }
      } catch (error) {
        toast.error("Failed to fetch review details");
        navigate("/dashboard/website/reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete review by "${review.name}"?`,
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
          toast.success("Review deleted successfully");
          navigate("/dashboard/website/reviews");
        }
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className={
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }
      />
    ));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!review) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg" style={{ color: colors.textSecondary }}>
          Review not found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-3">
            <MessageSquare size={24} style={{ color: colors.primary }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                Review Details
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Student review information
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dashboard/website/reviews/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
            style={{
              backgroundColor: colors.primary + "20",
              color: colors.primary,
            }}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div
              className="rounded-lg border shadow-sm p-6 text-center"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <img
                src={review.image}
                alt={review.name}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border"
                style={{ borderColor: colors.accent + "30" }}
              />

              <h3
                className="text-xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                {review.name}
              </h3>

              <p
                className="text-sm mb-4"
                style={{ color: colors.textSecondary }}
              >
                {review.role}
              </p>

              <div className="flex items-center justify-center gap-1 mb-4">
                {renderStars(review.rating)}
                <span
                  className="text-lg font-bold ml-2"
                  style={{ color: colors.primary }}
                >
                  {review.rating}/5
                </span>
              </div>

              <span
                className={`inline-block px-3 py-1 rounded text-sm font-bold text-white ${
                  review.status === "Active" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {review.status}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div
              className="rounded-lg border shadow-sm p-6"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: colors.text }}
              >
                Review Content
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <User size={20} style={{ color: colors.primary }} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Student Information
                    </p>
                    <p className="font-semibold" style={{ color: colors.text }}>
                      {review.name} - {review.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star size={20} style={{ color: colors.primary }} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span
                        className="font-bold"
                        style={{ color: colors.text }}
                      >
                        {review.rating} out of 5 stars
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.primary }}
                  >
                    Review Description
                  </h3>
                  <div
                    className="p-4 rounded-lg leading-relaxed"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.text,
                      border: `1px solid ${colors.accent}30`,
                    }}
                  >
                    {review.description}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.primary + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {review.rating}★
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Rating
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.accent + "10" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {review.role.split(" ").length}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Role Words
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor:
                      review.status === "Active" ? "#22C55E20" : "#EF444420",
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: review.status === "Active" ? "#22C55E" : "#EF4444",
                    }}
                  >
                    {review.status}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Status
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewWebsiteReview;
