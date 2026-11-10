import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tvet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  login: async (credentials: { email: string; password?: string }) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('tvet_token', res.data.token);
      localStorage.setItem('tvet_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('tvet_token');
      localStorage.removeItem('tvet_user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('tvet_user');
    return user ? JSON.parse(user) : null;
  }
};

export const userService = {
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  getUserById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateUser: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};

export const evidenceService = {
  getEvidence: async () => {
    const res = await api.get('/evidence');
    return res.data;
  },
  getEvidenceById: async (id: number) => {
    const res = await api.get(`/evidence/${id}`);
    return res.data;
  },
  uploadEvidence: async (evidenceData: any, onUploadProgress?: (progressEvent: any) => void) => {
    const res = await api.post('/evidence/upload', evidenceData, {
      onUploadProgress
    });
    return res.data;
  },
  deleteEvidence: async (id: number) => {
    const res = await api.delete(`/evidence/${id}`);
    return res.data;
  }
};

export const assessmentService = {
  getAssessments: async () => {
    const res = await api.get('/assessment');
    return res.data;
  },
  submitAssessment: async (data: any) => {
    const res = await api.post('/assessment', data);
    return res.data;
  },
  updateAssessment: async (id: number, data: any) => {
    const res = await api.put(`/assessment/${id}`, data);
    return res.data;
  }
};

export const reportService = {
  getStudentReport: async (studentId: string) => {
    const res = await api.get(`/reports/student/${studentId}`);
    return res.data;
  },
  getCourseReport: async (courseId: number) => {
    const res = await api.get(`/reports/course/${courseId}`);
    return res.data;
  }
};

export default api;
