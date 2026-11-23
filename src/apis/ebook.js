import http from './http';

export const createEbook = async (data) => {
  const response = await http.post('/ebook/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getEbooks = async (params) => {
  const response = await http.get('/ebook/get', { params });
  return response.data;
};

export const getEbookById = async (id) => {
  const response = await http.get(`/ebook/get/${id}`);
  return response.data;
};

export const updateEbook = async (id, data) => {
  const response = await http.put(`/ebook/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteEbook = async (id) => {
  const response = await http.delete(`/ebook/delete/${id}`);
  return response.data;
};
