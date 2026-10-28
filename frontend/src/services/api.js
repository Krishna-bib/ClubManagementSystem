import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (credentials) => {
  const response = await API.post('/login', credentials);
  return response.data;
};

export const signup = async (userData) => {
  const response = await API.post('/signup', userData);
  return response.data;
};

// Dashboard endpoints
export const getDashboardData = async (role) => {
  const endpoint = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  const response = await API.get(endpoint);
  return response.data;
};

// Events endpoints
// ...existing code...

// Events endpoints
export const getPastEvents = async () => {
  try {
    const response = await API.get('/events/past'); // Add '/api' prefix
    console.log('Past events response:', response);
    return response.data;
  } catch (error) {
    console.error('getPastEvents error:', {
      url: '/api/events/past',
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const response = await API.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};
// ...existing code...

export const getUpcomingEvents = async () => {
  const response = await API.get('/events/upcoming');
  return response.data;
};

export const registerForEvent = async (eventId) => {
  try {
    const response = await API.post(`/events/register/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Event registration error:', error);
    throw error;
  }
};
export default API;