import http from './http';

export const instructorLogin = async (data) => {
  const response = await http.post('/instructor/login', data);
  return response.data;
};

export const createInstructor = async (data) => {
  const response = await http.post('/instructor/create', data);
  return response.data;
};

export const getInstructors = async (params) => {
  const response = await http.get('/instructor/get', { params });
  return response.data;
};

export const getInstructorById = async (id) => {
  const response = await http.get(`/instructor/get/${id}`);
  return response.data;
};

export const updateInstructor = async (id, data) => {
  const response = await http.put(`/instructor/update/${id}`, data);
  return response.data;
};

export const deleteInstructor = async (id) => {
  const response = await http.delete(`/instructor/delete/${id}`);
  return response.data;
};

export const getInstructorProfile = async () => {
  const response = await http.get('/instructor/profile');
  return response.data;
};

export const getInstructorStats = async () => {
  const response = await http.get('/instructor/stats');
  return response.data;
};
