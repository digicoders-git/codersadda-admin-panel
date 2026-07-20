import http from './http';

export const getJobEnrollmentStats = async () => {
  const response = await http.get('/admin/job-enrollments/stats');
  return response.data;
};

export const getAllJobEnrollments = async (params) => {
  const response = await http.get('/admin/job-enrollments/all', { params });
  return response.data;
};

export const getJobStudents = async (jobId) => {
  const response = await http.get(`/admin/job-enrollments/${jobId}/students`);
  return response.data;
};
