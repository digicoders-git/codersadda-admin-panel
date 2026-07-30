import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  Wrench,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  getServices,
  deleteService as apiDeleteService,
  toggleServiceStatus as apiToggleServiceStatus,
  updateService as apiUpdateService,
} from "../../apis/service";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";

function WebsiteServices() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      const res = await getServices();
      if (res.success) {
        const mapped = res.data.map(item => ({
          ...item,
          status: item.isActive ? "Active" : "Disabled",
          iconUrl: item.icon?.url || item.icon?.localUrl || "https://placehold.co/100x100?text=Service"
        }));
        setServices(mapped);
      }
    } catch (err) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  const filteredServices = services.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmColor: "#d33",
      cancelColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await apiDeleteService(id);
        if (res.success) {
          toast.success("Service deleted successfully!");
          setServices((prev) => prev.filter((item) => item._id !== id));
        }
      } catch (err) {
        toast.error("Failed to delete service");
      }
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      const res = await apiToggleServiceStatus(id);
      if (res.success) {
        const isNowActive = res.isActive !== undefined ? res.isActive : true;
        setServices((prev) =>
          prev.map((s) =>
            s._id === id
              ? {
                  ...s,
                  isActive: isNowActive,
                  status: isNowActive ? "Active" : "Disabled",
                }
              : s,
          ),
        );
        toast.success(`Service status updated successfully`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handlePlatformChange = async (id, newPlatform) => {
    try {
      const formData = new FormData();
      formData.append("displayPlatform", newPlatform);
      const res = await apiUpdateService(id, formData);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, displayPlatform: newPlatform } : s)),
        );
        toast.success("Display platform updated!");
      }
    } catch (err) {
      toast.error("Failed to update display platform");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Wrench size={24} style={{ color: colors.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Website Services
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Manage website and app services
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/website/services/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow transition-all hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            size={18}
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm transition-all"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
              color: colors.text,
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border transition-all ${
              viewMode === "grid" ? "bg-purple-100 border-purple-500" : ""
            }`}
            style={{ color: colors.text }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border transition-all ${
              viewMode === "list" ? "bg-purple-100 border-purple-500" : ""
            }`}
            style={{ color: colors.text }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Wrench
              size={48}
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-semibold mt-4"
              style={{ color: colors.textSecondary }}
            >
              No services found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="relative h-40 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                  <img
                    src={service.iconUrl}
                    alt={service.title}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleStatusToggle(service._id)}
                      className={`px-2 py-1 rounded text-xs font-bold text-white cursor-pointer transition-all hover:opacity-80 ${
                        service.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {service.isActive ? "Active" : "Disabled"}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: colors.text }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm line-clamp-3 mb-4"
                    style={{ color: colors.textSecondary }}
                  >
                    {service.description ? service.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : ""}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <select
                      value={service.displayPlatform || "both"}
                      onChange={(e) => handlePlatformChange(service._id, e.target.value)}
                      className="text-xs font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 outline-none cursor-pointer"
                    >
                      <option value="both">Both</option>
                      <option value="app">App Only</option>
                      <option value="website">Website Only</option>
                      <option value="none">None</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/website/services/edit/${service._id}`)}
                        className="p-1.5 rounded hover:bg-slate-100 text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="p-1.5 rounded hover:bg-slate-100 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="rounded-lg border shadow-sm p-4 transition-all hover:shadow-md"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "20",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center p-2">
                    <img
                      src={service.iconUrl}
                      alt={service.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-lg mb-1"
                      style={{ color: colors.text }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: colors.textSecondary }}
                    >
                      {service.description ? service.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={service.displayPlatform || "both"}
                      onChange={(e) => handlePlatformChange(service._id, e.target.value)}
                      className="text-xs font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 outline-none cursor-pointer"
                    >
                      <option value="both">Both (App & Website)</option>
                      <option value="app">App Only</option>
                      <option value="website">Website Only</option>
                      <option value="none">None (Hidden)</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <Toggle
                        active={service.isActive}
                        onClick={() => handleStatusToggle(service._id)}
                      />
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${service.isActive ? "text-green-500" : "text-red-500"}`}
                      >
                        {service.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/website/services/edit/${service._id}`)}
                        className="p-1.5 rounded hover:bg-slate-100 text-blue-600 cursor-pointer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="p-1.5 rounded hover:bg-slate-100 text-red-600 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteServices;
