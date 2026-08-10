import React, { useState, useEffect, useCallback } from 'react';
import { getAdminNotifications, deleteNotification, getNotificationStats, createNotification, getUsersForPicker, getCoursesForPicker } from '../apis/notification';
import { toast } from 'react-toastify';
import {
  Bell, CheckCircle, Clock, Trash2, PlusCircle, AlertTriangle,
  Users, BookOpen, Zap, RefreshCw, Filter, X, Send, Loader2,
  CheckSquare, Square, ChevronLeft, ChevronRight, AlertCircle, Image as ImageIcon
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  General:     { emoji: '🔔', color: 'bg-gray-100 text-gray-700',     label: 'General' },
  Course:      { emoji: '📚', color: 'bg-blue-100 text-blue-700',     label: 'Course' },
  NewLecture:  { emoji: '🎬', color: 'bg-purple-100 text-purple-700', label: 'Lecture' },
  NewTopic:    { emoji: '📖', color: 'bg-indigo-100 text-indigo-700', label: 'Topic' },
  NewNotes:    { emoji: '📄', color: 'bg-teal-100 text-teal-700',     label: 'Notes/PDF' },
  NewTest:     { emoji: '📝', color: 'bg-yellow-100 text-yellow-700', label: 'Test' },
  Quiz:        { emoji: '🧠', color: 'bg-pink-100 text-pink-700',     label: 'Quiz' },
  Offer:       { emoji: '🎁', color: 'bg-green-100 text-green-700',   label: 'Offer' },
  Alert:       { emoji: '⚠️', color: 'bg-red-100 text-red-700',      label: 'Alert' },
};

const TARGET_LABEL = {
  All:            { label: 'All Users',       icon: <Users size={12} /> },
  Specific:       { label: 'Specific Users',  icon: <Users size={12} /> },
  CourseEnrolled: { label: 'Course Students', icon: <BookOpen size={12} /> },
  Premium:        { label: 'Premium Users',   icon: <Zap size={12} /> },
  Free:           { label: 'Free Users',      icon: <Users size={12} /> },
  Instructors:    { label: 'Instructors',     icon: <Users size={12} /> },
};

const TARGET_TABS = [
  { id: 'All',           label: 'All Users',       icon: <Bell size={16}/>,     desc: 'Send to all registered users' },
  { id: 'Instructors',   label: 'Instructors',     icon: <Users size={16}/>,    desc: 'Send to all active instructors' },
  { id: 'CourseEnrolled',label: 'Course Students', icon: <BookOpen size={16}/>, desc: 'Students enrolled in a course' },
  { id: 'Specific',      label: 'Specific Users',  icon: <Users size={16}/>,    desc: 'Select individual users' },
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
  { value: 'Normal',   label: 'Normal', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'High',     label: 'High',   color: 'bg-orange-100 text-orange-700' },
  { value: 'Low',      label: 'Low',    color: 'bg-gray-100 text-gray-600' },
  { value: 'Critical', label: 'Critical', color: 'bg-rose-100 text-rose-700' },
];

const TYPE_FILTERS = ['All', 'General', 'NewLecture', 'NewTopic', 'NewNotes', 'Quiz', 'Course', 'Offer', 'Alert'];
const STATUS_FILTERS = ['All', 'Sent', 'Pending', 'Failed'];

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, bg, textColor }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${bg}`}>
      {React.cloneElement(icon, { className: textColor, size: 22 })}
    </div>
    <div>
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

// ─── Notification Row ──────────────────────────────────────────────────────────
const NotifRow = ({ n, onDelete }) => {
  const typeInfo  = TYPE_CONFIG[n.type]  || TYPE_CONFIG.General;
  const targetInfo = TARGET_LABEL[n.targetGroup] || TARGET_LABEL.All;

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50/50 transition-colors group">
      <td className="p-4 align-top">
        <div className="flex items-start gap-3">
          <div className="text-xl shrink-0 mt-0.5 bg-gray-50 p-2 rounded-xl border border-gray-100">{typeInfo.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight">{n.title}</p>
            <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
            {n.image && (
              <a href={n.image} target="_blank" rel="noopener noreferrer" className="inline-flex mt-2 items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition">
                <ImageIcon size={12} /> View Attachment
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="p-4 align-top">
        <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </td>
      <td className="p-4 align-top">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md w-fit font-bold border border-gray-200">
            {targetInfo.icon}
            {targetInfo.label}
          </span>
          {n.targetGroup === 'CourseEnrolled' && n.targetCourse?.title && (
            <span className="text-xs text-gray-500 font-medium line-clamp-1 max-w-[150px] mt-1" title={n.targetCourse.title}>
              Course: {n.targetCourse.title}
            </span>
          )}
        </div>
      </td>
      <td className="p-4 align-top">
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex w-fit items-center gap-1.5 ${
          n.status === 'Sent'    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          n.status === 'Pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                   'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {n.status === 'Sent'    ? <CheckCircle size={12}/> :
           n.status === 'Pending' ? <Clock size={12}/> :
                                    <AlertTriangle size={12}/>}
          {n.status}
        </span>
      </td>
      <td className="p-4 align-top text-xs text-gray-500 font-medium">
        {n.scheduledFor ? (
          <span className="text-orange-600 font-bold flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-md w-fit">
            <Clock size={12}/> {new Date(n.scheduledFor).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        ) : (
          new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        )}
      </td>
      <td className="p-4 align-top text-right">
        <button
          onClick={() => onDelete(n._id)}
          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={16}/>
        </button>
      </td>
    </tr>
  );
};

// ─── User Picker ───────────────────────────────────────────────────────────────
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
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50/50">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-gray-400"
          placeholder="Search by name, mobile or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }} className="p-1 hover:bg-gray-200 rounded-lg transition">
            <X size={14} className="text-gray-500" />
          </button>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-2 border-b bg-indigo-50/50">
          {selectedUsers.map(u => (
            <span key={u._id} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md border border-indigo-200">
              {u.name || u.mobile}
              <button onClick={(e) => { e.preventDefault(); onToggle(u); }} className="hover:text-indigo-900"><X size={12}/></button>
            </span>
          ))}
        </div>
      )}

      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 font-medium text-sm">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-medium text-sm">No users found</div>
        ) : (
          users.map(u => (
            <button
              key={u._id}
              type="button"
              onClick={() => onToggle(u)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
            >
              {isSelected(u._id)
                ? <CheckSquare size={18} className="text-indigo-600 shrink-0"/>
                : <Square size={18} className="text-gray-300 shrink-0"/>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{u.name || 'N/A'}</p>
                <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{u.mobile || u.email}</p>
              </div>
              {u.fcmToken
                ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">FCM ✓</span>
                : <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200 shrink-0">No FCM</span>}
            </button>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50/50">
          <button
            type="button"
            disabled={page <= 1}
            onClick={(e) => { e.preventDefault(); setPage(p => p - 1); }}
            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition"
          >
            <ChevronLeft size={16}/>
          </button>
          <span className="text-xs font-medium text-gray-500">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={(e) => { e.preventDefault(); setPage(p => p + 1); }}
            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition"
          >
            <ChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Course Picker ─────────────────────────────────────────────────────────────
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
    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium py-2">
      <Loader2 size={16} className="animate-spin"/> Loading courses...
    </div>
  );

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-sm font-medium"
    >
      <option value="">— Select a Course —</option>
      {courses.map(c => (
        <option key={c._id} value={c._id}>{c.title} ({c.technology})</option>
      ))}
    </select>
  );
};


// ─── Main Page Component ───────────────────────────────────────────────────────
const Notifications = () => {
  const [activeView, setActiveView] = useState('history'); // 'history' | 'create'
  
  // -- History State --
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalPending: 0, totalFailed: 0, readRate: '0%', readCount: 0, unreadCount: 0 });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (pg = 1, type = typeFilter, status = statusFilter) => {
    setLoadingHistory(true);
    try {
      const params = { page: pg, limit: 15 };
      if (type   !== 'All') params.type   = type;
      if (status !== 'All') params.status = status;

      const [statsRes, notifsRes] = await Promise.all([
        getNotificationStats(),
        getAdminNotifications(params)
      ]);

      if (statsRes.success)  setStats(statsRes.data);
      if (notifsRes.success) {
        setNotifications(notifsRes.data);
        setTotalPages(notifsRes.totalPages || 1);
        setTotal(notifsRes.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeView === 'history') {
      fetchHistory(1, typeFilter, statusFilter);
    }
  }, [activeView]);

  const applyFilter = () => { setPage(1); fetchHistory(1, typeFilter, statusFilter); };
  const resetFilter = () => { setTypeFilter('All'); setStatusFilter('All'); setPage(1); fetchHistory(1, 'All', 'All'); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const res = await deleteNotification(id);
      if (res.success) { toast.success('Notification deleted'); fetchHistory(page); }
      else toast.error(res.message || 'Failed to delete');
    } catch { toast.error('Error deleting notification'); }
  };

  // -- Create Notification State --
  const [loadingSend, setLoadingSend] = useState(false);
  const [targetTab, setTargetTab] = useState('All');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    actionLink: '',
    priority: 'Normal',
    type: 'General',
    scheduledFor: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.some(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const validate = () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return false; }
    if (!formData.body.trim())  { toast.error('Message body is required'); return false; }
    if (targetTab === 'Specific' && selectedUsers.length === 0) {
      toast.error('Please select at least one user'); return false;
    }
    if (targetTab === 'CourseEnrolled' && !selectedCourse) {
      toast.error('Please select a course'); return false;
    }
    return true;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoadingSend(true);

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('body', formData.body);
      fd.append('actionLink', formData.actionLink);
      fd.append('priority', formData.priority);
      fd.append('type', formData.type);
      fd.append('targetGroup', targetTab);
      
      if (formData.scheduledFor) {
        fd.append('scheduledFor', new Date(formData.scheduledFor).toISOString());
      }
      
      if (imageFile) {
        fd.append('image', imageFile);
      }

      if (targetTab === 'Specific') {
        fd.append('targetUsers', JSON.stringify(selectedUsers.map(u => u._id)));
      } else if (targetTab === 'CourseEnrolled') {
        fd.append('targetCourse', selectedCourse);
      }

      const res = await createNotification(fd);
      if (res.success) {
        toast.success('✅ Notification scheduled/sent successfully!');
        // Reset form
        setFormData({ title: '', body: '', actionLink: '', priority: 'Normal', type: 'General', scheduledFor: '' });
        setImageFile(null);
        setSelectedUsers([]);
        setSelectedCourse('');
        setActiveView('history');
      } else {
        toast.error(res.message || 'Error creating notification');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Bell size={26} />
            </div>
            Push Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Manage push notifications, view history, and send new updates to your users & instructors.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveView('history')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeView === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          History & Reports
        </button>
        <button
          onClick={() => setActiveView('create')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeView === 'create' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Send New Notification
        </button>
      </div>

      {activeView === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Bell/>}         label="Total Sent"      value={stats.totalSent}    bg="bg-indigo-50"   textColor="text-indigo-600" />
            <StatCard icon={<Clock/>}        label="Pending"         value={stats.totalPending} bg="bg-orange-50" textColor="text-orange-600" />
            <StatCard icon={<CheckCircle/>}  label="Read Rate"       value={stats.readRate}     bg="bg-emerald-50"  textColor="text-emerald-600" />
            <StatCard icon={<AlertTriangle/>}label="Failed"          value={stats.totalFailed || 0} bg="bg-rose-50" textColor="text-rose-600" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {TYPE_FILTERS.map(t => (
                      <option key={t} value={t}>{t === 'All' ? 'All Types' : (TYPE_CONFIG[t]?.label || t)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {STATUS_FILTERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetFilter}
                  className="px-4 py-1.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilter}
                  className="px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-600 font-bold">
                {loadingHistory ? 'Loading History...' : `${total} Notification${total !== 1 ? 's' : ''} Found`}
              </p>
              <button
                onClick={() => fetchHistory(page)}
                className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 shadow-sm"
                title="Refresh"
              >
                <RefreshCw size={14}/>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 bg-white">
                    <th className="px-5 py-4">Notification Info</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Target Group</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Sent/Scheduled Date</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400 font-medium">
                        <Loader2 size={24} className="animate-spin mx-auto mb-3 text-indigo-500"/>
                        Loading history...
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={28} className="text-gray-300"/>
                        </div>
                        <p className="text-gray-500 font-bold">No history found</p>
                        <p className="text-gray-400 text-sm mt-1 font-medium">You haven't sent any notifications matching these filters.</p>
                      </td>
                    </tr>
                  ) : (
                    notifications.map(n => (
                      <NotifRow key={n._id} n={n} onDelete={handleDelete} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  disabled={page <= 1}
                  onClick={() => { setPage(p => p - 1); fetchHistory(page - 1); }}
                  className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-gray-500">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => { setPage(p => p + 1); fetchHistory(page + 1); }}
                  className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'create' && (
        <form onSubmit={handleCreateSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Target Audience */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-600"><Users size={16}/></div>
                Step 1: Choose Target Audience
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {TARGET_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setTargetTab(tab.id); setSelectedUsers([]); setSelectedCourse(''); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      targetTab === tab.id
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex items-center gap-2 font-bold text-sm mb-1 ${targetTab === tab.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {tab.icon} {tab.label}
                    </div>
                    <p className="text-[11px] font-medium text-gray-500 leading-tight">{tab.desc}</p>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                {targetTab === 'Specific' && (
                  <div className="animate-in fade-in">
                    <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                      <AlertCircle size={14} className="text-indigo-500"/>
                      Search and select users. Only selected users will receive this.
                    </p>
                    <UserPicker selectedUsers={selectedUsers} onToggle={handleToggleUser} />
                  </div>
                )}
                {targetTab === 'CourseEnrolled' && (
                  <div className="animate-in fade-in">
                    <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                      <AlertCircle size={14} className="text-indigo-500"/>
                      All students enrolled in the selected course will receive this.
                    </p>
                    <CoursePicker value={selectedCourse} onChange={setSelectedCourse} />
                  </div>
                )}
                {targetTab === 'Instructors' && (
                  <div className="flex items-center gap-3 text-indigo-700 text-sm font-bold animate-in fade-in">
                    <Users size={16}/>
                    This notification will be sent to ALL active Instructors (In-app only).
                  </div>
                )}
                {targetTab === 'All' && (
                  <div className="flex items-center gap-3 text-indigo-700 text-sm font-bold animate-in fade-in">
                    <Bell size={16}/>
                    This notification will be sent to ALL registered users.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-600"><Bell size={16}/></div>
                Step 2: Notification Content
              </h3>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Notification Title <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
                    placeholder="e.g. New Feature Released! 🚀"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Notification Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
                  >
                    {TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Message Body <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  name="body"
                  value={formData.body}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-gray-50 focus:bg-white transition-colors resize-none"
                  placeholder="Write your detailed notification message here..."
                />
                <p className="text-[11px] font-bold text-gray-400 text-right">{formData.body.length} chars (Keep it concise for better delivery)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">App Deep Link (Optional)</label>
                  <input
                    type="text"
                    name="actionLink"
                    value={formData.actionLink}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
                    placeholder="e.g. /course-detail/123"
                  />
                  <p className="text-[11px] font-medium text-gray-500">Redirects user to this screen when clicked.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Attachment Image (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl p-3 transition-colors text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                      <span className="text-sm font-bold text-gray-500 flex items-center justify-center gap-2">
                        <ImageIcon size={16}/>
                        {imageFile ? imageFile.name : 'Click to Upload Image'}
                      </span>
                    </label>
                    {imageFile && (
                      <button type="button" onClick={() => setImageFile(null)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition" title="Remove Image">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-600"><Clock size={16}/></div>
                Step 3: Schedule & Priority
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Priority Level</label>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITY_OPTIONS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all shadow-sm ${
                        formData.priority === p.value
                          ? `${p.color} border-current ring-2 ring-offset-1 ring-current/20`
                          : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Schedule Time (Optional)</label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
                />
                <p className="text-[11px] font-bold text-gray-400">Leave blank to send immediately.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingSend}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 font-bold flex items-center gap-2"
            >
              {loadingSend
                ? <><Loader2 size={16} className="animate-spin"/> Sending...</>
                : formData.scheduledFor
                  ? <><Clock size={16}/> Schedule Delivery</>
                  : <><Send size={16}/> Send Notification Now</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Notifications;
