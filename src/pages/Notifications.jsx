import React, { useState, useEffect } from 'react';
import { getAdminNotifications, deleteNotification, getNotificationStats } from '../apis/notification';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Bell, CheckCircle, Clock, Trash2, PlusCircle, AlertTriangle,
  Users, BookOpen, Zap, BarChart2, RefreshCw, Filter, X, Eye
} from 'lucide-react';

// ─── Type badge config ─────────────────────────────────────────────────────────
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
};

const TYPE_FILTERS = ['All', 'General', 'NewLecture', 'NewTopic', 'NewNotes', 'Quiz', 'Course', 'Offer', 'Alert'];
const STATUS_FILTERS = ['All', 'Sent', 'Pending', 'Failed'];

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, bg, textColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bg}`}>
      {React.cloneElement(icon, { className: textColor, size: 22 })}
    </div>
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
    </div>
  </div>
);

// ─── Notification Row ──────────────────────────────────────────────────────────
const NotifRow = ({ n, onDelete }) => {
  const typeInfo  = TYPE_CONFIG[n.type]  || TYPE_CONFIG.General;
  const targetInfo = TARGET_LABEL[n.targetGroup] || TARGET_LABEL.All;

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50/70 transition group">
      {/* Title */}
      <td className="p-4">
        <div className="flex items-start gap-2">
          <span className="text-xl shrink-0">{typeInfo.emoji}</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{n.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{n.body}</p>
          </div>
        </div>
      </td>

      {/* Type badge */}
      <td className="p-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </td>

      {/* Target */}
      <td className="p-4">
        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit font-medium">
          {targetInfo.icon}
          {targetInfo.label}
          {n.targetGroup === 'CourseEnrolled' && n.targetCourse?.title && (
            <span className="text-gray-400 ml-0.5">• {n.targetCourse.title}</span>
          )}
        </span>
      </td>

      {/* Status */}
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${
          n.status === 'Sent'    ? 'bg-green-100 text-green-700' :
          n.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                   'bg-red-100 text-red-700'
        }`}>
          {n.status === 'Sent'    ? <CheckCircle size={10}/> :
           n.status === 'Pending' ? <Clock size={10}/> :
                                    <AlertTriangle size={10}/>}
          {n.status}
        </span>
      </td>

      {/* Date */}
      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
        {n.scheduledFor ? (
          <span className="text-orange-600 font-medium flex items-center gap-1">
            <Clock size={11}/> {new Date(n.scheduledFor).toLocaleString('en-IN')}
          </span>
        ) : (
          new Date(n.createdAt).toLocaleString('en-IN')
        )}
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <button
          onClick={() => onDelete(n._id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={15}/>
        </button>
      </td>
    </tr>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalPending: 0, totalFailed: 0, readRate: '0%', readCount: 0, unreadCount: 0 });
  const [loading, setLoading]   = useState(true);
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (pg = 1, type = typeFilter, status = statusFilter) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1, typeFilter, statusFilter); }, []);

  const applyFilter = () => { setPage(1); fetchData(1, typeFilter, statusFilter); };
  const resetFilter = () => { setTypeFilter('All'); setStatusFilter('All'); setPage(1); fetchData(1, 'All', 'All'); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification? This will also remove it from all users\' notification lists.')) return;
    try {
      const res = await deleteNotification(id);
      if (res.success) { toast.success('Notification deleted'); fetchData(page); }
      else toast.error(res.message || 'Failed to delete');
    } catch { toast.error('Error deleting notification'); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and send push notifications to your users</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(page)}
            className="p-2 border rounded-lg hover:bg-gray-50 transition text-gray-600"
            title="Refresh"
          >
            <RefreshCw size={16}/>
          </button>
          <Link
            to="/dashboard/notifications/create"
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition font-medium text-sm"
          >
            <PlusCircle size={18}/>
            Create Notification
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Bell/>}         label="Total Sent"      value={stats.totalSent}    bg="bg-blue-50"   textColor="text-blue-600" />
        <StatCard icon={<Clock/>}        label="Pending"         value={stats.totalPending} bg="bg-orange-50" textColor="text-orange-600" />
        <StatCard icon={<CheckCircle/>}  label="Read Rate"       value={stats.readRate}     bg="bg-green-50"  textColor="text-green-600" />
        <StatCard icon={<AlertTriangle/>}label="Failed"          value={stats.totalFailed || 0} bg="bg-red-50" textColor="text-red-600" />
      </div>

      {/* Auto-trigger info banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
        <Zap size={18} className="text-purple-600 mt-0.5 shrink-0"/>
        <div>
          <p className="text-sm font-semibold text-purple-800">Auto-Notifications Active</p>
          <p className="text-xs text-purple-600 mt-0.5">
            Notifications are automatically sent when: <strong>New Lecture</strong>, <strong>New Topic</strong>, <strong>New Quiz</strong>, or <strong>New Notes</strong> is added to a course. You can see them below with their respective type badges.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={16}/> <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Type:</span>
            {TYPE_FILTERS.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  typeFilter === t
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'All' ? 'All Types' : (TYPE_CONFIG[t]?.emoji + ' ' + TYPE_CONFIG[t]?.label || t)}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  statusFilter === s
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {(typeFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={resetFilter}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={12}/> Clear
              </button>
            )}
            <button
              onClick={applyFilter}
              className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary-dark transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
          <p className="text-sm text-gray-600 font-medium">
            {loading ? 'Loading...' : `${total} notification${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wide border-b bg-gray-50">
                <th className="p-4 font-medium">Notification</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Target</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2"/>
                    Loading notifications...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <Bell size={32} className="mx-auto text-gray-200 mb-3"/>
                    <p className="text-gray-400 font-medium">No notifications found</p>
                    <p className="text-gray-300 text-sm mt-1">Create your first notification to get started</p>
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
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <button
              disabled={page <= 1}
              onClick={() => { setPage(p => p - 1); fetchData(page - 1); }}
              className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => { setPage(p => p + 1); fetchData(page + 1); }}
              className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
