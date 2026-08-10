import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  Search,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
  Mail,
  Phone,
  Tag,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  getSupportTickets,
  updateSupportTicket,
  deleteSupportTicket,
} from '../apis/supportTicket';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';

function SupportTickets() {
  const { colors } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Reply Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusText, setStatusText] = useState('Pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSupportTickets({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        page: currentPage,
        limit: 10,
      });

      if (res.success) {
        setTickets(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      } else {
        toast.error(res.message || 'Failed to load support tickets');
      }
    } catch (err) {
      toast.error('Error loading support tickets');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter, currentPage]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setStatusText(ticket.status || 'Pending');
    setModalOpen(true);
  };

  const handleSaveReply = async () => {
    if (!selectedTicket) return;
    try {
      setActionLoading(true);
      const res = await updateSupportTicket(selectedTicket._id, {
        status: statusText,
        adminReply: replyText,
      });

      if (res.success) {
        toast.success('Ticket updated successfully!');
        setModalOpen(false);
        fetchTickets();
      } else {
        toast.error(res.message || 'Failed to update ticket');
      }
    } catch (err) {
      toast.error('Error updating ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this support ticket?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteSupportTicket(id);
        if (res.success) {
          toast.success('Ticket deleted');
          fetchTickets();
        } else {
          toast.error(res.message || 'Failed to delete ticket');
        }
      } catch (err) {
        toast.error('Error deleting ticket');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            <CheckCircle2 size={13} /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
            <Clock size={13} /> In Progress
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
            <AlertCircle size={13} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: colors.text }}>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <LifeBuoy size={26} />
            </div>
            Support Tickets & Student Queries
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.subtext }}>
            Manage and respond to student inquiries submitted from the mobile app.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border border-indigo-500/30 text-indigo-600 bg-indigo-500/10 hover:bg-indigo-500/20"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-4 shadow-sm"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
      >
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search student name, email, subject or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none"
            style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none"
            style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
          >
            <option value="All">All Categories</option>
            <option value="Course Query">Course Query</option>
            <option value="Payment & Refund">Payment & Refund</option>
            <option value="Job & Internship">Job & Internship</option>
            <option value="Certificate Issue">Certificate Issue</option>
            <option value="Technical Problem">Technical Problem</option>
            <option value="Other Query">Other Query</option>
          </select>
        </div>
      </div>

      {/* Tickets Table / List */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
      >
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center" style={{ color: colors.subtext }}>
            <LifeBuoy size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-bold">No Support Tickets Found</p>
            <p className="text-sm">No student queries match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.subtext }}
                >
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Category & Subject</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: colors.border }}>
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-indigo-500/5 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-bold text-sm" style={{ color: colors.text }}>
                        {t.name}
                      </div>
                      <div className="text-xs font-medium flex items-center gap-1.5 mt-1 opacity-80" style={{ color: colors.subtext }}>
                        <Mail size={12} className="text-indigo-500" /> {t.email}
                      </div>
                      {t.mobile && (
                        <div className="text-xs font-medium flex items-center gap-1.5 mt-1 opacity-70" style={{ color: colors.subtext }}>
                          <Phone size={12} className="text-indigo-500" /> {t.mobile}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                          <Tag size={10} /> {t.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          t.source === 'Website' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                          {t.source === 'Website' ? '🌐 Website' : '📱 Mobile App'}
                        </span>
                      </div>
                      <div className="font-semibold text-sm line-clamp-2" style={{ color: colors.text }}>
                        {t.subject}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs align-top">
                      <p className="text-xs line-clamp-3 font-medium leading-relaxed" style={{ color: colors.subtext }}>
                        {t.message}
                      </p>
                      {t.adminReply && (
                        <div className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20 flex items-start gap-1.5">
                          <MessageSquare size={12} className="mt-0.5 flex-shrink-0" /> 
                          <span className="line-clamp-2">Reply: {t.adminReply}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <div className="mt-0.5">{getStatusBadge(t.status)}</div>
                    </td>

                    <td className="p-4 text-xs font-medium align-top" style={{ color: colors.subtext }}>
                      <div className="mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="p-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-0.5">
                        <button
                          onClick={() => handleOpenReplyModal(t)}
                          className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-all font-bold"
                          title="Reply / Update Status"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(t._id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all font-bold"
                          title="Delete Ticket"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm" style={{ borderColor: colors.border, color: colors.subtext }}>
            <div className="font-medium">
              Total {totalItems} queries • Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-50 hover:bg-indigo-500/10 transition-all"
                style={{ backgroundColor: colors.bg, borderColor: colors.border }}
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-50 hover:bg-indigo-500/10 transition-all"
                style={{ backgroundColor: colors.bg, borderColor: colors.border }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply / Status Modal */}
      {modalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border transition-all overflow-hidden"
            style={{
              backgroundColor: colors.cardBg || '#ffffff',
              borderColor: colors.border || '#cbd5e1',
              color: colors.text || '#0f172a',
            }}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: colors.border }}>
              <h3 className="text-xl font-bold flex items-center gap-2.5" style={{ color: colors.text }}>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <LifeBuoy size={22} />
                </div>
                Ticket Details & Reply
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Ticket Info Card */}
              <div className="p-4 rounded-xl border space-y-3 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Student Name</span>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <User size={15} className="text-indigo-500" /> {selectedTicket.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Mail size={15} className="text-indigo-500" /> {selectedTicket.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        <Tag size={12} /> {selectedTicket.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Created Date</span>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                      {new Date(selectedTicket.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject</span>
                  <p className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{selectedTicket.subject}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Query Message</span>
                  <div className="mt-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold whitespace-pre-wrap leading-relaxed shadow-inner">
                    {selectedTicket.message}
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Update Ticket Status
                </label>
                <select
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  style={{
                    backgroundColor: colors.bg || '#ffffff',
                    borderColor: colors.border || '#cbd5e1',
                    color: colors.text || '#0f172a',
                  }}
                >
                  <option value="Pending">🔴 Pending</option>
                  <option value="In Progress">🟡 In Progress</option>
                  <option value="Resolved">🟢 Resolved</option>
                  <option value="Closed">⚪ Closed</option>
                </select>
              </div>

              {/* Admin Reply Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Admin Response / Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type resolution answer or reply for the student..."
                  className="w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                  style={{
                    backgroundColor: colors.bg || '#ffffff',
                    borderColor: colors.border || '#cbd5e1',
                    color: colors.text || '#0f172a',
                  }}
                />
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-4 px-6 border-t flex justify-end gap-3 shrink-0 bg-slate-50/80 dark:bg-slate-900/80" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSaveReply}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                <Send size={16} /> Save & Respond
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportTickets;
