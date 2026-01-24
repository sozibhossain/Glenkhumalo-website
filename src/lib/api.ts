import axios from 'axios';
import { getSession } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  // @ts-ignore
  const token = session?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- Auth Types ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'creative'; // Assuming creative is the other role based on context
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  role: string;
  _id: string;
  user: UserProfile;
}

export interface UserProfile {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  locationGeo?: { type: string; coordinates: number[] };
  profileImage?: { public_id: string; url: string };
  phone?: string;
  address?: string;
  isEmailVerified?: boolean;
  bio?: string;
  // Add other fields as needed
}

// --- Website Content Types ---
export interface HeroContent {
  title: string;
  bodyText: string;
  image: { public_id: string; url: string };
}

export interface SectionContent {
  title: string;
  bodyText: string;
  image?: { public_id: string; url: string };
  images?: { public_id: string; url: string }[];
  heroImage?: { public_id: string; url: string };
}

export interface ContactContent {
  address: string;
  phoneNumber: string;
  email: string;
}

export interface WebsiteContent {
  hero: HeroContent;
  about: SectionContent;
  creative: SectionContent;
  client: SectionContent;
  contact: ContactContent;
  _id: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- API Functions ---

export const authApi = {
  login: async (data: LoginPayload) => {
    return api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
  },
  register: async (data: RegisterPayload) => {
    return api.post<ApiResponse<any>>('/auth/register', data);
  },
  forgetPassword: async (email: string) => {
    return api.post('/auth/forget', { email });
  },
  resetPassword: async (data: any) => {
    return api.post('/auth/reset-password', data);
  },
};

export const dataApi = {
  getWebsiteContent: async (): Promise<WebsiteContent> => {
    const response = await api.get<ApiResponse<WebsiteContent>>('/website');
    return response.data.data;
  },
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users');
    return response.data.data;
  },
  updateProfile: async (data: Partial<UserProfile> | FormData): Promise<UserProfile> => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const response = await api.put<ApiResponse<UserProfile>>(
      '/users/update-profile',
      data,
      isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    );
    return response.data.data;
  },
  changePassword: async (data: ChangePasswordPayload) => {
    return api.put<ApiResponse<null>>('/users/change-password', data);
  },
};

export default api;
