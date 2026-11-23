import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getJobApplications, getJobApplicationStats } from "../../apis/jobApplication";
import { Search, Eye, Filter, Download } from "lucide-react";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";

function JobApplications() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: filterStatus === "All" ? undefined : filterStatus,
        page,
        limit: 10
      };
      const res = await getJobApplications(params);
      if (res.success) {
        setApplications(res.data);
        setTotalPages(res.pages);
      }
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getJobApplicationStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStatus, page]);

  const handleExport = () => {
    // Basic CSV Export implementation
    if (applications.length === 0) return toast.info("No data to export");
    
    const headers = ["Application ID", "Candidate Name", "Email", "Job Title", "Status", "Applied On"];
    const csvContent = [
      headers.join(","),
      ...applications.map(app => 
        [app.applicationId, app.fullName, app.email, app.jobId?.jobTitle, app.status, new Date(app.createdAt).toLocaleDateString()].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Job_Applications_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Applications</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
          style={{ backgroundColor: colors.primary }}
        >
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total", value: stats.totalApplications, color: "bg-blue-100 text-blue-800" },
            { label: "Today", value: stats.todaysApplications, color: "bg-green-100 text-green-800" },
            { label: "Shortlisted", value: stats.shortlisted, color: "bg-purple-100 text-purple-800" },
            { label: "Selected", value: stats.selected, color: "bg-indigo-100 text-indigo-800" },
            { label: "Rejected", value: stats.rejected, color: "bg-red-100 text-red-800" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center">
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
              <p className={`text-2xl font-bold px-3 py-1 rounded-full ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Name, Email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ focusRing: colors.primary }}
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <ModernSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: "All", label: "All Statuses" },
                  { value: "Applied", label: "Applied" },
                  { value: "Under Review", label: "Under Review" },
                  { value: "Shortlisted", label: "Shortlisted" },
                  { value: "Interview Scheduled", label: "Interview Scheduled" },
                  { value: "Selected", label: "Selected" },
                  { value: "Rejected", label: "Rejected" },
                ]}
                icon={<Filter size={18} />}
              />
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">App ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {app.applicationId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{app.fullName}</span>
                          <span className="text-xs text-gray-500">{app.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{app.jobId?.jobTitle || "Unknown"}</span>
                          <span className="text-xs text-gray-500">{app.jobId?.companyName || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${app.status === 'Applied' ? 'bg-blue-100 text-blue-800' : ''}
                          ${app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800' : ''}
                          ${app.status === 'Selected' ? 'bg-green-100 text-green-800' : ''}
                          ${app.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                          ${['Under Review', 'Interview Scheduled'].includes(app.status) ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => navigate(`/dashboard/job-applications/${app._id}`)}
                          className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
             <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Previous
             </button>
             <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
             <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Next
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobApplications;
