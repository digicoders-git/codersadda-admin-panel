import http from './http';

export const getAmbassadorApplications = async (params = {}) => {
  const response = await http.get('/ambassador/admin/applications', { params });
  return response.data;
};

export const approveAmbassador = async (id) => {
  const response = await http.patch(`/ambassador/admin/approve/${id}`);
  return response.data;
};

export const rejectAmbassador = async (id, comment) => {
  const response = await http.patch(`/ambassador/admin/reject/${id}`, { comment });
  return response.data;
};

export const getReferralConfig = async () => {
  const response = await http.get('/ambassador/admin/config');
  return response.data;
};

export const updateReferralConfig = async (value) => {
  const response = await http.post('/ambassador/admin/config', { value });
  return response.data;
};

export const getReferredUsers = async (userId) => {
  const response = await http.get(`/ambassador/admin/referred-users/${userId}`);
  return response.data;
};
