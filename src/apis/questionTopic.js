import http from "./http";

export const createTopic = async (data) => {
  const response = await http.post("/quiz/topic/create", data);
  return response.data;
};

export const getAllTopics = async (search = "", page = 1, limit = 10, status = "") => {
  const response = await http.get("/quiz/topic/all", {
    params: { search, page, limit, status },
  });
  return response.data;
};

export const getTopicById = async (id) => {
  const response = await http.get(`/quiz/topic/get/${id}`);
  return response.data;
};

export const updateTopic = async (id, data) => {
  const response = await http.put(`/quiz/topic/update/${id}`, data);
  return response.data;
};

export const deleteTopic = async (id) => {
  const response = await http.delete(`/quiz/topic/delete/${id}`);
  return response.data;
};

export const toggleTopicStatus = async (id) => {
  const response = await http.patch(`/quiz/topic/toggle-status/${id}`);
  return response.data;
};
