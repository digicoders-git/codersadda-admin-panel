import http from './http';

export const getMyCourses = async () => {
  const response = await http.get('/course/instructor/my-courses');
  return response.data;
};

export const createCourse = async (data) => {
  const response = await http.post('/course/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllCourses = async (params) => {
  const response = await http.get('/course/get', { params });
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await http.get(`/course/get/${id}`);
  return response.data;
};

export const updateCourse = async (id, data) => {
  const response = await http.put(`/course/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await http.delete(`/course/delete/${id}`);
  return response.data;
};

export const toggleCourseStatus = async (id) => {
  const response = await http.patch(`/course/toggle-status/${id}`);
  return response.data;
};

export const getCategoriesWithCount = async () => {
  const response = await http.get('/course/categories-with-count');
  return response.data;
};
