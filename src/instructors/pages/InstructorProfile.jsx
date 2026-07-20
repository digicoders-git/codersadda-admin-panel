import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  User,
  Mail,
  Shield,
  UserCircle,
  Briefcase,
  Calendar,
  IdCard,
} from "lucide-react";
import { getInstructorProfile } from "../../apis/instructor";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function InstructorProfile() {
  const { colors } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getInstructorProfile();
        if (res.success) {
          setData(res.instructor);
        }
      } catch (error) {
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-20">
        <Loader size={80} />
      </div>
    );
  }

  const cardStyle = {
    backgroundColor: colors.sidebar || colors.background,
    borderColor: colors.accent + "20",
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: colors.primary + "20",
            color: colors.primary,
          }}
        >
          <UserCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            My Profile
          </h1>
          <p
            className="text-sm opacity-60"
            style={{ color: colors.textSecondary }}
          >
            Manage your personal information and credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div
            className="p-8 rounded-2xl border shadow-sm text-center"
            style={cardStyle}
          >
            <div className="relative inline-block mb-6">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4"
                style={{
                  backgroundColor: colors.primary + "10",
                  color: colors.primary,
                  borderColor: colors.primary + "30",
                }}
              >
                {data?.fullName?.charAt(0) || "I"}
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white"></div>
            </div>

            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {data?.fullName}
            </h2>
            <p
              className="text-sm rounded-full px-4 py-1 inline-block mb-6"
              style={{
                backgroundColor: colors.primary + "15",
                color: colors.primary,
              }}
            >
              {data?.role || "Instructor"}
            </p>

            <div
              className="space-y-4 pt-6 border-t"
              style={{ borderColor: colors.accent + "10" }}
            >
              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="opacity-40"
                  style={{ color: colors.text }}
                />
                <span
                  className="text-sm truncate"
                  style={{ color: colors.textSecondary }}
                >
                  {data?.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IdCard
                  size={18}
                  className="opacity-40"
                  style={{ color: colors.text }}
                />
                <span
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Instructor ID: {data?.instructorId}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar
                  size={18}
                  className="opacity-40"
                  style={{ color: colors.text }}
                />
                <span
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Joined: {new Date(data?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-2xl border shadow-sm" style={cardStyle}>
            <h3
              className="text-lg font-bold mb-8 flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <Shield size={20} className="text-blue-500" /> Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  className="text-xs font-bold uppercase opacity-40 mb-2 block"
                  style={{ color: colors.text }}
                >
                  Full Name
                </label>
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: colors.accent + "10",
                    color: colors.text,
                  }}
                >
                  {data?.fullName}
                </div>
              </div>
              <div>
                <label
                  className="text-xs font-bold uppercase opacity-40 mb-2 block"
                  style={{ color: colors.text }}
                >
                  Email Address
                </label>
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: colors.accent + "10",
                    color: colors.text,
                  }}
                >
                  {data?.email}
                </div>
              </div>
              <div>
                <label
                  className="text-xs font-bold uppercase opacity-40 mb-2 block"
                  style={{ color: colors.text }}
                >
                  Designation / Role
                </label>
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: colors.accent + "10",
                    color: colors.text,
                  }}
                >
                  {data?.role}
                </div>
              </div>
              <div>
                <label
                  className="text-xs font-bold uppercase opacity-40 mb-2 block"
                  style={{ color: colors.text }}
                >
                  Account Status
                </label>
                <div
                  className="flex items-center gap-2 p-3 rounded-lg border"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${data?.isActive ? "bg-green-500" : "bg-red-500"}`}
                  ></span>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: colors.text }}
                  >
                    {data?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <h4 className="text-sm font-bold text-orange-500 mb-2">Notice</h4>
              <p
                className="text-xs opacity-70"
                style={{ color: colors.textSecondary }}
              >
                Profile editing is currently managed by the administration. If
                you need to update your primary details or change your password,
                please contact the support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorProfile;
