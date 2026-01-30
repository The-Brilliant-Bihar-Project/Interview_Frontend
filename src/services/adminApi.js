import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true
});

/* ✅ attach token automatically */
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  login: (data) => adminApi.post("/login", data),

  getApplications: (params) =>
    adminApi.get("/applications", { params }),

  getStats: () =>
    adminApi.get("/stats"),

  deleteApplication: (id) =>
    adminApi.delete(`/applications/${id}`),

  updateApplication: (id, data) =>
    adminApi.put(`/applications/${id}`, data),

  updateApplicationStatus: (id, status) =>
    adminApi.patch(`/applications/${id}/status`, { status }),

  exportApplications: (format) =>
    adminApi.get(`/export/${format}`, { responseType: "blob" })
};
