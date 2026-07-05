export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  businessId: string;
  details?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
