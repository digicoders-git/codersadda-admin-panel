import http from './http';

export const getSalesDashboardData = async (params) => {
  const response = await http.get('/admin/sales/dashboard-data', { params });
  return response.data;
};

export const getSalesItemData = async (params) => {
  const response = await http.get('/admin/sales/item-data', { params });
  return response.data;
};
