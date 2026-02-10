import http from './http';

export const createQuiz = async (data) => {
  const response = await http.post('/quiz/create', data);
  return response.data;
};

export const getQuizzes = async (params) => {
  const response = await http.get('/quiz/get', { params });
  return response.data;
};

export const getQuizById = async (id) => {
  const response = await http.get(`/quiz/get/${id}`);
  return response.data;
};

export const updateQuiz = async (id, data) => {
  const response = await http.put(`/quiz/update/${id}`, data);
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await http.delete(`/quiz/delete/${id}`);
  return response.data;
};

export const toggleQuizStatus = async (id) => {
  const response = await http.patch(`/quiz/toggle-status/${id}`);
  return response.data;
};

export const getAttemptsByQuiz = async (quizId) => {
  const response = await http.get(`/quiz/attempt/quiz/${quizId}`);
  return response.data;
};

export const exportReportExcel = async (quizId) => {
  return await http.get(`/quiz/export/report/${quizId}`, {
    responseType: "blob",
  });
};

export const exportResultPDF = async (quizId, studentId) => {
  return await http.get(`/quiz/export/result/${quizId}/${studentId}`, {
    responseType: "blob",
  });
};
