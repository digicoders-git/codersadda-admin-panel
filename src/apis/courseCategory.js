import http from './http';

export const createCourseCategory = async (data) => {
  const response = await http.post('/CourseCategory/create', data);
  return response.data;
};

export const getCourseCategories = async (params) => {
  const response = await http.get('/CourseCategory/get', { params });
  return response.data;
};

export const getCourseCategoryById = async (id) => {
  const response = await http.get(`/CourseCategory/get/${id}`);
  return response.data;
};

export const updateCourseCategory = async (id, data) => {
  const response = await http.put(`/CourseCategory/update/${id}`, data);
  return response.data;
};

export const deleteCourseCategory = async (id) => {
  const response = await http.delete(`/CourseCategory/delete/${id}`);
  return response.data;
};
