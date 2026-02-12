import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Menu,
  Settings,
  Bell,
  X,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Book,
  LogOut,
  ChartBarStacked,
  Briefcase,
  CreditCard,
  ChevronDown,
  Image as ImageIcon,
  Film,
  FileQuestion,
  Share2,
  GraduationCap,
  Globe,
} from "lucide-react";
import { Clock } from "./Clock";
import logo from "../assets/logo.png";
import logoo from "../assets/logoo.png";
import mainLogo from "../assets/mainLogo.png";

const Dashboard = () => {
  const {
    colors,
    isDarkMode,
    toggleTheme,
    currentTheme,
    themes,
    setTheme,
    sidebarOpen,
    setSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    rightSidebarContent,
    setRightSidebarContent,
    headerTitle,
    setHeaderTitle,
  } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  // const [currentTime, setCurrentTime] = useState(new Date())
  const location = useLocation();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date())
  //   }, 1000)
  //   return () => clearInterval(timer)
  // }, [])

  // const getGreeting = () => {
  //   const hour = currentTime.getHours()
  //   if (hour < 12) return 'Good Morning'
  //   if (hour < 17) return 'Good Afternoon'
  //   return 'Good Evening'
  // }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  // Reset Right Sidebar on Route Change
  useEffect(() => {
    setRightSidebarOpen(false);
    setRightSidebarContent(null);
    setHeaderTitle("Welcome Back");
    setSidebarOpen(true);
  }, [
    location.pathname,
    setRightSidebarOpen,
    setRightSidebarContent,
    setHeaderTitle,
    setSidebarOpen,
  ]);

  const navLinks = [
    { name: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { name: "Users", icon: Users, path: "/dashboard/users" },
    {
      name: "Sales",
      icon: TrendingUp,
      submenu: [
        { name: "Dashboard", path: "/dashboard/sales" },
        { name: "Course Sales", path: "/dashboard/sales/courses" },
        { name: "Ebooks Sales", path: "/dashboard/sales/ebooks" },
        { name: "Jobs Sales", path: "/dashboard/sales/jobs" },
        { name: "Subscription", path: "/dashboard/sales/subscriptions" },
      ],
    },
    {
      name: "Instructors",
      icon: GraduationCap,
      submenu: [
        { name: "All Instructors", path: "/dashboard/instructors" },
        { name: "Create Instructor", path: "/dashboard/instructors/add" },
      ],
    },
    {
      name: "Courses",
      icon: FileText,
      submenu: [
        { name: "Category", path: "/dashboard/category" },
        { name: "Add Course", path: "/dashboard/courses/add" },
        { name: "All Courses", path: "/dashboard/courses" },
        { name: "All Topics", path: "/dashboard/courses/topics" },
        { name: "All Lectures", path: "/dashboard/lectures" },
        { name: "Add Lecture", path: "/dashboard/lectures/create" },
        {
          name: "Manage Certificate",
          path: "/dashboard/courses/manage-certificates",
        },
        { name: "Enrolled Students", path: "/dashboard/courses/enrolled" },
      ],
    },
    {
      name: "E-Books",
      icon: Book,
      submenu: [
        { name: "Category", path: "/dashboard/ebookCategory" },
        { name: "Add Ebooks", path: "/dashboard/ebooks/add" },
        { name: "All Ebooks", path: "/dashboard/ebooks" },
        { name: "Enrolled Students", path: "/dashboard/ebooks/enrolled" },
      ],
    },
    {
      name: "Jobs",
      icon: Briefcase,
      submenu: [
        { name: "All Jobs", path: "/dashboard/jobs" },
        { name: "Add Jobs", path: "/dashboard/jobs/add" },
        { name: "Enrolled Students", path: "/dashboard/jobs/enrolled" },
      ],
    },
    {
      name: "Subscription",
      icon: CreditCard,
      submenu: [
        { name: "All Subscription", path: "/dashboard/subscriptions" },
        { name: "Add Subscription", path: "/dashboard/subscriptions/add" },
        {
          name: "Enrolled Students",
          path: "/dashboard/subscriptions/enrolled",
        },
      ],
    },
    { name: "Slider", icon: ImageIcon, path: "/dashboard/slider" },
    { name: "Shorts", icon: Film, path: "/dashboard/shorts" },
    {
      name: "Quizzes",
      icon: FileQuestion,
      submenu: [
        { name: "Add Topic", path: "/dashboard/quizzes/topics" },
        { name: "All Quizzes", path: "/dashboard/quizzes" },
        {
          name: "Manage Certificate",
          path: "/dashboard/quizzes/manage-certificates",
        },
      ],
    },
    { name: "Referrals", icon: Share2, path: "/dashboard/referrals" },
    {
      name: "Website",
      icon: Globe,
      submenu: [
        { name: "Courses", path: "/dashboard/website/courses" },
        { name: "Categories", path: "/dashboard/website/categories" },
        { name: "Student Reviews", path: "/dashboard/website/reviews" },
        { name: "Blogs", path: "/dashboard/website/blogs" },
        { name: "Subscriptions", path: "/dashboard/website/subscriptions" },
      ],
    },
  ];

  const themeOptions = [
    { name: "Mono", key: "mono", color: "#000000" },
    { name: "Cyan", key: "cyan", color: "#0EA5E9" },
    { name: "Neon", key: "neon", color: "#22C55E" },
    { name: "Warm", key: "warm", color: "#C2410C" },
  ];

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
            if (link.submenu) {
              const isOpen = openSubmenu === link.name;
              const isAnySubmenuActive = link.submenu.some((sub) => {
                return location.pathname === sub.path;
              });

              return (
                <div key={index}>
                  <button
                    onClick={() => setOpenSubmenu(isOpen ? null : link.name)}
                    className={`flex items-center justify-between w-[93%] px-4 py-2 mx-2 rounded mb-1 transition-all duration-200 cursor-pointer ${
                      isAnySubmenuActive ? "ring-1" : ""
                    } ${!sidebarOpen ? "justify-center! w-auto!" : ""}`}
                    style={{
                      color: isAnySubmenuActive ? colors.primary : colors.text,
                      backgroundColor: isAnySubmenuActive
                        ? colors.primary + "20"
                        : "transparent",
                      ringColor: isAnySubmenuActive
                        ? colors.primary
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isAnySubmenuActive) {
                        e.currentTarget.style.backgroundColor =
                          colors.primary + "20";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAnySubmenuActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    title={!sidebarOpen ? link.name : ""}
                  >
                    <div
                      className={`flex items-center ${!sidebarOpen ? "justify-center" : ""}`}
                    >
                      <link.icon className="w-5 h-5 shrink-0" />
                      <span
                        className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}
                      >
                        {link.name}
                      </span>
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen && sidebarOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-8 mr-2 mb-2 space-y-1 pt-1">
                      {link.submenu.map((sublink, subIndex) => {
                        let isSubActive = location.pathname === sublink.path;

                        return (
                          <NavLink
                            key={subIndex}
                            to={sublink.path}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                setSidebarOpen(false);
                              }
                            }}
                            className="flex items-center px-4 py-2 rounded transition-all duration-200"
                            style={{
                              color: isSubActive ? colors.primary : colors.text,
                              backgroundColor: isSubActive
                                ? colors.primary + "10"
                                : "transparent",
                              fontSize: "13px",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.backgroundColor =
                                  colors.primary + "10";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                          >
                            {sublink.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive =
              location.pathname === link.path ||
              (link.path === "/dashboard" &&
                (location.pathname === "/dashboard" ||
                  location.pathname === "/dashboard/home"));
            return (
              <NavLink
                key={index}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center px-4 py-2 mx-2 rounded mb-2 transition-all duration-200 ${
                  isActive ? "ring-1" : ""
                } ${!sidebarOpen ? "justify-center" : ""}`}
                style={{
                  color: isActive ? colors.primary : colors.text,
                  backgroundColor: isActive
                    ? colors.primary + "20"
                    : "transparent",
                  ringColor: isActive ? colors.primary : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      colors.primary + "20";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
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
            onClick={() => {
              localStorage.removeItem("admin-token");
              localStorage.removeItem("admin-data");
              navigate("/");
            }}
            className={`flex cursor-pointer items-center px-4 py-3 w-full rounded transition-all duration-200 font-semibold ${!sidebarOpen ? "justify-center" : ""}`}
            style={{ color: "#DC2626" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#DC262620";
              e.currentTarget.style.color = "#B91C1C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#DC2626";
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
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-700 ease-in-out ${rightSidebarOpen ? "mr-80 md:mr-96" : "mr-0"}`}
      >
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
              onClick={(e) => {
                setSidebarOpen((prev) => !prev);
              }}
              className="p-2 rounded hover:bg-opacity-20 transition-colors cursor-pointer md:hidden"
              style={{
                color: colors.primary,
                zIndex: 10,
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.primary + "20")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Menu className="w-6 h-6" style={{ pointerEvents: "none" }} />
            </button>
            <button
              onClick={(e) => {
                setSidebarOpen((prev) => !prev);
              }}
              className="p-2 rounded hover:bg-opacity-20 transition-colors cursor-pointer hidden md:block"
              style={{
                color: colors.primary,
                zIndex: 10,
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.primary + "20")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Menu className="w-6 h-6" style={{ pointerEvents: "none" }} />
            </button>
            <div className="flex flex-col">
              <h1
                className="text-sm md:text-xl font-bold"
                style={{
                  color: colors.text,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {headerTitle}
              </h1>
              <span
                className="text-xs md:text-sm"
                style={{ color: colors.textSecondary }}
              >
                DigiCoders
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.primary + "20")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {/* <Settings className='w-5 h-5 md:w-6 md:h-6' /> */}
            </button>
            <div
              className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.accent }}
            >
              <span className="text-white font-semibold text-sm">
                <img src={logoo} alt="logo" className="rounded-full" />
              </span>
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

      {/* Right Sidebar - Integrated */}
      <div
        className={`fixed top-0 right-0 h-full z-40 transition-all duration-700 ease-in-out border-l flex flex-col w-80 md:w-96 shadow-none ${
          rightSidebarOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: colors.sidebar || colors.background,
          borderColor: colors.accent + "30",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {rightSidebarContent}
      </div>

      {/* Settings Modal */}
      <div
        className={`settings-modal fixed top-0 right-0 w-full sm:w-80 z-50 transform transition-all duration-700 ease-out ${
          settingsOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        } shadow-2xl`}
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="p-6 border-l h-auto"
          style={{ borderColor: colors.accent + "30" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              Settings
            </h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
              style={{ color: colors.textSecondary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.accent + "20")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Appearance
            </h3>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: colors.accent + "10" }}
            >
              <span style={{ color: colors.text }}>Dark Mode</span>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 cursor-pointer rounded-full transition-all duration-300 relative ${
                  isDarkMode ? "bg-opacity-100" : "bg-opacity-30"
                }`}
                style={{ backgroundColor: colors.primary }}
              >
                <div
                  className={`w-5 h-5 rounded-full absolute top-0.5 transition-all duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-0.5"}`}
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

          {/* Color Themes */}
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Color Theme
            </h3>
            <div className="space-y-3">
              {themeOptions.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setTheme(theme.key)}
                  className={`w-full cursor-pointer flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-opacity-20 ${
                    currentTheme === theme.key ? "ring-2" : ""
                  }`}
                  style={{
                    backgroundColor: colors.accent + "10",
                    ringColor:
                      currentTheme === theme.key
                        ? colors.primary
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (currentTheme !== theme.key) {
                      e.currentTarget.style.backgroundColor =
                        colors.accent + "20";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.accent + "10";
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    ></div>
                    <span style={{ color: colors.text }}>{theme.name}</span>
                  </div>
                  {currentTheme === theme.key && (
                    <svg
                      className="w-5 h-5"
                      style={{ color: colors.primary }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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

export default Dashboard;
