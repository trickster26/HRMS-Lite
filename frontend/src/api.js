import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

export const getEmployees = () => api.get('/employees/');
export const createEmployee = (data) => api.post('/employees/', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
export const getEmployee = (id) => api.get(`/employees/${id}`);

export const markAttendance = (employeeId, data) => api.post(`/attendance/${employeeId}`, data);
export const getAttendance = (employeeId) => api.get(`/attendance/${employeeId}`);

export default api;
