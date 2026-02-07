import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
// import { useData } from '../../context/DataContext'; // Removed
import { getDashboardStats } from "../../apis/dashboard";
import { getAllCourses } from "../../apis/course";
import { getEbooks } from "../../apis/ebook";
import { getJobs } from "../../apis/job";
import { getSubscriptions } from "../../apis/subscription";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import accessibility from "highcharts/modules/accessibility";
import { getSalesDashboardData } from "../../apis/sales";
import {
  TrendingUp,
  BookOpen,
  Book,
  Briefcase,
  CreditCard,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

// Initialize accessibility module safely
// Initialize accessibility module safely
try {
  if (typeof accessibility === "function") {
    accessibility(Highcharts);
  } else if (accessibility && typeof accessibility.default === "function") {
    accessibility.default(Highcharts);
  }
} catch (error) {
  console.warn("Highcharts accessibility module initialization failed:", error);
}

function Sales() {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  // Real data states
  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Filters
  const [chartFilter, setChartFilter] = useState("daily");
  const [salesStats, setSalesStats] = useState(null); // Real sales stats from new API
  const [salesView, setSalesView] = useState("recent");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, coursesRes, ebooksRes] = await Promise.all([
          getSalesDashboardData({ chartFilter }),
          getAllCourses(),
          getEbooks(),
        ]);

        if (salesRes.success) {
          setSalesStats(salesRes.data);
        }
        if (coursesRes.success) setCourses(coursesRes.data);
        if (ebooksRes.success) setEbooks(ebooksRes.data || []);
      } catch (error) {
        console.error("Error fetching sales data", error);
        toast.error("Failed to load sales data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chartFilter]);

  const lifetime = salesStats?.lifetime || {
    totalRevenue: 0,
    course: 0,
    ebook: 0,
    job: 0,
    subscription: 0,
  };

  const earningsCards = [
    {
      title: "Total Revenue",
      amount: `₹${lifetime.totalRevenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "#ef4444",
    },
    {
      title: "Course Sales",
      amount: `₹${lifetime.course.toLocaleString("en-IN")}`,
      icon: BookOpen,
      color: "#3b82f6",
    },
    {
      title: "Ebook Sales",
      amount: `₹${lifetime.ebook.toLocaleString("en-IN")}`,
      icon: Book,
      color: "#6366f1",
    },
    {
      title: "Job Postings",
      amount: `₹${lifetime.job.toLocaleString("en-IN")}`,
      icon: Briefcase,
      color: "#10b981",
    },
    {
      title: "Subscriptions",
      amount: `₹${lifetime.subscription.toLocaleString("en-IN")}`,
      icon: CreditCard,
      color: "#f97316",
    },
  ];

  // Process Chart Data
  const processChartData = () => {
    if (!salesStats?.trends)
      return {
        categories: [],
        series: [],
      };

    const rawData = salesStats.trends;
    const dates = [...new Set(rawData.map((d) => d._id.date))].sort();

    const getDataForType = (type) => {
      return dates.map((date) => {
        const found = rawData.find(
          (d) => d._id.date === date && d._id.type === type,
        );
        return found ? found.amount : 0;
      });
    };

    return {
      categories: dates.map((d) => {
        if (chartFilter === "monthly") {
          const [year, month] = d.split("-");
          return new Date(year, month - 1).toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          });
        }
        if (chartFilter === "weekly") return `Week ${d.split("-")[1]}`;
        return new Date(d).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
        });
      }),
      series: [
        { name: "Courses", data: getDataForType("course"), color: "#10b981" },
        { name: "Ebooks", data: getDataForType("ebook"), color: "#3b82f6" },
        { name: "Jobs", data: getDataForType("job"), color: "#f59e0b" },
        {
          name: "Subscriptions",
          data: getDataForType("subscription"),
          color: "#8b5cf6",
        },
      ],
    };
  };

  const chartProcessed = processChartData();

  // Highcharts configuration
  const chartOptions = {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
      height: 400,
    },
    title: {
      text: "Sales Trends",
      style: { color: colors.text, fontSize: "18px", fontWeight: "bold" },
    },
    accessibility: { enabled: false }, // Explicitly disabled
    xAxis: {
      categories: chartProcessed.categories,
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + "40",
      tickColor: colors.accent + "40",
    },
    yAxis: {
      title: { text: "Revenue (₹)", style: { color: colors.textSecondary } },
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
      valuePrefix: "₹",
    },
    plotOptions: {
      spline: {
        marker: { radius: 4, lineColor: "#666666", lineWidth: 1 },
      },
    },
    responsive: {
      rules: [
        {
          condition: { maxWidth: 500 },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
            yAxis: { title: { text: null } },
            xAxis: { labels: { rotation: -45 } },
          },
        },
      ],
    },
    series: chartProcessed.series,
    credits: { enabled: false },
  };

  // Pie chart configuration
  const earningsPieOptions = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 450,
    },
    title: { text: "", style: { color: colors.text } },
    accessibility: { enabled: false },
    tooltip: {
      backgroundColor: colors.background,
      borderColor: colors.accent,
      style: { color: colors.text },
      pointFormat:
        "Amount: <b>₹{point.y:,.0f}</b><br/>Share: <b>{point.percentage:.1f}%</b>",
    },
    plotOptions: {
      pie: {
        innerSize: "65%", // Make it a donut
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.percentage:.1f} %",
          connectorColor: colors.accent + "40",
          distance: 30, // Move labels outside
          style: {
            color: colors.textSecondary,
            textOutline: "none",
            fontSize: "12px",
            fontWeight: "500",
          },
        },
        showInLegend: true,
      },
    },
    legend: {
      itemStyle: { color: colors.text, fontWeight: "500" },
      itemHoverStyle: { color: colors.primary },
      verticalAlign: "bottom",
      layout: "horizontal",
    },
    series: [
      {
        name: "Earnings",
        colorByPoint: true,
        data: [
          { name: "Courses", y: lifetime.course, color: "#3b82f6" },
          { name: "Ebooks", y: lifetime.ebook, color: "#6366f1" },
          { name: "Jobs", y: lifetime.job, color: "#10b981" },
          {
            name: "Subscriptions",
            y: lifetime.subscription,
            color: "#f97316",
          },
        ],
      },
    ],
    credits: { enabled: false },
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          Sales Dashboard
        </h1>
        <p
          className="text-sm opacity-60 mt-1"
          style={{ color: colors.textSecondary }}
        >
          Track your revenue and sales performance (Live Data)
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: colors.text }}>
          Earnings Overview
        </h2>
        <div className="flex items-center space-x-2">
          {[
            { id: "daily", label: "By Day" },
            { id: "weekly", label: "By Week" },
            { id: "monthly", label: "By Month" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setChartFilter(filter.id)}
              className="px-4 cursor-pointer py-2 rounded-lg text-sm font-bold transition-all duration-200"
              style={{
                backgroundColor:
                  chartFilter === filter.id
                    ? colors.primary
                    : colors.accent + "20",
                color:
                  chartFilter === filter.id ? colors.background : colors.text,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 min-h-[160px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-[1px] rounded-lg">
            <Loader size={50} />
          </div>
        ) : (
          earningsCards.map((card, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border shadow-md transition-all hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.accent + "20",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: card.color + "20" }}
                >
                  <card.icon size={24} style={{ color: card.color }} />
                </div>
              </div>
              <h3
                className="text-2xl font-black mb-1"
                style={{ color: colors.text }}
              >
                {card.amount}
              </h3>
              <p
                className="text-sm font-medium opacity-60"
                style={{ color: colors.textSecondary }}
              >
                {card.title}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div
          className="w-full p-6 rounded-lg border shadow-md relative min-h-[400px]"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-[1px] rounded-lg">
              <Loader size={60} />
            </div>
          ) : (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          )}
        </div>

        <div
          className="w-full p-6 rounded-lg border shadow-md relative min-h-[450px]"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 backdrop-blur-[1px] rounded-lg">
              <Loader size={60} />
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <h3
                className="text-xl font-bold mb-8 self-start px-4"
                style={{ color: colors.text }}
              >
                Revenue Distribution (Last 6 Months)
              </h3>
              <div className="w-full">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={earningsPieOptions}
                />
              </div>

              {/* Summary Stats below Donut */}
              <div
                className="w-full grid grid-cols-2 mt-10 pt-8 border-t border-dashed"
                style={{ borderColor: colors.accent + "20" }}
              >
                <div
                  className="text-center border-r"
                  style={{ borderColor: colors.accent + "20" }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Total Items Sold
                  </p>
                  <p
                    className="text-3xl font-black"
                    style={{ color: colors.text }}
                  >
                    {lifetime.totalSalesCount || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Total Revenue
                  </p>
                  <p
                    className="text-3xl font-black"
                    style={{ color: colors.text }}
                  >
                    ₹{lifetime.totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Courses List */}
        <div
          className="p-6 rounded-lg border shadow-md relative min-h-[400px]"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Active Courses
          </h3>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px] rounded-lg">
              <Loader size={40} />
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
              {courses.slice(0, 10).map((course) => (
                <div
                  key={course._id}
                  className="flex justify-between items-center p-3 rounded border"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: colors.text }}
                    >
                      {course.title}
                    </p>
                    <p
                      className="text-xs opacity-60"
                      style={{ color: colors.textSecondary }}
                    >
                      {typeof course.category === "object"
                        ? course.category?.name
                        : course.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold text-primary"
                      style={{ color: colors.primary }}
                    >
                      {course.priceType === "free"
                        ? "Free"
                        : `₹${course.price || 0}`}
                    </p>
                    <p className="text-[10px] opacity-60 flex items-center gap-1 justify-end">
                      <Clock size={10} /> {course.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ebooks List */}
        <div
          className="p-6 rounded-lg border shadow-md relative min-h-[400px]"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Active Ebooks
          </h3>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px] rounded-lg">
              <Loader size={40} />
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
              {ebooks.slice(0, 10).map((ebook) => (
                <div
                  key={ebook._id}
                  className="flex justify-between items-center p-3 rounded border"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: colors.text }}
                    >
                      {ebook.title}
                    </p>
                    <p
                      className="text-xs opacity-60"
                      style={{ color: colors.textSecondary }}
                    >
                      {ebook.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold text-primary"
                      style={{ color: colors.primary }}
                    >
                      {ebook.priceType === "free"
                        ? "Free"
                        : `₹${ebook.price || 0}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.accent}40;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default Sales;
