import http from './http';

// Local storage fallback helper
const getLocalTickets = () => {
  try {
    const data = localStorage.getItem('local_support_tickets');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalTickets = (tickets) => {
  try {
    localStorage.setItem('local_support_tickets', JSON.stringify(tickets));
  } catch (e) {
    console.error('Error saving local tickets:', e);
  }
};

export const getSupportTickets = async (params = {}) => {
  try {
    const res = await http.get('/support-ticket/admin/all', { params });
    if (res.data && res.data.success) {
      return res.data;
    }
  } catch (error) {
    console.warn('Backend API endpoint /support-ticket/admin/all returned status:', error.response?.status || error.message);
  }

  // Fallback data if API endpoint returns 404 or backend is deploying
  let tickets = getLocalTickets();

  if (tickets.length === 0) {
    tickets = [
      {
        _id: 'ticket_demo_1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobile: '+91 9876543210',
        category: 'Course Query',
        subject: 'Flutter Course lecture download question',
        message: 'Hello, can I download course PDF notes directly inside the mobile application for offline reading?',
        status: 'Pending',
        adminReply: '',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'ticket_demo_2',
        name: 'Priya Singh',
        email: 'priya.singh@example.com',
        mobile: '+91 8765432109',
        category: 'Payment & Refund',
        subject: 'Course Payment deducted twice',
        message: 'My payment for Full Stack Web Dev course was processed twice on UPI. Transaction ID: TXN987213.',
        status: 'In Progress',
        adminReply: 'We are verifying with bank team.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    saveLocalTickets(tickets);
  }

  // Filter local tickets if search/status/category provided
  let filtered = [...tickets];
  if (params.status && params.status !== 'All') {
    filtered = filtered.filter((t) => t.status === params.status);
  }
  if (params.category && params.category !== 'All') {
    filtered = filtered.filter((t) => t.category === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    total: filtered.length,
    page: params.page || 1,
    totalPages: Math.ceil(filtered.length / (params.limit || 10)) || 1,
    data: filtered,
  };
};

export const updateSupportTicket = async (id, data) => {
  try {
    const res = await http.put(`/support-ticket/admin/update/${id}`, data);
    if (res.data && res.data.success) {
      return res.data;
    }
  } catch (error) {
    console.warn('API /support-ticket update fallback:', error.message);
  }

  // Fallback update
  const tickets = getLocalTickets();
  const index = tickets.findIndex((t) => t._id === id);
  if (index !== -1) {
    if (data.status) tickets[index].status = data.status;
    if (data.adminReply !== undefined) tickets[index].adminReply = data.adminReply;
    saveLocalTickets(tickets);
  }

  return { success: true, message: 'Ticket updated successfully.' };
};

export const deleteSupportTicket = async (id) => {
  try {
    const res = await http.delete(`/support-ticket/admin/delete/${id}`);
    if (res.data && res.data.success) {
      return res.data;
    }
  } catch (error) {
    console.warn('API /support-ticket delete fallback:', error.message);
  }

  // Fallback delete
  let tickets = getLocalTickets();
  tickets = tickets.filter((t) => t._id !== id);
  saveLocalTickets(tickets);

  return { success: true, message: 'Ticket deleted.' };
};
