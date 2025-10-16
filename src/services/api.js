import axios from "axios";

const API_URL = "https://github.com/akashgawand/gis-backend/blob/main/server.js";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signin: (credentials) => api.post("/auth/signin", credentials),
  signup: (userData) => api.post("/auth/signup", userData),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get("/roles"),
  create: (data) => api.post("/roles", data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get("/departments"),
  create: (data) => api.post("/departments", data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Geometries API
export const geometriesAPI = {
  getAll: () => api.get("/geometries"),
  getById: (id) => api.get(`/geometries/${id}`),
  create: (data) => api.post("/geometries", data),
  update: (id, data) => api.put(`/geometries/${id}`, data),
  delete: (id) => api.delete(`/geometries/${id}`),
  getStats: () => api.get("/geometries/stats"),
};

export default api;
