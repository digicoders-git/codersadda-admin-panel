import http from './http';

export const createFreeDownload = async (data) => {
  const response = await http.post('/free-downloads/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getFreeDownloads = async (params) => {
  const response = await http.get('/free-downloads/get', { params });
  return response.data;
};

export const getFreeDownloadById = async (id) => {
  const response = await http.get(`/free-downloads/get/${id}`);
  return response.data;
};

export const updateFreeDownload = async (id, data) => {
  const response = await http.put(`/free-downloads/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteFreeDownload = async (id) => {
  const response = await http.delete(`/free-downloads/delete/${id}`);
  return response.data;
};
