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

export const getAllCertificateTemplates = async () => {
  const response = await http.get('/certificate/template/all');
  return response.data;
};

export const deleteCertificateTemplate = async (id) => {
  const response = await http.delete(`/certificate/template/delete/${id}`);
  return response.data;
};

export const toggleCertificateTemplateStatus = async (id) => {
  const response = await http.patch(`/certificate/template/toggle-status/${id}`);
  return response.data;
};

export const getUserCertificatesByUserId = async (userId) => {
  const response = await http.get(`/certificate/admin/user-certificates/${userId}`);
  return response.data;
};
