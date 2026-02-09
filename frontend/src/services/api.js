import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_WEATHER_API_KEY';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  registerFarmer: (data) => api.post('/auth/farmer/register', data),
  loginFarmer: (data) => api.post('/auth/farmer/login', data),
  registerLabour: (data) => api.post('/auth/labour/register', data),
  loginLabour: (data) => api.post('/auth/labour/login', data),
};

// Job APIs
export const jobAPI = {
  createJob: (data) => api.post('/jobs', data),
  getAllJobs: () => api.get('/jobs'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  applyForJob: (jobId) => api.post(`/jobs/${jobId}/apply`),
  acceptApplication: (jobId, labourId) => api.post(`/jobs/${jobId}/accept/${labourId}`),
  rejectApplication: (jobId, labourId) => api.post(`/jobs/${jobId}/reject/${labourId}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getMyApplications: () => api.get('/jobs/my-applications'),
};

// Weather API
export const weatherAPI = {
  getCurrentWeather: async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  getWeatherByCoords: async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Crop Prediction API
export const cropAPI = {
  predictCrop: (data) => api.post('/crop/predict', data),
};

// Yield Prediction API
export const yieldAPI = {
  predictYield: (data) => api.post('/yield/predict', data),
};

// Labour Prediction API
export const labourAPI = {
  predictLabour: (data) => api.post('/labour/predict-labour', data),
  recommendLabour: (data) => api.post('/labour/recommend', data),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPaymentDetails: (jobId) => api.get(`/payments/job/${jobId}`),
  getMyPayments: () => api.get('/payments/my-payments'),
  getReceivedPayments: () => api.get('/payments/received'),
};

// Payout APIs
export const payoutAPI = {
  addBankDetails: (data) => api.post('/payouts/bank-details', data),
  transferToLabour: (paymentId) => api.post('/payouts/transfer', { paymentId }),
  getPayoutStatus: (paymentId) => api.get(`/payouts/status/${paymentId}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Work Request APIs
export const workRequestAPI = {
  sendRequest: (data) => api.post('/work-requests/send', data),
  getReceivedRequests: () => api.get('/work-requests/received'),
  getSentRequests: () => api.get('/work-requests/sent'),
  respondToRequest: (data) => api.post('/work-requests/respond', data),
  cancelRequest: (requestId) => api.delete(`/work-requests/${requestId}/cancel`),
};

export default api;
