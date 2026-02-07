import http from './http';

export const createTopic = async (data) => {
  const response = await http.post('/curriculum/create', data);
  return response.data;
};

export const getTopicsByCourse = async (courseId) => {
  const response = await http.get(`/curriculum/get/by-course/${courseId}`);
  return response.data;
};

export const updateTopic = async (id, data) => {
  const response = await http.put(`/curriculum/update/${id}`, data);
  return response.data;
};

export const deleteTopic = async (id) => {
  const response = await http.delete(`/curriculum/delete/${id}`);
  return response.data;
};

export const getAllTopics = async () => {
  const response = await http.get('/curriculum/get');
  return response.data;
};
