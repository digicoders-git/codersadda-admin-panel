import http from './http';

export const createNotification = async (data) => {
  const response = await http.post('/notifications/admin/create', data);
  return response.data;
};

export const getAdminNotifications = async (params = {}) => {
  const response = await http.get('/notifications/admin/list', { params });
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await http.delete(`/notifications/admin/${id}`);
  return response.data;
};

export const getNotificationStats = async () => {
  const response = await http.get('/notifications/admin/stats');
  return response.data;
};

// User picker — search users for Specific targeting
export const getUsersForPicker = async (search = '', page = 1) => {
  const response = await http.get('/notifications/admin/users', { params: { search, page, limit: 20 } });
  return response.data;
};

// Course picker — list active courses for CourseEnrolled targeting
export const getCoursesForPicker = async () => {
  const response = await http.get('/notifications/admin/courses');
  return response.data;
};
