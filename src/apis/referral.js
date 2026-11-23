import http from './http';

export const createReferral = async (data) => {
  const response = await http.post('/referral/create', data);
  return response.data;
};

export const getReferrals = async (params) => {
  const response = await http.get('/referral/get', { params });
  return response.data;
};

export const getReferralById = async (id) => {
  const response = await http.get(`/referral/get/${id}`);
  return response.data;
};

export const updateReferral = async (id, data) => {
  const response = await http.put(`/referral/update/${id}`, data);
  return response.data;
};

export const deleteReferral = async (id) => {
  const response = await http.delete(`/referral/delete/${id}`);
  return response.data;
};
