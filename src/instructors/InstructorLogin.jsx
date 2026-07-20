import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { instructorLogin } from "../apis/instructor";

const InstructorLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-data");
    localStorage.removeItem("instructor-token");
    localStorage.removeItem("instructor-data");
    localStorage.removeItem("userRole");
  }, []);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error("Please enter credentials");
    }

    setLoading(true);
    try {
      const res = await instructorLogin(formData);
      if (res.success) {
        localStorage.setItem("userRole", "instructor");
        localStorage.setItem("instructor-token", res.token);
        localStorage.setItem("instructor-data", JSON.stringify(res.instructor));
        localStorage.setItem("instructorEmail", res.instructor.email);
        toast.success("Instructor Login Successful!");
        navigate("/instructor-dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Instructor Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="instructor@example.com"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="*******"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
          >
            ← Back to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorLogin;
