import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe, Smartphone, HelpCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getFaqs, addFaq, updateFaq, deleteFaq } from "../../apis/faq";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Toggle from "../../components/ui/Toggle";
import Loader from "../../components/Loader";

function Faqs() {
  const { colors } = useTheme();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showOnWebsite, setShowOnWebsite] = useState(true);
  const [showOnApp, setShowOnApp] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await getFaqs();
      if (res.success) {
        setFaqs(res.faqs);
      }
    } catch (error) {
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and Answer are required");
      return;
    }

    try {
      setActionLoading(true);
      const data = { question, answer, showOnWebsite, showOnApp };

      if (editingId) {
        const res = await updateFaq(editingId, data);
        if (res.success) {
          toast.success("FAQ updated successfully");
          setEditingId(null);
        }
      } else {
        const res = await addFaq(data);
        if (res.success) {
          toast.success("FAQ added successfully");
        }
      }
      setQuestion("");
      setAnswer("");
      setShowOnWebsite(true);
      setShowOnApp(true);
      fetchFaqs();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setShowOnWebsite(faq.showOnWebsite);
    setShowOnApp(faq.showOnApp);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete FAQ?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteFaq(id);
          if (res.success) {
            toast.success("FAQ deleted successfully");
            fetchFaqs();
          }
        } catch (error) {
          toast.error("Failed to delete FAQ");
        }
      }
    });
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const res = await updateFaq(id, { isActive: !currentStatus });
      if (res.success) {
        toast.success("Status updated");
        setFaqs(
          faqs.map((faq) =>
            faq._id === id ? { ...faq, isActive: !currentStatus } : faq
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-4 lg:p-8 flex-1" style={{ backgroundColor: colors.background }}>
      <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold" style={{ color: colors.text }}>
            Manage FAQs
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Add and manage frequently asked questions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border p-4 lg:p-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
              {editingId ? "Edit FAQ" : "Add New FAQ"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none transition-colors"
                  style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                  placeholder="Enter question"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none transition-colors"
                  style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                  placeholder="Enter answer"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnWebsite}
                    onChange={(e) => setShowOnWebsite(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Globe size={18} style={{ color: colors.primary }} />
                    <span style={{ color: colors.text }}>Show on Website</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnApp}
                    onChange={(e) => setShowOnApp(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Smartphone size={18} style={{ color: colors.primary }} />
                    <span style={{ color: colors.text }}>Show on App</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setQuestion("");
                      setAnswer("");
                      setShowOnWebsite(true);
                      setShowOnApp(true);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: colors.background, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {actionLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingId ? (
                    <>
                      <Edit2 size={18} /> Update
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Add FAQ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader />
              </div>
            ) : faqs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `${colors.primary}15` }}>
                  <HelpCircle size={32} style={{ color: colors.primary }} />
                </div>
                <h3 className="text-lg font-medium mb-1" style={{ color: colors.text }}>No FAQs Yet</h3>
                <p style={{ color: colors.textSecondary }}>Add your first FAQ using the form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colors.border, backgroundColor: `${colors.background}80` }}>
                      <th className="px-6 py-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Question</th>
                      <th className="px-6 py-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Platforms</th>
                      <th className="px-6 py-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Status</th>
                      <th className="px-6 py-4 font-semibold text-sm text-right" style={{ color: colors.textSecondary }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.border }}>
                    {faqs.map((faq) => (
                      <tr key={faq._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate font-medium" style={{ color: colors.text }}>
                            {faq.question}
                          </div>
                          <div className="max-w-xs truncate text-sm mt-1" style={{ color: colors.textSecondary }}>
                            {faq.answer}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {faq.showOnWebsite && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                <Globe size={12} /> Web
                              </span>
                            )}
                            {faq.showOnApp && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                <Smartphone size={12} /> App
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Toggle
                            active={faq.isActive}
                            onClick={() => handleStatusChange(faq._id, faq.isActive)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            style={{ color: colors.textSecondary }}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(faq._id)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Faqs;
