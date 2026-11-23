import http from './http';

export const createSlider = async (data) => {
  const response = await http.post('/sliders/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getSliders = async () => {
  const response = await http.get('/sliders/get');
  return response.data;
};

export const updateSlider = async (id, data) => {
  const response = await http.put(`/sliders/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteSlider = async (id) => {
  const response = await http.delete(`/sliders/delete/${id}`);
  return response.data;
};

export const toggleSliderStatus = async (id) => {
  const response = await http.patch(`/sliders/toggle-status/${id}`);
  return response.data;
};
