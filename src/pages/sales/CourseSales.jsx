import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getAllCourses } from "../../apis/course";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  BookOpen,
  TrendingUp,
  Users,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { getSalesItemData } from "../../apis/sales";

function CourseSales() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("daily"); // "daily", "weekly", "monthly"
  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getSalesItemData({
          itemType: "course",
          chartFilter: filterType,
        });
        if (res.success) {
          setSalesData(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load course sales data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterType]);

  const statsFetched = salesData?.stats || {
    totalItems: 0,
    periodRevenue: 0,
    periodStudents: 0,
  };

  const stats = [
    {
      title: "Total Courses",
      value: statsFetched.totalItems,
      icon: BookOpen,
      color: "#10b981",
    },
    {
      title:
        filterType === "daily"
          ? "Today Revenue"
          : filterType === "weekly"
            ? "Weekly Revenue"
            : "Monthly Revenue",
      value: `₹${statsFetched.periodRevenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "#3b82f6",
    },
    {
      title:
        filterType === "daily"
          ? "Today Students"
          : filterType === "weekly"
            ? "Weekly Students"
            : "Monthly Students",
      value:
        statsFetched.periodStudents +
        (statsFetched.periodStudents > 0 ? "+" : ""),
      icon: Users,
      color: "#f59e0b",
    },
  ];

  // Logic for Line Chart (Trends)
  const processTrends = () => {
    if (!salesData?.trends) return { categories: [], data: [] };
    const raw = salesData.trends;
    return {
      categories: raw.map((t) => {
        if (filterType === "monthly") {
          const [y, m] = t._id.split("-");
          return new Date(y, m - 1).toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          });
        }
        if (filterType === "weekly") return `Week ${t._id.split("-")[1]}`;
        return new Date(t._id).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
        });
      }),
      data: raw.map((t) => t.amount),
    };
  };

  const trendProcessed = processTrends();

  const lineChartOptions = {
    chart: { type: "spline", backgroundColor: "transparent" },
    title: { text: "Course Sales Trends", style: { color: colors.text } },
    xAxis: {
      categories: trendProcessed.categories,
      labels: { style: { color: colors.textSecondary } },
    },
    yAxis: {
      title: { text: "Revenue (₹)", style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + "20",
      labels: { style: { color: colors.textSecondary } },
    },
    series: [
      {
        name: "Revenue",
        data: trendProcessed.data,
        color: colors.primary,
      },
    ],
    credits: { enabled: false },
  };

  const pieChartOptions = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 450,
    },
    title: {
      text: "",
      style: { color: colors.text },
    },
    tooltip: {
      pointFormat: "Revenue: <b>₹{point.y:,.0f}</b> ({point.percentage:.1f}%)",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: colors.text,
        fontWeight: "500",
        fontSize: "12px",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        innerSize: "0%",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.percentage:.1f} %",
          distance: 30,
          connectorColor: colors.accent + "40",
          style: {
            color: colors.textSecondary,
            fontSize: "12px",
            fontWeight: "500",
            textOutline: "none",
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "Categories",
        colorByPoint: true,
        data: (salesData?.distribution || []).map((d, i) => ({
          name: d._id,
          y: d.value,
          color: [
            "#0ea5e9",
            "#6366f1",
            "#f59e0b",
            "#10b981",
            "#ef4444",
            "#8b5cf6",
          ][i % 6],
        })),
      },
    ],
    credits: { enabled: false },
  };

  const successTransactions = salesData?.successTransactions || [];
  const failedTransactions = salesData?.failedTransactions || [];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
            Course Sales
          </h1>
          <p
            className="opacity-60 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Detailed analytics for course purchases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Global Filter:
          </span>
          <div className="flex bg-black/5 p-1 rounded-lg">
            {[
              { id: "daily", label: "By Day" },
              { id: "weekly", label: "By Week" },
              { id: "monthly", label: "By Month" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filterType === f.id ? "shadow-sm" : "opacity-40 hover:opacity-100"}`}
                style={{
                  backgroundColor:
                    filterType === f.id ? colors.primary : "transparent",
                  color: filterType === f.id ? colors.background : colors.text,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative min-h-[160px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
            <Loader size={50} />
          </div>
        ) : (
          stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border shadow-sm transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: colors.sidebar,
                borderColor: colors.accent + "20",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: stat.color + "20" }}
                >
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
              <p
                className="text-sm font-bold opacity-60 uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {stat.title}
              </p>
              <h2
                className="text-3xl font-black mt-1"
                style={{ color: colors.text }}
              >
                {stat.value}
              </h2>
            </div>
          ))
        )}
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 gap-6">
        <div
          className="p-6 rounded-xl border shadow-sm relative min-h-[400px]"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.accent + "20",
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
              <Loader size={60} />
            </div>
          ) : (
            <>
              <h3
                className="font-bold text-lg mb-6"
                style={{ color: colors.text }}
              >
                Sales Trends (
                {filterType === "daily"
                  ? "By Day"
                  : filterType === "weekly"
                    ? "By Week"
                    : "By Month"}
                )
              </h3>
              <HighchartsReact
                highcharts={Highcharts}
                options={lineChartOptions}
              />
            </>
          )}
        </div>

        <div
          className="p-6 rounded-xl border shadow-sm flex flex-col items-center relative min-h-[450px]"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.accent + "20",
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
              <Loader size={60} />
            </div>
          ) : (
            <>
              <h3
                className="font-bold text-lg mb-6 w-full text-left"
                style={{ color: colors.text }}
              >
                Course Distribution by Category
              </h3>
              <div className="w-full">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={pieChartOptions}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Transactions Table */}
      <div
        className="p-6 rounded-xl border shadow-sm overflow-hidden relative min-h-[300px]"
        style={{
          backgroundColor: colors.sidebar,
          borderColor: colors.accent + "20",
        }}
      >
        <h3
          className="font-bold text-lg mb-6 flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <CheckCircle className="text-green-500" size={20} /> Success
          Transactions
        </h3>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
            <Loader size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: colors.accent + "10",
                    color: colors.text,
                  }}
                >
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    TXN ID
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Student Name
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Mobile
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Course
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Amount
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Date
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {successTransactions.length > 0 ? (
                  successTransactions.map((txn) => (
                    <tr
                      key={txn._id}
                      className="border-b last:border-0 hover:bg-black/5 transition-colors"
                      style={{
                        borderColor: colors.accent + "05",
                        color: colors.text,
                      }}
                    >
                      <td className="p-3 font-bold opacity-60 text-[11px]">
                        {txn.razorpay?.payment?.razorpay_payment_id ||
                          txn.razorpay?.payment?.id ||
                          `#${txn._id.slice(-8)}`}
                      </td>
                      <td className="p-3 font-bold">
                        {txn.user?.name || "N/A"}
                      </td>
                      <td className="p-3 font-medium opacity-70">
                        {txn.user?.mobile || "N/A"}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">
                            {txn.itemDetails?.title || "Unknown Course"}
                          </span>
                          {txn.itemDetails?.badge &&
                            txn.itemDetails?.badge !== "normal" && (
                              <span className="text-[8px] font-black uppercase text-amber-600 w-fit px-1 rounded bg-amber-50">
                                {txn.itemDetails.badge} Course
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-green-600">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 opacity-60">
                        {new Date(txn.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3">
                        <span className="block mx-auto w-fit px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase">
                          Success
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center opacity-40">
                      No successful transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Failed Transactions Table */}
      <div
        className="p-6 rounded-xl border shadow-sm overflow-hidden relative min-h-[300px]"
        style={{
          backgroundColor: colors.sidebar,
          borderColor: colors.accent + "20",
        }}
      >
        <h3
          className="font-bold text-lg mb-6 flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <XCircle className="text-red-500" size={20} /> Failed Transactions
        </h3>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
            <Loader size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: colors.accent + "10",
                    color: colors.text,
                  }}
                >
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    TXN ID
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Student Name
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Mobile
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Course
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Amount
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Date
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60">
                    Remark
                  </th>
                  <th className="p-3 text-xs font-black uppercase opacity-60 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {failedTransactions.length > 0 ? (
                  failedTransactions.map((txn) => (
                    <tr
                      key={txn._id}
                      className="border-b last:border-0 hover:bg-black/5 transition-colors"
                      style={{
                        borderColor: colors.accent + "05",
                        color: colors.text,
                      }}
                    >
                      <td className="p-3 font-bold opacity-60 text-[11px]">
                        {txn.razorpay?.payment?.razorpay_payment_id ||
                          txn.razorpay?.payment?.id ||
                          `#${txn._id.slice(-8)}`}
                      </td>
                      <td className="p-3 font-bold">
                        {txn.user?.name || "N/A"}
                      </td>
                      <td className="p-3 font-medium opacity-70">
                        {txn.user?.mobile || "N/A"}
                      </td>
                      <td className="p-3">
                        <span className="font-bold">
                          {txn.itemDetails?.title || "Unknown Course"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-red-600">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 opacity-60">
                        {new Date(txn.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3 text-red-500/70 font-medium italic">
                        {txn.failureReason || "N/A"}
                      </td>
                      <td className="p-3">
                        <span className="block mx-auto w-fit px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                          Failed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-10 text-center opacity-40">
                      No failed transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseSales;
