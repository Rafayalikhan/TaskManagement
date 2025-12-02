import axiosInstance from './axios';

// Auth APIs
export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getMe: () => axiosInstance.get('/auth/me'),
};



export const taskAPI = {
  getUserTasks: () => axiosInstance.get('/tasks'),
  createTask: (data) => axiosInstance.post('/tasks', data),
  updateTask: (taskId, data) => {
    console.log('API Call - Update Task:', {
      url: `/tasks/${taskId}`,
      method: 'PUT', 
      data: data
    });
    return axiosInstance.put(`/tasks/${taskId}`, data);
  },
};

// Admin APIs
export const adminAPI = {
  getAllTasks: () => axiosInstance.get('/admin/tasks'),
};