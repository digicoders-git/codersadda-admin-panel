import http from './http';

export const createJob = async (data) => {
  const response = await http.post('/job/create', data);
  return response.data;
};

export const getJobs = async (params) => {
  const response = await http.get('/job/get', { params });
  return response.data;
};

export const getJobById = async (id) => {
  const response = await http.get(`/job/get/${id}`);
  return response.data;
};

export const updateJob = async (id, data) => {
  const response = await http.put(`/job/update/${id}`, data);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await http.delete(`/job/delete/${id}`);
  return response.data;
};

export const toggleJobStatus = async (id) => {
  const response = await http.patch(`/job/toggle-status/${id}`);
  return response.data;
};
