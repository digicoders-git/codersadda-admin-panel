import http from './http';

export const createEbookCategory = async (data) => {
  const response = await http.post('/ebooks-category/create', data);
  return response.data;
};

export const getEbookCategories = async (params) => {
  const response = await http.get('/ebooks-category/get', { params });
  return response.data;
};

export const getEbookCategoryById = async (id) => {
  const response = await http.get(`/ebooks-category/get/${id}`);
  return response.data;
};

export const updateEbookCategory = async (id, data) => {
  const response = await http.put(`/ebooks-category/update/${id}`, data);
  return response.data;
};

export const deleteEbookCategory = async (id) => {
  const response = await http.delete(`/ebooks-category/delete/${id}`);
  return response.data;
};
