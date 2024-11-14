export interface User {
  id: number;
  email: string;
}

export interface ShortLink {
  id: number;
  shortCode: string;
  originalUrl: string;
  userId: number;
  isActive: boolean;
  clicks: number;
  createdAt: string;
}

export interface ClickEvent {
  id: number;
  linkId: number;
  ipAddress: string;
  userAgent: string;
  referer: string;
  timestamp: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 

export interface CreateLinkResponse {
  id: number;
  shortCode: string;
  originalUrl: string;
  isActive: boolean;
  clicks: number;
  createdAt: string;
}

export interface ApiError {
  error: string;
}