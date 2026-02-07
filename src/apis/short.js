import http from './http';

export const createShort = async (data) => {
  const response = await http.post('/shorts/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getShorts = async (params) => {
  const response = await http.get('/shorts/get', { params });
  return response.data;
};

export const updateShort = async (id, data) => {
  const response = await http.put(`/shorts/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteShort = async (id) => {
  const response = await http.delete(`/shorts/delete/${id}`);
  return response.data;
};

export const toggleShortStatus = async (id) => {
  const response = await http.patch(`/shorts/toggle-status/${id}`);
  return response.data;
};

// ======= SHORTS COMMENTS =======
export const getLatestShortComments = async () => {
  const response = await http.get('/short-comments/latest');
  return response.data;
};

export const getShortComments = async (shortId) => {
  const response = await http.get(`/short-comments/get/${shortId}`);
  return response.data;
};

export const replyToShortComment = async (commentId, data) => {
  const response = await http.post(`/short-comments/reply/${commentId}`, data);
  return response.data;
};

export const deleteShortComment = async (commentId) => {
  const response = await http.delete(`/short-comments/admin/delete/${commentId}`);
  return response.data;
};
