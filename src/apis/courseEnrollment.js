import http from './http';

export const getCourseEnrollmentStats = async () => {
  const response = await http.get('/admin/course-enrollments/stats');
  return response.data;
};

export const getAllCoursesEnrollments = async (params) => {
  const response = await http.get('/admin/course-enrollments/all', { params });
  return response.data;
};

export const getCourseStudents = async (courseId) => {
  const response = await http.get(`/admin/course-enrollments/${courseId}/students`);
  return response.data;
};

export const resetCourseProgress = async (userId, courseId) => {
  const response = await http.post('/admin/course-enrollments/reset-progress', {
    userId,
    courseId,
  });
  return response.data;
};

export const toggleCourseAccess = async (userId, courseId) => {
  const response = await http.patch('/admin/course-enrollments/toggle-access', {
    userId,
    courseId,
  });
  return response.data;
};

export const getCourseAnalytics = async (courseId) => {
  const response = await http.get(`/admin/course-enrollments/${courseId}/analytics`);
  return response.data;
};
