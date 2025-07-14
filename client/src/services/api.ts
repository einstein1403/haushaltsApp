import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  name: string;
  email: string;
  points: number;
  role: 'admin' | 'user';
  is_approved: boolean;
  created_at?: string;
  approved_at?: string;
  approved_by?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  points: number;
  created_by: number;
  assigned_to: number;
  completed: boolean;
  completed_by: number | null;
  completed_at: string | null;
  created_at: string;
  created_by_name: string;
  assigned_to_name: string;
  completed_by_name: string | null;
  is_recurring?: boolean;
  recurrence_type?: string;
  recurrence_value?: number;
  parent_task_id?: number;
}

export interface RecurringTask {
  id: number;
  title: string;
  description: string;
  points: number;
  created_by: number;
  assigned_to: number;
  recurrence_type: string;
  recurrence_value: number;
  is_active: boolean;
  created_at: string;
  last_generated: string | null;
  created_by_name: string;
  assigned_to_name: string;
}

export interface Stats {
  name: string;
  weekly_points?: number;
  monthly_points?: number;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },
};

export const userAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  resetScores: async () => {
    const response = await api.post('/users/reset-scores');
    return response.data;
  },
};

export interface TaskSuggestion {
  title: string;
  description: string;
  points: number;
  usage_count: number;
  last_used: string;
}

export const taskAPI = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },
  createTask: async (task: { 
    title: string; 
    description: string; 
    points: number; 
    assigned_to: number;
    is_recurring?: boolean;
    recurrence_type?: string;
    recurrence_value?: number;
  }) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  completeTask: async (taskId: number, completedBy: number) => {
    const response = await api.patch(`/tasks/${taskId}/complete`, { completed_by: completedBy });
    return response.data;
  },
  getTaskSuggestions: async (query: string): Promise<TaskSuggestion[]> => {
    const response = await api.get(`/task-suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export const recurringTaskAPI = {
  getRecurringTasks: async (): Promise<RecurringTask[]> => {
    const response = await api.get('/recurring-tasks');
    return response.data;
  },
  toggleRecurringTask: async (taskId: number) => {
    const response = await api.patch(`/recurring-tasks/${taskId}/toggle`);
    return response.data;
  },
};

export const statsAPI = {
  getWeeklyStats: async (): Promise<Stats[]> => {
    const response = await api.get('/stats/weekly');
    return response.data;
  },
  getMonthlyStats: async (): Promise<Stats[]> => {
    const response = await api.get('/stats/monthly');
    return response.data;
  },
};