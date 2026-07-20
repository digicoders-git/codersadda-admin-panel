import http from './http';

export const createBlog = async (data) => {
  const response = await http.post('/blog/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getBlogs = async (params) => {
  const response = await http.get('/blog/get', { params });
  return response.data;
};

export const getBlogById = async (id) => {
  const response = await http.get(`/blog/get/${id}`);
  return response.data;
};

export const updateBlog = async (id, data) => {
  const response = await http.put(`/blog/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await http.delete(`/blog/delete/${id}`);
  return response.data;
};

export const toggleBlogStatus = async (id) => {
  const response = await http.patch(`/blog/toggle-status/${id}`);
  return response.data;
};
