import http from './http';

export const createLecture = async (data) => {
  const response = await http.post('/lecture/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateLecture = async (id, data) => {
  const response = await http.put(`/lecture/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllLectures = async () => {
  const response = await http.get('/lecture/get');
  return response.data;
};

export const getLecturesByCourse = async (courseId) => {
  const response = await http.get(`/lecture/get/by-course/${courseId}`);
  return response.data;
};

export const getLectureById = async (id) => {
  const response = await http.get(`/lecture/get/${id}`);
  return response.data;
};

export const deleteLecture = async (id) => {
  const response = await http.delete(`/lecture/delete/${id}`);
  return response.data;
};
