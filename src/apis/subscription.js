import http from './http';

export const createSubscription = async (data) => {
  const response = await http.post('/subscriptions/create', data);
  return response.data;
};

export const getSubscriptions = async (params) => {
  const response = await http.get('/subscriptions/get', { params });
  return response.data;
};

export const getSubscriptionById = async (id) => {
  const response = await http.get(`/subscriptions/get/${id}`);
  return response.data;
};

export const updateSubscription = async (id, data) => {
  const response = await http.put(`/subscriptions/update/${id}`, data);
  return response.data;
};

export const deleteSubscription = async (id) => {
  const response = await http.delete(`/subscriptions/delete/${id}`);
  return response.data;
};

export const toggleSubscriptionStatus = async (id) => {
  const response = await http.patch(`/subscriptions/toggle-status/${id}`);
  return response.data;
};

// Enrollment Admin APIs
export const getSubscriptionEnrollments = async (params) => {
  const response = await http.get('/subscriptions/enrollments', { params });
  return response.data;
};

export const getSubscriptionStats = async () => {
  const response = await http.get('/subscriptions/stats');
  return response.data;
};

export const extendSubscription = async (data) => {
  const response = await http.patch('/subscriptions/extend', data);
  return response.data;
};

export const cancelSubscription = async (data) => {
  const response = await http.patch('/subscriptions/cancel', data);
  return response.data;
};

export const getStudentsBySubscription = async (id) => {
  const response = await http.get(`/subscriptions/students/${id}`);
  return response.data;
};
