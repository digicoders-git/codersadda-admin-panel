import http from './http';

export const getEbookEnrollmentStats = async () => {
  const response = await http.get('/admin/ebook-enrollments/stats');
  return response.data;
};

export const getAllEbookEnrollments = async (params) => {
  const response = await http.get('/admin/ebook-enrollments/all', { params });
  return response.data;
};

export const getEbookStudents = async (ebookId) => {
  const response = await http.get(`/admin/ebook-enrollments/${ebookId}/students`);
  return response.data;
};
