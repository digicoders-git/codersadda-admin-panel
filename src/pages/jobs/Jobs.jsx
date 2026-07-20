import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  getJobs,
  deleteJob as apiDeleteJob,
  toggleJobStatus as apiToggleJobStatus,
} from "../../apis/job";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
} from "lucide-react";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
// import LinkIcon from "../../components/ui/LinkIcon";
import Toggle from "../../components/ui/Toggle";
import ModernSelect from "../../components/ModernSelect";

function Jobs() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterExperience, setFilterExperience] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        workType: filterType === "All" ? undefined : filterType,
        experience: filterExperience === "All" ? undefined : filterExperience,
        status: filterStatus === "All" ? undefined : filterStatus,
      };
      const res = await getJobs(params);
      if (res.success) {
        setJobs(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterType, filterExperience, filterStatus]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setActionLoading(id);
          const res = await apiDeleteJob(id);
          if (res.success) {
            toast.success("Job deleted successfully");
            setJobs((prev) => prev.filter((job) => job._id !== id));
          }
        } catch (err) {
          toast.error("Failed to delete job");
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const toggleJobStatus = async (id, currentStatus) => {
    try {
      const res = await apiToggleJobStatus(id);
      if (res.success) {
        const newStatus = currentStatus === "Active" ? "Disabled" : "Active";
        setJobs((prev) =>
          prev.map((job) =>
            job._id === id ? { ...job, jobStatus: newStatus } : job,
          ),
        );
        toast.info(`Job ${newStatus}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Manage Jobs
          </h1>
          <p
            className="text-sm opacity-60"
            style={{ color: colors.textSecondary }}
          >
            Explore and manage professional opportunities
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/jobs/add")}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          style={{ backgroundColor: colors.primary, color: colors.background }}
        >
          <Plus size={18} /> Add New Job
        </button>
      </div>

      <div
        className="rounded mb-6"
        style={{
          borderColor: colors.accent + "20",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader size={80} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
              <div className="md:col-span-3 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.text + "30",
                    color: colors.text,
                  }}
                />
              </div>
              <div className="md:col-span-3">
                <ModernSelect
                  options={[
                    { label: "All Job Types", value: "All" },
                    { label: "Work From Home", value: "Work From Home" },
                    { label: "Work From Office", value: "Work From Office" },
                    { label: "Hybrid", value: "Hybrid" },
                  ]}
                  value={filterType}
                  onChange={setFilterType}
                  placeholder="Filter by Type"
                />
              </div>
              <div className="md:col-span-2">
                <ModernSelect
                  options={[
                    { label: "All Experience", value: "All" },
                    { label: "Fresher", value: "Fresher" },
                    { label: "1-2 Years", value: "1-2 Years" },
                    { label: "3-5 Years", value: "3-5 Years" },
                    { label: "5+ Years", value: "5+ Years" },
                  ]}
                  value={filterExperience}
                  onChange={setFilterExperience}
                  placeholder="Filter by Experience"
                />
              </div>
              <div className="md:col-span-2">
                <ModernSelect
                  options={[
                    { label: "All Status", value: "All" },
                    { label: "Active", value: "Active" },
                    { label: "Disabled", value: "Disabled" },
                  ]}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Filter by Status"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("All");
                    setFilterExperience("All");
                    setFilterStatus("All");
                  }}
                  className="w-full py-2.5 rounded border font-bold text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-all cursor-pointer"
                  style={{
                    color: colors.text,
                    borderColor: colors.accent + "30",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div
              className="mt-6 rounded border overflow-hidden shadow-sm"
              style={{
                backgroundColor: colors.sidebar || colors.background,
                borderColor: colors.text + "20",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        borderColor: colors.accent + "10",
                        color: colors.text,
                        opacity: 1,
                      }}
                    >
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Sr. No
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Job Details
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Job Type
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Exp.
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Company
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Location
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length > 0 ? (
                      jobs.map((job, index) => (
                        <tr
                          key={job._id}
                          className="border-b transition-colors hover:bg-black/5"
                          style={{
                            borderColor: colors.accent + "05",
                            color: colors.text,
                            opacity: 1,
                          }}
                        >
                          <td className="p-4 py-5 text-sm font-medium opacity-60">
                            {index + 1}
                          </td>
                          <td className="p-4 py-5">
                            <div className="flex flex-col">
                              <span
                                className="font-bold text-sm"
                                style={{ color: colors.text }}
                              >
                                {job.jobTitle}
                              </span>
                              <span
                                className="text-[10px] font-bold opacity-50 mt-1 uppercase"
                                style={{ color: colors.primary }}
                              >
                                {job.jobCategory}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 py-5">
                            <span className="text-[11px] font-bold px-2 py-1 rounded bg-black/5">
                              {job.workType}
                            </span>
                          </td>
                          <td className="p-4 py-5 font-bold text-xs opacity-60">
                            {job.requiredExperience}
                          </td>
                          <td
                            className="p-4 py-5 font-bold text-sm"
                            style={{ color: colors.text }}
                          >
                            {job.companyName}
                          </td>
                          <td className="p-4 py-5">
                            <div className="flex items-center gap-1.5 opacity-60 text-xs font-semibold">
                              <MapPin
                                size={14}
                                className="text-primary"
                                style={{ color: colors.primary }}
                              />
                              {job.location}
                            </div>
                          </td>
                          <td className="p-4 py-5">
                            <div className="flex items-center gap-2">
                              <Toggle
                                active={job.jobStatus === "Active"}
                                onClick={() =>
                                  toggleJobStatus(job._id, job.jobStatus)
                                }
                              />
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider ${job.jobStatus === "Active" ? "text-green-500" : "text-red-500"}`}
                              >
                                {job.jobStatus || "Active"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/jobs/view/${job._id}`)
                                }
                                className="p-2 rounded hover:bg-primary/10 text-primary transition-all cursor-pointer"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/jobs/edit/${job._id}`)
                                }
                                className="p-2 rounded bg-blue-500/10 text-blue-500 transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(job._id)}
                                disabled={actionLoading === job._id}
                                className="p-2 rounded bg-red-500/10 text-red-500 transition-all cursor-pointer disabled:opacity-50"
                                title="Delete"
                              >
                                {actionLoading === job._id ? (
                                  <Loader size={18} />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-12 text-center opacity-40 font-bold italic"
                        >
                          No jobs found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Jobs;
