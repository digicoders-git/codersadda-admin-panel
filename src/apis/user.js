import http from './http';

export const createUser = async (data) => {
  const response = await http.post('/admin/users/create', data);
  return response.data;
};

export const getUsers = async (params) => {
  const response = await http.get('/admin/users/get', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await http.get(`/admin/users/get/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await http.put(`/admin/users/update/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await http.delete(`/admin/users/delete/${id}`);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await http.patch(`/admin/users/toggle-status/${id}`);
  return response.data;
};

export const getUserTransactions = async (id) => {
  const response = await http.get(`/admin/users/transactions/${id}`);
  return response.data;
};
