import http from "./http";

export const getFaqs = async (params = {}) => {
  try {
    const response = await http.get("/faq", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addFaq = async (data) => {
  try {
    const response = await http.post("/faq/add", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFaq = async (id, data) => {
  try {
    const response = await http.put(`/faq/update/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFaq = async (id) => {
  try {
    const response = await http.delete(`/faq/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
