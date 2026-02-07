import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  IndianRupee,
  BarChart3,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { getInstructorStats } from "../../apis/instructor";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

function InstructorHome() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {},
    salesTrend: [],
    courseDistribution: [],
  });

  const instructorData = JSON.parse(
    localStorage.getItem("instructor-data") || "{}",
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getInstructorStats();
        if (res.success) {
          setData(res);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Total Courses",
      value: data.stats.totalCourses || 0,
      icon: BookOpen,
      color: "#3b82f6",
      desc: "Courses assigned to you",
    },
    {
      title: "Active Courses",
      value: data.stats.activeCourses || 0,
      icon: CheckCircle2,
      color: "#10b981",
      desc: "Courses currently live",
    },
    {
      title: "Total Students",
      value: data.stats.totalStudents || 0,
      icon: Users,
      color: "#8b5cf6",
      desc: "Students across all courses",
    },
    {
      title: "Total Earnings",
      value: `₹${(data.stats.totalEarnings || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: "#f59e0b",
      desc: "Your total earned amount",
    },
  ];

  // Chart Configuration
  const chartOptions = {
    chart: { type: "spline", backgroundColor: "transparent", height: 350 },
    title: {
      text: "Earnings Trend (Monthly)",
      align: "left",
      style: { color: colors.text, fontSize: "18px", fontWeight: "bold" },
    },
    xAxis: {
      categories: data.salesTrend.map((item) => item._id),
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + "40",
    },
    yAxis: {
      title: { text: "Earnings (₹)", style: { color: colors.textSecondary } },
      labels: { style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + "10",
    },
    tooltip: {
      shared: true,
      backgroundColor: colors.background,
      borderColor: colors.accent,
      style: { color: colors.text },
      pointFormat: "Earnings: <b>₹{point.y}</b>",
    },
    series: [
      {
        name: "Earnings",
        data: data.salesTrend.map((item) => item.amount),
        color: colors.primary,
      },
    ],
    credits: { enabled: false },
  };

  const distChartOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 350 },
    title: {
      text: "Revenue by Course",
      align: "left",
      style: { color: colors.text, fontSize: "18px", fontWeight: "bold" },
    },
    tooltip: {
      pointFormat: "{series.name}: <b>₹{point.y}</b> ({point.percentage:.1f}%)",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>",
          style: { color: colors.textSecondary },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "Revenue",
        colorByPoint: true,
        data: data.courseDistribution.map((item) => ({
          name: item.name,
          y: item.revenue,
        })),
      },
    ],
    credits: { enabled: false },
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-20">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto scrollbar-hide">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-lg shadow-sm"
            style={{
              backgroundColor: colors.primary + "20",
              color: colors.primary,
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Hello, {instructorData.fullName || "Instructor"}! 👋
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: colors.textSecondary }}
            >
              Here's what's happening with your courses today.
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm"
          style={{
            backgroundColor: colors.sidebar,
            color: colors.textSecondary,
            border: `1px solid ${colors.accent}20`,
          }}
        >
          <Calendar size={14} />
          {new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-2.5 rounded-xl"
                style={{
                  backgroundColor: stat.color + "15",
                  color: stat.color,
                }}
              >
                <stat.icon size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                {stat.value}
              </h3>
              <p
                className="text-sm font-semibold opacity-80"
                style={{ color: colors.text }}
              >
                {stat.title}
              </p>
              <p
                className="text-xs opacity-50"
                style={{ color: colors.textSecondary }}
              >
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Earnings Trend */}
        <div
          className="p-6 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          {data.salesTrend.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center opacity-40">
              <BarChart3 size={48} className="mb-4" />
              <p>No sales data available yet</p>
            </div>
          )}
        </div>

        {/* Distribution Chart */}
        <div
          className="p-6 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          {data.courseDistribution.length > 0 ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={distChartOptions}
            />
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center opacity-40">
              <TrendingUp size={48} className="mb-4" />
              <p>No revenue distribution available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div
        className="p-6 rounded-2xl border shadow-sm"
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "20",
        }}
      >
        <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
          Recent Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.accent + "10" }}
              >
                <th
                  className="pb-4 font-semibold opacity-60"
                  style={{ color: colors.textSecondary }}
                >
                  Course Name
                </th>
                <th
                  className="pb-4 font-semibold opacity-60 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  Sales
                </th>
                <th
                  className="pb-4 font-semibold opacity-60 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  Total Revenue
                </th>
                <th
                  className="pb-4 font-semibold opacity-60 text-right"
                  style={{ color: colors.textSecondary }}
                >
                  Your Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {data.courseDistribution.map((item, i) => (
                <tr
                  key={i}
                  className="group hover:bg-black/5 transition-colors"
                >
                  <td
                    className="py-4 font-medium"
                    style={{ color: colors.text }}
                  >
                    {item.name}
                  </td>
                  <td
                    className="py-4 text-center"
                    style={{ color: colors.text }}
                  >
                    {item.sales}
                  </td>
                  <td
                    className="py-4 text-center font-bold"
                    style={{ color: colors.text }}
                  >
                    ₹{item.revenue.toLocaleString()}
                  </td>
                  <td
                    className="py-4 text-right font-bold"
                    style={{ color: colors.primary }}
                  >
                    ₹{item.earnings.toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.courseDistribution.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center opacity-40"
                    style={{ color: colors.textSecondary }}
                  >
                    Assign courses and start selling to see performance data.
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

export default InstructorHome;
