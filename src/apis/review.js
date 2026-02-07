import http from './http';

export const createReview = async (data) => {
  const response = await http.post('/review/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getReviews = async (params) => {
  const response = await http.get('/review/get', { params });
  return response.data;
};

export const getReviewById = async (id) => {
  const response = await http.get(`/review/get/${id}`);
  return response.data;
};

export const updateReview = async (id, data) => {
  const response = await http.put(`/review/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await http.delete(`/review/delete/${id}`);
  return response.data;
};

export const toggleReviewStatus = async (id) => {
  const response = await http.patch(`/review/toggle-status/${id}`);
  return response.data;
};
