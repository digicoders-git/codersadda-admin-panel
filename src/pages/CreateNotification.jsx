import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createNotification, getUsersForPicker, getCoursesForPicker } from '../apis/notification';
import {
  Bell, Users, BookOpen, Search, X, CheckSquare, Square,
  ChevronLeft, ChevronRight, Send, Clock, Loader2, AlertCircle
} from 'lucide-react';

// ─── Target group tab config ──────────────────────────────────────────────────
const TARGET_TABS = [
  { id: 'All',           label: 'All Users',       icon: <Bell size={16}/>,     desc: 'Send to all registered users' },
  { id: 'Specific',      label: 'Specific Users',  icon: <Users size={16}/>,    desc: 'Select individual users' },
  { id: 'CourseEnrolled',label: 'Course Students', icon: <BookOpen size={16}/>, desc: 'Students enrolled in a course' },
];

const TYPE_OPTIONS = [
  { value: 'General',    label: '🔔 General' },
  { value: 'Course',     label: '📚 Course Update' },
  { value: 'NewLecture', label: '🎬 New Lecture' },
  { value: 'NewTopic',   label: '📖 New Topic' },
  { value: 'NewNotes',   label: '📄 New Notes/PDF' },
  { value: 'Quiz',       label: '🧠 Quiz' },
  { value: 'Offer',      label: '🎁 Offer' },
  { value: 'Alert',      label: '⚠️ Alert' },
];

const PRIORITY_OPTIONS = [
  { value: 'Normal',   label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'High',     label: 'High',   color: 'bg-orange-100 text-orange-700' },
  { value: 'Low',      label: 'Low',    color: 'bg-gray-100 text-gray-600' },
  { value: 'Critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

// ─── User Picker Component ─────────────────────────────────────────────────────
const UserPicker = ({ selectedUsers, onToggle }) => {
  const [search, setSearch]   = useState('');
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (q, pg) => {
    setLoading(true);
    try {
      const res = await getUsersForPicker(q, pg);
      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { fetchUsers(search, page); }, 400);
    return () => clearTimeout(t);
  }, [search, page, fetchUsers]);

  const isSelected = (id) => selectedUsers.some(u => u._id === id);

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* Search bar */}
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
          placeholder="Search by name, mobile or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Selected badges */}
      {selectedUsers.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-2 border-b bg-blue-50">
          {selectedUsers.map(u => (
            <span key={u._id} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {u.name || u.mobile}
              <button onClick={() => onToggle(u)}><X size={10}/></button>
            </span>
          ))}
        </div>
      )}

      {/* User list */}
      <div className="max-h-56 overflow-y-auto divide-y">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No users found</div>
        ) : (
          users.map(u => (
            <button
              key={u._id}
              onClick={() => onToggle(u)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition"
            >
              {isSelected(u._id)
                ? <CheckSquare size={16} className="text-primary shrink-0"/>
                : <Square size={16} className="text-gray-300 shrink-0"/>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{u.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 truncate">{u.mobile || u.email}</p>
              </div>
              {u.fcmToken
                ? <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded shrink-0">FCM ✓</span>
                : <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded shrink-0">No FCM</span>}
            </button>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
          >
            <ChevronLeft size={14}/>
          </button>
          <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
          >
            <ChevronRight size={14}/>
          </button>
        </div>
      )}

      <div className="px-3 py-2 bg-gray-50 border-t">
        <p className="text-xs text-gray-500">
          {selectedUsers.length === 0
            ? 'No users selected'
            : `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`}
        </p>
      </div>
    </div>
  );
};

// ─── Course Picker Component ───────────────────────────────────────────────────
const CoursePicker = ({ value, onChange }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getCoursesForPicker();
        if (res.success) setCourses(res.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
      <Loader2 size={16} className="animate-spin"/> Loading courses...
    </div>
  );

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
    >
      <option value="">— Select Course —</option>
      {courses.map(c => (
        <option key={c._id} value={c._id}>{c.title} ({c.technology})</option>
      ))}
    </select>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CreateNotification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    image: '',
    actionLink: '',
    priority: 'Normal',
    type: 'General',
    scheduledFor: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.some(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  // Validation
  const validate = () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return false; }
    if (!formData.body.trim())  { toast.error('Message body is required'); return false; }
    if (activeTab === 'Specific' && selectedUsers.length === 0) {
      toast.error('Please select at least one user'); return false;
    }
    if (activeTab === 'CourseEnrolled' && !selectedCourse) {
      toast.error('Please select a course'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        targetGroup: activeTab,
      };

      // Set target data based on tab
      if (activeTab === 'Specific') {
        payload.targetUsers = selectedUsers.map(u => u._id);
      } else if (activeTab === 'CourseEnrolled') {
        payload.targetCourse = selectedCourse;
      }

      if (!payload.scheduledFor) delete payload.scheduledFor;
      else payload.scheduledFor = new Date(payload.scheduledFor).toISOString();

      const res = await createNotification(payload);
      if (res.success) {
        toast.success('✅ Notification sent successfully!');
        navigate('/dashboard/notifications');
      } else {
        toast.error(res.message || 'Error creating notification');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTabInfo = TARGET_TABS.find(t => t.id === activeTab);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ChevronLeft size={20}/>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Notification</h2>
          <p className="text-gray-500 text-sm">Send push notifications to your users</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Step 1: Target Audience ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-primary"/>
              Step 1 — Choose Target Audience
            </h3>
          </div>
          <div className="p-4">
            {/* Tab selector */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {TARGET_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setSelectedUsers([]); setSelectedCourse(''); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    activeTab === tab.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`flex items-center gap-2 font-medium text-sm mb-1 ${activeTab === tab.id ? 'text-primary' : 'text-gray-700'}`}>
                    {tab.icon} {tab.label}
                  </div>
                  <p className="text-xs text-gray-500">{tab.desc}</p>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Specific' && (
              <div>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500"/>
                  Search and select users. Only selected users will receive this notification.
                </p>
                <UserPicker selectedUsers={selectedUsers} onToggle={handleToggleUser} />
              </div>
            )}

            {activeTab === 'CourseEnrolled' && (
              <div>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500"/>
                  All students enrolled in the selected course will receive this notification.
                </p>
                <CoursePicker value={selectedCourse} onChange={setSelectedCourse} />
              </div>
            )}

            {activeTab === 'All' && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-700 text-sm">
                <Bell size={16}/>
                This notification will be sent to <strong>all registered users</strong> who have the app installed.
              </div>
            )}
          </div>
        </div>

        {/* ── Step 2: Content ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={18} className="text-primary"/>
              Step 2 — Notification Content
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Title + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Notification Title *</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="e.g. New Lecture Added! 🎬"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Notification Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                >
                  {TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Message Body *</label>
              <textarea
                required
                rows={3}
                name="body"
                value={formData.body}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                placeholder="Write your notification message here..."
              />
              <p className="text-xs text-gray-400">{formData.body.length} / 200 chars</p>
            </div>

            {/* Action Link + Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Deep Link (Optional)</label>
                <input
                  type="text"
                  name="actionLink"
                  value={formData.actionLink}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="e.g. /course-detail/123"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Image URL (Optional)</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 3: Settings ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-primary"/>
              Step 3 — Priority & Schedule
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <div className="flex gap-2 flex-wrap">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      formData.priority === p.value
                        ? `${p.color} border-current`
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Schedule (Optional)</label>
              <input
                type="datetime-local"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <p className="text-xs text-gray-400">Leave blank to send immediately</p>
            </div>
          </div>
        </div>

        {/* ── Preview Card ── */}
        {(formData.title || formData.body) && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-white">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">📱 Preview</p>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Bell size={18} className="text-white"/>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{formData.title || 'Notification Title'}</p>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">{formData.body || 'Notification message...'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Target: <span className="text-gray-300">{selectedTabInfo?.label}</span>
              {activeTab === 'Specific' && ` (${selectedUsers.length} users)`}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/notifications')}
            className="px-6 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 font-medium flex items-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin"/> Sending...</>
              : formData.scheduledFor
                ? <><Clock size={16}/> Schedule Notification</>
                : <><Send size={16}/> Send Now</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotification;
