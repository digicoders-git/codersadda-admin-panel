import http from './http';

const liveClassApi = {
  // Admin
  getStats: () => http.get('/live-class/admin/stats'),
  getAll: () => http.get('/live-class/admin/all'),
  getById: (id) => http.get(`/live-class/admin/${id}`),
  create: (data) => http.post('/live-class/admin', data),
  update: (id, data) => http.patch(`/live-class/admin/${id}`, data),
  delete: (id) => http.delete(`/live-class/admin/${id}`),
  showOnApp: (id) => http.post(`/live-class/admin/${id}/show-on-app`),
  hideFromApp: (id) => http.post(`/live-class/admin/${id}/hide-from-app`),
  cancel: (id) => http.post(`/live-class/admin/${id}/cancel`),

  // Instructor
  getMyClasses: () => http.get('/live-class/instructor/my-classes'),
  getObsConfig: (id) => http.get(`/live-class/instructor/${id}/obs-config`),
  regenKey: (id) => http.post(`/live-class/instructor/${id}/regen-key`),

  // Student
  getByCourse: (courseId) => http.get(`/live-class/student/by-course/${courseId}`),
  getUpcoming: (courseId) => http.get(`/live-class/student/upcoming/${courseId}`),
  getPlaybackUrl: (id) => http.get(`/live-class/student/${id}/play`),
};

export default liveClassApi;
