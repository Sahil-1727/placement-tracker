import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login           = (data) => api.post('/auth/login', data);
export const register        = (data) => api.post('/auth/register', data);
export const getJobs         = ()     => api.get('/jobs/');
export const applyJob        = (id)   => api.post(`/jobs/${id}/apply`);
export const createJob       = (data) => api.post('/jobs', data);
export const updateJob       = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob       = (id)   => api.delete(`/jobs/${id}`);
export const getProfile      = ()     => api.get('/profile');
export const updateProfile   = (data) => api.put('/profile', data);
export const getApplications = ()     => api.get('/applications');
export const getStudents     = ()     => api.get('/admin/students');
export const getCompanies    = ()     => api.get('/admin/companies');
export const addCompany      = (data) => api.post('/admin/companies', data);
export const updateCompany   = (id, data) => api.put(`/admin/companies/${id}`, data);
export const deleteCompany   = (id)   => api.delete(`/admin/companies/${id}`);
export const getReports      = ()     => api.get('/admin/reports');
export const getAdminApplications = () => api.get('/admin/applications');
export const updateApplicationStatus = (id, status) => api.put(`/admin/applications/${id}/status`, { status });
export const aiChat = (message, history) => api.post('/ai/chat', { message, history });

export default api;
