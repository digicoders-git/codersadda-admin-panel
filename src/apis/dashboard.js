import http from './http';

export const getDashboardStats = async () => {
  const response = await http.get('/dashboard/stats');
  return response.data;
};
