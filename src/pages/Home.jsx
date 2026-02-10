import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
// import { useData } from '../context/DataContext' // Removed
import { getDashboardStats } from "../apis/dashboard";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Film,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Users,
  BookOpen,
  Book,
  Briefcase,
  CreditCard,
  User,
  Send,
  ChartNoAxesCombined,
  ChartSpline,
  MessageCircle,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const Home = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {},
    sales: { daily: [], weekly: [], monthly: [] },
    trendingShorts: [],
    recentComments: [],
  });

  // State for chart filter and reply
  const [chartFilter, setChartFilter] = useState("By Week");
  const [distTab, setDistTab] = useState("Courses"); // Kept for UI consistency, will adapt logic
  const [distFilter, setDistFilter] = useState("Monthly");
  const [replyTo, setReplyTo] = useState(null);
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        // toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats data map
  const statsDataRaw = data.stats || {};

  const statsData = [
    {
      id: "users",
      path: "/dashboard/users",
      title: "Users",
      value: statsDataRaw.users?.total?.toLocaleString() || "0",
      icon: Users,
      color: "#3b82f6",
      growth: statsDataRaw.users?.growth || "+0%",
    },
    {
      id: "courses",
      path: "/dashboard/courses",
      title: "Courses",
      value: statsDataRaw.courses?.total?.toLocaleString() || "0",
      icon: BookOpen,
      color: "#10b981",
      growth: statsDataRaw.courses?.growth || "+0%",
    },
    {
      id: "ebooks",
      path: "/dashboard/ebooks",
      title: "Ebook",
      value: statsDataRaw.ebooks?.total?.toLocaleString() || "0",
      icon: Book,
      color: "#8b5cf6",
      growth: statsDataRaw.ebooks?.growth || "+0%",
    },
    {
      id: "jobs",
      path: "/dashboard/jobs",
      title: "Jobs",
      value: statsDataRaw.jobs?.total?.toLocaleString() || "0",
      icon: Briefcase,
      color: "#f59e0b",
      growth: statsDataRaw.jobs?.growth || "+0%",
    },
    {
      id: "subscription",
      path: "/dashboard/subscriptions",
      title: "Subscription",
      value: statsDataRaw.subscriptions?.total?.toLocaleString() || "0",
      icon: CreditCard,
      color: "#ef4444",
      growth: statsDataRaw.subscriptions?.growth || "+0%",
    },
  ];

  // --- Chart Data Transformation ---
  const processChartData = (apiData, type) => {
    // apiData is array of { _id: { date, type }, total, amount }
    if (!apiData)
      return {
        categories: [],
        courses: [],
        ebooks: [],
        jobs: [],
        subscription: [],
      };

    // Get unique dates/keys
    const dates = [...new Set(apiData.map((item) => item._id.date))];
    // Sort dates
    dates.sort();

    const categories = dates; // e.g., '2023-10-27' or '2023-45'

    const getSeriesData = (itemType) => {
      return categories.map((date) => {
        const found = apiData.find(
          (d) => d._id.date === date && d._id.type === itemType,
        );
        return found ? found.total : 0; // Use 'amount' for revenue, 'total' for count. Let's use Count.
      });
    };

    return {
      categories,
      courses: getSeriesData("course"),
      ebooks: getSeriesData("ebook"),
      jobs: getSeriesData("job"),
      subscription: getSeriesData("subscription"),
    };
  };

  const getChartData = () => {
    switch (chartFilter) {
      case "By Day":
        return processChartData(data.sales.daily, "day");
      case "By Week":
        return processChartData(data.sales.weekly, "week");
      case "By Month":
        return processChartData(data.sales.monthly, "month");
      default:
        return processChartData(data.sales.weekly, "week");
    }
  };

  const chartData = getChartData();

  // Highcharts configuration
  const chartOptions = {
    chart: { type: "spline", backgroundColor: "transparent", height: 400 },
    title: {
      text: "Sales Overview (Count)",
      style: { color: colors.text, fontSize: "20px", fontWeight: "bold" },
    },
    xAxis: {
      categories: chartData.categories,
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + "40",
      tickColor: colors.accent + "40",
    },
    yAxis: {
      title: { text: "Sales Count", style: { color: colors.textSecondary } },
      labels: { style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + "20",
    },
    legend: {
      itemStyle: { color: colors.text },
      itemHoverStyle: { color: colors.primary },
    },
    tooltip: {
      shared: true,
      backgroundColor: colors.background,
      borderColor: colors.accent,
      style: { color: colors.text },
    },
    plotOptions: {
      spline: { marker: { radius: 4, lineColor: "#666666", lineWidth: 1 } },
    },
    series: [
      { name: "Courses", data: chartData.courses, color: "#10b981" },
      { name: "Ebooks", data: chartData.ebooks, color: "#3b82f6" },
      { name: "Jobs", data: chartData.jobs, color: "#f59e0b" },
      { name: "Subscription", data: chartData.subscription, color: "#8b5cf6" },
    ],
    credits: { enabled: false },
  };

  // --- Distribution Data (Revenue) ---
  // Using the same sales data to calculate total revenue distribution
  const getDistributionData = () => {
    // Aggregate from monthly sales (closest to "all time" or "recent" we have loaded)
    const salesSource = data.sales.monthly || [];

    const totals = { course: 0, ebook: 0, job: 0, subscription: 0 };
    salesSource.forEach((item) => {
      if (totals[item._id.type] !== undefined) {
        totals[item._id.type] += item.amount;
      }
    });

    return [
      { name: "Courses", y: totals.course, revenue: totals.course },
      { name: "Ebooks", y: totals.ebook, revenue: totals.ebook },
      { name: "Jobs", y: totals.job, revenue: totals.job },
      {
        name: "Subscription",
        y: totals.subscription,
        revenue: totals.subscription,
      },
    ].filter((d) => d.y > 0); // Only show non-zero
  };

  const distributionData = getDistributionData();

  const distChartOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 450 },
    title: {
      text: `Revenue Distribution (Last 6 Months)`,
      align: "left",
      style: { color: colors.text, fontSize: "20px", fontWeight: "bold" },
    },
    tooltip: {
      backgroundColor: colors.background,
      borderColor: colors.accent,
      style: { color: colors.text },
      pointFormat:
        "Revenue: <b>₹{point.revenue}</b><br/>Share: <b>{point.percentage:.1f}%</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          connectorColor: colors.accent + "40",
          style: { color: colors.textSecondary, textOutline: "none" },
        },
        showInLegend: true,
      },
    },
    legend: {
      itemStyle: { color: colors.text },
      itemHoverStyle: { color: colors.primary },
    },
    series: [{ name: "Revenue", colorByPoint: true, data: distributionData }],
    credits: { enabled: false },
  };

  // --- Comments ---
  const handleReply = (commentId) => {
    navigate(`/dashboard/shorts/view/${replyToShortId}`); // Navigate to short view to reply
  };

  const [replyToShortId, setReplyToShortId] = useState(null);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome/Overview Section */}
      <div
        className="p-8 rounded-lg border shadow-md"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: colors.text }}
        >
          Welcome to CodersAdda Dashboard!
        </h1>
        <p className="text-lg mb-4" style={{ color: colors.textSecondary }}>
          Get a comprehensive overview of your platform's performance and user
          engagement.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: colors.primary + "20",
                color: colors.text,
              }}
            >
              <ChartNoAxesCombined />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.text }}>
                Real-time Analytics
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Track your metrics instantly
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: colors.accent + "30",
                color: colors.text,
              }}
            >
              <ChartSpline />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.text }}>
                Growth Insights
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Monitor your platform growth
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: colors.warning + "20",
                color: colors.text,
              }}
            >
              <TrendingUp />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.text }}>
                User Engagement
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Stay connected with users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {loading
          ? Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-lg border flex items-center justify-center"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                  }}
                >
                  <Loader size={64} />
                </div>
              ))
          : statsData.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <NavLink
                  to={stat.path}
                  key={stat.id}
                  className="p-6 rounded-lg border shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stat.color + "20" }}
                    >
                      <IconComponent size={24} style={{ color: stat.color }} />
                    </div>
                    {/* <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor: "#10b981" + "20",
                        color: "#10b981",
                      }}
                    >
                      {stat.growth}
                    </span> */}
                  </div>
                  <h3
                    className="text-3xl font-bold mb-2"
                    style={{ color: colors.text }}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Total {stat.title}
                  </p>
                </NavLink>
              );
            })}
      </div>

      {/* Sales Chart with Filter */}
      <div
        className="p-6 rounded-lg border shadow-md"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            Sales Overview
          </h2>
          <div className="flex items-center space-x-2">
            {["By Day", "By Week", "By Month"].map((filter) => (
              <button
                key={filter}
                onClick={() => setChartFilter(filter)}
                className="px-4 cursor-pointer py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor:
                    chartFilter === filter
                      ? colors.primary
                      : colors.accent + "20",
                  color:
                    chartFilter === filter ? colors.background : colors.text,
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader size={80} />
          </div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </div>

      {/* Category Wise Distribution Chart - REVENUE */}
      <div
        className="p-6 rounded-lg border shadow-md"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        {/* Note: Tabs are removed as we show overall revenue */}
        <div className="relative">
          <HighchartsReact highcharts={Highcharts} options={distChartOptions} />

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-6"
            style={{ borderColor: colors.accent + "20" }}
          >
            <div className="text-center">
              <p
                className="text-xs font-medium uppercase tracking-tighter"
                style={{ color: colors.textSecondary }}
              >
                Total Items Sold
              </p>
              <p className="text-xl font-bold" style={{ color: colors.text }}>
                {data.sales.monthly?.reduce(
                  (acc, curr) => acc + curr.total,
                  0,
                ) || 0}
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-xs font-medium uppercase tracking-tighter"
                style={{ color: colors.textSecondary }}
              >
                Total Revenue
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: colors.primary }}
              >
                ₹
                {distributionData
                  .reduce((acc, curr) => acc + curr.revenue, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Progress & Latest Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Comments Card with Reply */}
        <div
          className="p-6 rounded-lg border shadow-md col-span-2" // Expanded to full width if needed or keep half
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
          }}
        >
          <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
            Recent Shorts Comments
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {data.recentComments && data.recentComments.length > 0 ? (
              data.recentComments.map((comment) => (
                <div key={comment._id}>
                  <div
                    className="p-4 rounded-lg transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: colors.accent + "10",
                      borderLeft: `3px solid ${colors.primary}`,
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <NavLink
                        to={`/dashboard/users/view/${comment.userId?._id}`}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        {comment.userId?.profilePicture?.url ||
                        comment.userId?.profilePhoto ? (
                          <img
                            src={
                              comment.userId.profilePicture?.url ||
                              comment.userId.profilePhoto
                            }
                            alt={comment.userId.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={18} style={{ color: colors.primary }} />
                        )}
                      </NavLink>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <NavLink
                            to={`/dashboard/users/view/${comment.userId?._id}`}
                            className="text-sm font-semibold hover:underline"
                            style={{ color: colors.text }}
                          >
                            {comment.userId?.name || "Unknown User"}
                          </NavLink>
                          <span
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleDateString()
                              : "Just now"}
                          </span>
                        </div>
                        <p
                          className="text-sm mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          {comment.commentText}
                        </p>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/shorts/view/${comment.shortId}`,
                            )
                          }
                          className="text-xs cursor-pointer font-medium hover:underline"
                          style={{ color: colors.primary }}
                        >
                          Reply
                        </button>

                        {/* Replies - Mocked for now if API doesn't support nested replies yet */}
                      </div>
                    </div>
                  </div>

                  {/* Reply Input */}
                  {replyTo === comment._id && (
                    <div className="mt-2 ml-8 flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: colors.accent + "10",
                          color: colors.text,
                          border: `1px solid ${colors.accent}40`,
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleReply(comment._id);
                        }}
                      />
                      <button
                        onClick={() => handleReply(comment._id)}
                        className="p-2 cursor-pointer rounded-lg transition-all hover:opacity-80"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.background,
                        }}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div
                className="text-center py-4"
                style={{ color: colors.textSecondary }}
              >
                No recent comments
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Shorts Section */}
      <div
        className="p-6 rounded-lg border shadow-md"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#ef4444" + "20" }}
            >
              <TrendingUp size={20} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                Trending Shorts
              </h3>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Top performing shorts by likes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending Shorts from API */}
          {data.trendingShorts && data.trendingShorts.length > 0 ? (
            data.trendingShorts.map((short, index) => (
              <div
                key={short._id || index}
                className="rounded-lg overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <video
                    src={short.video?.url || short.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  {/* Trending Badge */}
                  {index < 3 && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        backgroundColor:
                          index === 0
                            ? "#ef4444"
                            : index === 1
                              ? "#f97316"
                              : "#eab308",
                        color: "#fff",
                      }}
                    >
                      🔥 #{index + 1}
                    </div>
                  )}
                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${
                      short.isActive ? "bg-green-500" : "bg-red-500"
                    } text-white`}
                  >
                    {short.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: colors.primary + "20",
                        color: colors.primary,
                      }}
                    >
                      {short.instructorName?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-sm truncate"
                        style={{ color: colors.text }}
                      >
                        {short.instructorName}
                      </h4>
                      <p
                        className="text-xs mt-1 line-clamp-2"
                        style={{ color: colors.textSecondary }}
                      >
                        {short.caption}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    className="flex items-center justify-between mt-4 pt-3 border-t"
                    style={{ borderColor: colors.accent + "20" }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: "#ef4444" }}
                    >
                      <Heart size={14} fill="#ef4444" />
                      <span>{short.totalLikes?.toLocaleString() || 0}</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      <Share2 size={14} />
                      <span>{short.totalShares || 0}</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: colors.textSecondary }}
                    >
                      <Eye size={14} />
                      <span>{short.totalComments || 0} Comments</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="text-center col-span-3 py-8"
              style={{ color: colors.textSecondary }}
            >
              No trending shorts data
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.accent}20;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary}dd;
        }
      `}</style>
    </div>
  );
};

export default Home;
