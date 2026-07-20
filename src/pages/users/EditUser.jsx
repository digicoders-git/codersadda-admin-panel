import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getUsers, updateUser as apiUpdateUser } from "../../apis/user";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function EditUser() {
  const { colors } = useTheme();
  // const { users, updateUser } = useData(); // Removed
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    semester: "",
    technology: "", // stored as string for editing
    skills: "", // stored as string for editing
    status: "Active",
    social: {
      github: "",
      linkedin: "",
      portfolio: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUsers();
        if (res.success) {
          const found = res.data.find((u) => u._id === id);
          if (found) {
            setFormData({
              ...found,
              technology: found.technology ? found.technology.join(", ") : "",
              skills: found.skills ? found.skills.join(", ") : "",
              social: found.social || {
                github: "",
                linkedin: "",
                portfolio: "",
              },
            });
          } else {
            toast.error("User not found");
            navigate("/dashboard/users");
          }
        }
      } catch (error) {
        toast.error("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.warning("Name and Email are required");
      return;
    }

    const updatedData = {
      ...formData,
      technology: formData.technology
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      setActionLoading(true);
      const res = await apiUpdateUser(id, updatedData);
      if (res.success) {
        toast.success("User profile updated successfully!");
        navigate("/dashboard/users");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating user");
    } finally {
      setActionLoading(false);
    }
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "8px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.accent + "30",
    color: colors.text,
  };

  return (
    <div className="w-full mx-auto pb-20 pt-4 px-4 h-full overflow-auto">
      <div className="flex items-center gap-4 mb-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded transition-all cursor-pointer border"
          style={{
            color: colors.text,
            backgroundColor: colors.sidebar || colors.background,
            borderColor: colors.accent + "20",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Edit User Identity
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
            Update Student Information
          </p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader size={80} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Section: Basic Info */}
          <div
            className="p-8 rounded border shadow-sm space-y-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3
              className="text-sm font-bold opacity-40 uppercase tracking-widest border-b pb-2 mb-4"
              style={{ borderColor: colors.accent + "10" }}
            >
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all cursor-pointer focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Info */}
          <div
            className="p-8 rounded border shadow-sm space-y-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3
              className="text-sm font-bold opacity-40 uppercase tracking-widest border-b pb-2 mb-4"
              style={{ borderColor: colors.accent + "10" }}
            >
              Academic Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label style={labelStyle}>College Name</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) =>
                    setFormData({ ...formData, college: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Course / Stream</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section: Skills & Social */}
          <div
            className="p-8 rounded border shadow-sm space-y-6"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "20",
            }}
          >
            <h3
              className="text-sm font-bold opacity-40 uppercase tracking-widest border-b pb-2 mb-4"
              style={{ borderColor: colors.accent + "10" }}
            >
              Skills & Social Profiles
            </h3>

            <div className="space-y-4">
              <div>
                <label style={labelStyle}>
                  Technology Stack (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.technology}
                  onChange={(e) =>
                    setFormData({ ...formData, technology: e.target.value })
                  }
                  placeholder="e.g. MERN, Flutter, Python"
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Skills (Comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  placeholder="e.g. JavaScript, Dart, UI Design"
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <label style={labelStyle}>GitHub URL</label>
                <input
                  type="text"
                  value={formData.social?.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, github: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input
                  type="text"
                  value={formData.social?.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, linkedin: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <label style={labelStyle}>Portfolio URL</label>
                <input
                  type="text"
                  value={formData.social?.portfolio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, portfolio: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded border outline-none text-sm font-semibold transition-all focus:ring-1 focus:ring-blue-500"
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer hover:bg-opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              {actionLoading ? <Loader size={18} /> : <Save size={18} />}
              Update Profile
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/users")}
              className="flex-1 py-4 rounded font-black text-xs uppercase tracking-widest border opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-3 cursor-pointer hover:bg-black/5"
              style={{ borderColor: colors.accent + "30", color: colors.text }}
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EditUser;
