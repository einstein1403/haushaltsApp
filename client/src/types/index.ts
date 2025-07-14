// Import types first
import type { User, Task, RecurringTask, Stats, TaskSuggestion } from '../services/api';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Auth types
export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse extends LoginResponse {}

// Component Props types
export interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

export interface PendingApprovalProps {
  user: User;
  onLogout: () => void;
}

export interface AdminUserManagementProps {
  token: string;
}

export interface CreateTaskProps {}

export interface TaskListProps {}

export interface DashboardProps {}

export interface StatisticsProps {}

export interface RecurringTasksProps {}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface CreateTaskFormData {
  title: string;
  description: string;
  points: number;
  assigned_to: number;
  is_recurring: boolean;
  recurrence_type?: 'days' | 'weeks' | 'months';
  recurrence_value?: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: ValidationError[];
}

// Re-export for convenience
export type { User, Task, RecurringTask, Stats, TaskSuggestion };

