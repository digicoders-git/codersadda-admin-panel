import http from './http';

export const saveCertificateTemplate = async (formData) => {
  const response = await http.post('/certificate/template/save', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getCertificateTemplate = async (courseId) => {
  const response = await http.get(`/certificate/template/${courseId}`);
  return response.data;
};

export const getMyCertificates = async () => {
  const response = await http.get('/certificate/my-certificates');
  return response.data;
};
