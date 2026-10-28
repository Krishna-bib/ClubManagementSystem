// import { Navigate } from "react-router-dom";
// import { getToken, getUserRole } from "../../services/api";

// const ProtectedRoute = ({ children, role }) => {
//   const token = getToken();
//   const userRole = getUserRole();

//   if (!token) {
//     return <Navigate to="/login" />;
//   }

//   if (role && role !== userRole) {
//     return <Navigate to="/unauthorized" />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import API from '../../services/api';

// Token management
export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  }
};
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/login" />;
  }

  return children;
};


// Role management
export const getUserRole = () => localStorage.getItem('role');

export const setUserRole = (role) => {
  localStorage.setItem('role', role);
};

// Auth functions
export const login = async (credentials) => {
  const response = await API.post('/login', credentials);
  const { token, role } = response.data;
  setToken(token);
  setUserRole(role);
  return response.data;
};

export const logout = () => {
  setToken(null);
  localStorage.removeItem('role');
};

// Request interceptor
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
