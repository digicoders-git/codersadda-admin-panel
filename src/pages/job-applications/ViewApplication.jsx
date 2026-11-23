import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getJobApplicationDetails, updateJobApplicationStatus } from "../../apis/jobApplication";
import { ArrowLeft, User, Briefcase, GraduationCap, LinkIcon, FileText, Calendar, MessageSquare, Download } from "lucide-react";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import ModernSelect from "../../components/ModernSelect";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://coders-adda-backend.onrender.com';

function ViewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState("");
  const [hrNotes, setHrNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getJobApplicationDetails(id);
      if (res.success) {
        setApplication(res.data);
        setStatus(res.data.status);
        setHrNotes(res.data.hrNotes || "");
      }
    } catch (err) {
      toast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const payload = {
        status,
        hrNotes,
        message: statusMessage
      };
      const res = await updateJobApplicationStatus(id, payload);
      if (res.success) {
        toast.success("Application updated successfully!");
        fetchDetails();
        setStatusMessage("");
      }
    } catch (err) {
      toast.error("Failed to update application");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8"><Loader /></div>;
  }

  if (!application) {
    return <div className="p-8 text-center text-gray-500">Application not found.</div>;
  }

  const SectionTitle = ({ icon: Icon, title }) => (
    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 mt-6 pb-2 border-b border-gray-100">
      <Icon size={20} style={{ color: colors.primary }} />
      {title}
    </h2>
  );

  const DataField = ({ label, value }) => (
    <div className="mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-gray-800 text-sm mt-1">{value || "N/A"}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Application Details</h1>
          <p className="text-sm text-gray-500">ID: {application.applicationId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Application Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            
            {/* Header / Basic Info */}
            <div className="flex items-start gap-4">
               {application.profilePhoto ? (
                 <img src={`${API_URL}${application.profilePhoto}`} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
               ) : (
                 <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                   <User size={32} className="text-gray-400" />
                 </div>
               )}
               <div>
                 <h2 className="text-xl font-bold text-gray-900">{application.fullName}</h2>
                 <p className="text-gray-500">{application.currentJobTitle || "Candidate"}</p>
                 <div className="flex gap-4 mt-2 text-sm text-gray-600">
                   <span>{application.email}</span>
                   <span>•</span>
                   <span>{application.mobile}</span>
                   <span>•</span>
                   <span>{application.city}, {application.state}</span>
                 </div>
               </div>
            </div>

            <SectionTitle icon={Briefcase} title="Professional Information" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DataField label="Experience Type" value={application.experience} />
              <DataField label="Total Experience" value={application.totalExperience} />
              <DataField label="Current Company" value={application.currentCompany} />
              <DataField label="Current Salary" value={application.currentSalary} />
              <DataField label="Expected Salary" value={application.expectedSalary} />
              <DataField label="Notice Period" value={application.noticePeriod} />
            </div>

            <SectionTitle icon={GraduationCap} title="Education" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DataField label="Highest Qualification" value={application.qualification} />
              <DataField label="College / University" value={application.college} />
              <DataField label="Passing Year" value={application.passingYear} />
              <DataField label="Percentage / CGPA" value={application.percentage} />
            </div>

            <SectionTitle icon={FileText} title="Skills & Cover Letter" />
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {application.skills && application.skills.length > 0 ? (
                  application.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No skills provided</span>
                )}
              </div>
            </div>
            {application.coverLetter && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cover Letter</p>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {application.coverLetter}
                </div>
              </div>
            )}

            <SectionTitle icon={LinkIcon} title="Links & Preferences" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Professional Links</p>
                <ul className="space-y-2 text-sm">
                  {application.linkedIn && <li><a href={application.linkedIn} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a></li>}
                  {application.gitHub && <li><a href={application.gitHub} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub Profile</a></li>}
                  {application.portfolio && <li><a href={application.portfolio} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Portfolio Website</a></li>}
                  {!application.linkedIn && !application.gitHub && !application.portfolio && <li className="text-gray-500">None provided</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preferences</p>
                <DataField label="Preferred Location" value={application.preferredLocation} />
                <DataField label="Work Type" value={application.workType} />
                <DataField label="Willing to Relocate" value={application.relocate} />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <FileText size={20} style={{ color: colors.primary }} />
               Resume
            </h2>
            <a 
              href={`${API_URL}${application.resumeURL}`} 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              <Download size={18} />
              Download Resume
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Calendar size={20} style={{ color: colors.primary }} />
               Manage Status
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <ModernSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "Applied", label: "Applied" },
                    { value: "Under Review", label: "Under Review" },
                    { value: "Shortlisted", label: "Shortlisted" },
                    { value: "Interview Scheduled", label: "Interview Scheduled" },
                    { value: "Interview Completed", label: "Interview Completed" },
                    { value: "Selected", label: "Selected" },
                    { value: "Offer Sent", label: "Offer Sent" },
                    { value: "Joined", label: "Joined" },
                    { value: "Rejected", label: "Rejected" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message to Candidate (Optional)</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1"
                  style={{ focusRing: colors.primary }}
                  placeholder="Will be sent as a notification to the user..."
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal HR Notes</label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1"
                  style={{ focusRing: colors.primary }}
                  placeholder="Private notes for HR team..."
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full py-2.5 text-white rounded-lg font-medium transition-opacity disabled:opacity-70"
                style={{ backgroundColor: colors.primary }}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <MessageSquare size={20} style={{ color: colors.primary }} />
               Timeline
            </h2>
            <div className="space-y-4">
              {application.statusTimeline?.map((item, idx) => (
                <div key={idx} className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0 last:pb-0">
                   <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                   <p className="text-sm font-bold text-gray-800">{item.status}</p>
                   <p className="text-xs text-gray-400 mt-0.5">{new Date(item.updatedAt).toLocaleString()}</p>
                   {item.message && (
                     <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                       {item.message}
                     </p>
                   )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewApplication;
