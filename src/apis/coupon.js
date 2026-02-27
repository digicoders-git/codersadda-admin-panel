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

export const validateCoupon = async (data) => {
  const response = await http.post('/coupon/validate', data);
  return response.data;
};
