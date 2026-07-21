import http from './http';

export const createService = async (data) => {
  const response = await http.post('/service/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getServices = async (params) => {
  const response = await http.get('/service/get', { params });
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await http.get(`/service/get/${id}`);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await http.put(`/service/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteService = async (id) => {
  const response = await http.delete(`/service/delete/${id}`);
  return response.data;
};

export const toggleServiceStatus = async (id) => {
  const response = await http.patch(`/service/toggle-status/${id}`);
  return response.data;
};
