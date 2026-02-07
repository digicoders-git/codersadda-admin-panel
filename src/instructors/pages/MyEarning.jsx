import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { getInstructorProfile } from "../../apis/instructor";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function MyEarning() {
  const { colors } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await getInstructorProfile();
        if (res.success) {
          setData(res.instructor);
        }
      } catch (error) {
        toast.error("Failed to fetch earnings");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader size={80} />
      </div>
    );
  }

  const courseEarnings = data?.courseEarnings || [];
  const totalCourses = courseEarnings.length;
  const totalSales = courseEarnings.reduce(
    (acc, curr) => acc + (curr.salesCount || 0),
    0,
  );

  const cardStyle = {
    backgroundColor: colors.sidebar || colors.background,
    borderColor: colors.accent + "20",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: colors.primary + "20",
              color: colors.primary,
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              My Earnings
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: colors.textSecondary }}
            >
              Performance summary and revenue breakdown
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl border shadow-sm" style={cardStyle}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded bg-green-500/10 text-green-500">
              <TrendingUp size={20} />
            </div>
            <span
              className="text-xs font-bold opacity-60 uppercase tracking-wider"
              style={{ color: colors.text }}
            >
              Total Earnings
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: colors.text }}>
            ₹{data?.totalEarnings?.toLocaleString() || 0}
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-sm" style={cardStyle}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded bg-blue-500/10 text-blue-500">
              <Users size={20} />
            </div>
            <span
              className="text-xs font-bold opacity-60 uppercase tracking-wider"
              style={{ color: colors.text }}
            >
              Total Sales
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: colors.text }}>
            {totalSales}
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-sm" style={cardStyle}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded bg-purple-500/10 text-purple-500">
              <BookOpen size={20} />
            </div>
            <span
              className="text-xs font-bold opacity-60 uppercase tracking-wider"
              style={{ color: colors.text }}
            >
              Active Courses
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: colors.text }}>
            {totalCourses}
          </div>
        </div>
      </div>

      {/* detailed breakdown */}
      <div
        className="p-6 rounded-xl border shadow-sm mb-10 overflow-hidden"
        style={cardStyle}
      >
        <h2 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
          Course Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.accent + "20" }}
              >
                <th
                  className="pb-4 text-xs font-bold opacity-50 uppercase"
                  style={{ color: colors.text }}
                >
                  Course Name
                </th>
                <th
                  className="pb-4 text-xs font-bold opacity-50 uppercase"
                  style={{ color: colors.text }}
                >
                  Sales
                </th>
                <th
                  className="pb-4 text-xs font-bold opacity-50 uppercase"
                  style={{ color: colors.text }}
                >
                  Total Revenue
                </th>
                <th
                  className="pb-4 text-xs font-bold opacity-50 uppercase"
                  style={{ color: colors.text }}
                >
                  My Earning
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ divideColor: colors.accent + "10" }}
            >
              {courseEarnings.length > 0 ? (
                courseEarnings.map((item, idx) => (
                  <tr key={idx} className="hover:bg-black/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                          {item.course?.thumbnail?.url ? (
                            <img
                              src={item.course.thumbnail.url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>
                        <span
                          className="font-semibold text-sm line-clamp-1"
                          style={{ color: colors.text }}
                        >
                          {item.course?.title || "Unknown Course"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        {item.salesCount || 0}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        ₹{(item.totalRevenue || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-green-500">
                          ₹{(item.earnedAmount || 0).toLocaleString()}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-green-500 opacity-50"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center opacity-40 italic"
                  >
                    No sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MyEarning;
