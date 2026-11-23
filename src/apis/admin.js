import http from './http';

export const adminLogin = async (data) => {
  const response = await http.post('/admin/login', data);
  return response.data;
};

export const createAdmin = async (data) => {
  const response = await http.post('/admin/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAdmins = async () => {
  const response = await http.get('/admin/get');
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await http.delete(`/admin/delete/${id}`);
  return response.data;
};

export const updateAdmin = async (id, data) => {
  const response = await http.put(`/admin/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
