import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Menu,
  Settings,
  X,
  BarChart3,
  BookOpen,
  IndianRupee,
  TrendingUp,
  LogOut,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { Clock } from "../../dashboard/Clock";
import logo from "../../assets/logo.png";
import mainLogo from "../../assets/mainLogo.png";

const InstructorDashboard = () => {
  const { colors, isDarkMode, toggleTheme, currentTheme, themes, setTheme } =
    useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const instructorData = JSON.parse(
    localStorage.getItem("instructor-data") || "{}",
  );
  const instructorName = instructorData.fullName || "Instructor";
  const instructorEmail = instructorData.email || "";

  const navLinks = [
    { name: "Dashboard", icon: BarChart3, path: "/instructor-dashboard" },
    {
      name: "My Courses",
      icon: BookOpen,
      path: "/instructor-dashboard/my-courses",
    },
    // { name: 'Salary', icon: IndianRupee, path: '/instructor-dashboard/salary' },
    {
      name: "My Earning",
      icon: TrendingUp,
      path: "/instructor-dashboard/earnings",
    },
    {
      name: "Profile",
      icon: GraduationCap,
      path: "/instructor-dashboard/profile",
    },
  ];

  const themeOptions = [
    { name: "Mono", key: "mono", color: "#000000" },
    { name: "Cyan", key: "cyan", color: "#0EA5E9" },
    { name: "Neon", key: "neon", color: "#22C55E" },
    { name: "Warm", key: "warm", color: "#C2410C" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("instructorEmail");
    localStorage.removeItem("instructor-token");
    localStorage.removeItem("instructor-data");
    navigate("/instructor-login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsOpen && !event.target.closest(".settings-modal")) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  return (
    <div
      className="flex h-screen relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-700 ease-out border-r md:relative md:z-auto flex flex-col ${
          sidebarOpen
            ? "translate-x-0 w-64 "
            : "-translate-x-full w-64 md:translate-x-0 md:w-18"
        }`}
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        <div
          className="p-4 flex items-center justify-center border-b h-15"
          style={{ borderColor: colors.accent + "30" }}
        >
          {sidebarOpen ? (
            <div className="transition-all duration-500 ease-out flex items-center justify-center w-full">
              <img
                src={mainLogo}
                className="max-w-[140px] h-auto object-contain"
                alt="CodersAdda"
              />
            </div>
          ) : (
            <div className="w-10  h-10 flex items-center justify-center transition-all duration-500 overflow-hidden">
              <img
                src={logo}
                className="w-full h-full object-contain scale-[1]"
                alt="CA"
              />
            </div>
          )}
        </div>
        <nav className="mt-5 pt-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={index}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2 mx-2 rounded mb-2 transition-all duration-200 ${
                  isActive ? "ring-1" : ""
                } ${!sidebarOpen ? "justify-center border-none ring-0" : ""}`}
                style={{
                  color: isActive ? colors.primary : colors.text,
                  backgroundColor: isActive
                    ? colors.primary + "20"
                    : "transparent",
                  ringColor: isActive ? colors.primary : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.target.style.backgroundColor = colors.primary + "20";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.backgroundColor = "transparent";
                }}
                title={!sidebarOpen ? link.name : ""}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}
                >
                  {link.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div
          className="p-4 border-t"
          style={{ borderColor: colors.accent + "30" }}
        >
          <button
            onClick={handleLogout}
            className={`flex cursor-pointer items-center px-4 py-3 w-full rounded transition-all duration-200 font-semibold ${!sidebarOpen ? "justify-center" : ""}`}
            style={{ color: "#DC2626" }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#DC262620";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="h-17 border-b flex items-center px-4 md:px-6 relative"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.accent + "30",
          }}
        >
          <div className="flex items-center space-x-2 md:space-x-4 flex-1">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 rounded hover:bg-opacity-20 transition-colors cursor-pointer"
              style={{ color: colors.primary }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1
                className="text-sm md:text-xl font-semibold"
                style={{ color: colors.text }}
              >
                Instructor Panel
              </h1>
              <span
                className="text-xs md:text-sm"
                style={{ color: colors.textSecondary }}
              >
                {instructorName}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 flex-1 justify-end">
            <div
              className="text-sm md:text-base font-bold"
              style={{ color: colors.primary }}
            >
              <Clock />
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 cursor-pointer rounded-lg transition-colors"
              style={{ color: colors.primary }}
            >
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div
              className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary"
              style={{
                backgroundColor: colors.primary + "10",
                color: colors.primary,
              }}
            >
              <GraduationCap size={20} />
            </div>
          </div>
        </header>

        <div
          className="h-full w-full p-4 md:p-6 overflow-auto scrollbar-hide"
          style={{ backgroundColor: colors.background }}
        >
          <div className="max-w-full h-full flex flex-col">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <div
        className={`settings-modal fixed top-0 right-0 w-full sm:w-80 z-50 h-screen shadow-2xl transition-all duration-500 ease-in-out ${settingsOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="p-6 border-l h-full"
          style={{ borderColor: colors.accent + "30" }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              Dashboard Settings
            </h2>
            <button
              onClick={() => setSettingsOpen(false)}
              style={{ color: colors.textSecondary }}
              className="p-2 hover:bg-black/5 rounded-full cursor-pointer transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <h3
              className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4"
              style={{ color: colors.text }}
            >
              Appearance
            </h3>
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: colors.accent + "05" }}
            >
              <span className="font-medium" style={{ color: colors.text }}>
                Dark Mode
              </span>
              <button
                onClick={toggleTheme}
                className={`w-12 cursor-pointer h-6 rounded-full relative transition-all duration-300 ${isDarkMode ? "bg-primary" : "bg-gray-200"}`}
                style={{ backgroundColor: isDarkMode ? colors.primary : "" }}
              >
                <div
                  className={`w-5 h-5 rounded-full absolute top-0.5 transition-all duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-0.5"} bg-white shadow-sm`}
                  style={{
                    backgroundColor:
                      currentTheme === "mono"
                        ? isDarkMode
                          ? "#000000"
                          : "#ffffff"
                        : isDarkMode
                          ? "#ffffff"
                          : "#000000",
                  }}
                ></div>
              </button>
            </div>
          </div>

          <div>
            <h3
              className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4"
              style={{ color: colors.text }}
            >
              Color Themes
            </h3>
            <div className="space-y-3">
              {themeOptions.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setTheme(theme.key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${currentTheme === theme.key ? "border-2" : "border border-transparent"}`}
                  style={{
                    backgroundColor: colors.accent + "05",
                    borderColor:
                      currentTheme === theme.key
                        ? colors.primary
                        : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full shadow-inner"
                      style={{ backgroundColor: theme.color }}
                    ></div>
                    <span
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      {theme.name}
                    </span>
                  </div>
                  {currentTheme === theme.key && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
