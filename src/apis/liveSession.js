import http from './http';

const liveSessionApi = {
  getAll: () => http.get('/live-session/admin/all'),
  getByCourse: (courseId) => http.get(`/live-session/by-course/${courseId}`),
  getById: (id) => http.get(`/live-session/${id}`),
  create: (data) => http.post('/live-session/admin/create', data),
  update: (id, data) => http.put(`/live-session/admin/${id}`, data),
  delete: (id) => http.delete(`/live-session/admin/${id}`),
  goLive: (id) => http.put(`/live-session/admin/${id}`, { status: 'live' }),
  endLive: (id, recordingUrl = '') => http.put(`/live-session/admin/${id}`, { status: 'ended', recordingUrl }),
};

export default liveSessionApi;
