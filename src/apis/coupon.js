import http from './http';

export const getAllCoupons = async () => {
  const response = await http.get('/coupon/get');
  return response.data;
};

export const createCoupon = async (data) => {
  const response = await http.post('/coupon/create', data);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await http.delete(`/coupon/delete/${id}`);
  return response.data;
};

export const getSingleCoupon = async (id) => {
  const response = await http.get(`/coupon/get/${id}`);
  return response.data;
};

export const updateCoupon = async (id, data) => {
  const response = await http.put(`/coupon/update/${id}`, data);
  return response.data;
};

export const validateCoupon = async (data) => {
  const response = await http.post('/coupon/validate', data);
  return response.data;
};
