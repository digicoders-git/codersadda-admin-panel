import http from "./http";

export const getJobApplications = async (params) => {
  const { data } = await http.get("/job-applications/admin/all", { params });
  return data;
};

export const getJobApplicationDetails = async (id) => {
  const { data } = await http.get(`/job-applications/admin/${id}`);
  return data;
};

export const updateJobApplicationStatus = async (id, payload) => {
  const { data } = await http.put(`/job-applications/admin/update-status/${id}`, payload);
  return data;
};

export const getJobApplicationStats = async () => {
  const { data } = await http.get("/job-applications/admin/stats");
  return data;
};
