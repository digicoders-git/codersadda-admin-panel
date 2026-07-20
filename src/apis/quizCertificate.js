import http from './http';

export const saveQuizCertificateTemplate = async (data) => {
  const response = await http.post('/quiz/certificate/template/save', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getQuizCertificateTemplate = async (quizId) => {
  const response = await http.get(`/quiz/certificate/template/get/${quizId}`);
  return response.data;
};

export const getAllQuizCertificateTemplates = async () => {
  const response = await http.get('/quiz/certificate/template/all');
  return response.data;
};

export const deleteQuizCertificateTemplate = async (id) => {
  const response = await http.delete(`/quiz/certificate/template/delete/${id}`);
  return response.data;
};

export const toggleQuizCertificateTemplateStatus = async (id) => {
  const response = await http.patch(`/quiz/certificate/template/toggle-status/${id}`);
  return response.data;
};
