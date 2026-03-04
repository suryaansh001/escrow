const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  otp: string;
  name?: string;
  phone?: string;
}

export interface OtpRequest {
  email: string;
  phone_number?: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface DashboardUser {
  id: string;
  email: string;
  full_name: string;
  kyc_status: string;
  bank_verified: boolean;
  reliability_score: number;
  status: string;
}

export interface DashboardMetrics {
  totalTransactions: number;
  activeEscrows: number;
  walletBalance: number;
  riskScore: number;
}

export interface DashboardRiskProfile {
  score: number;
  level: string;
  description: string;
}

export interface DashboardTransaction {
  id: string;
  counterparty: string;
  amount: number;
  state: string;
  risk: string;
  createdAt: string;
}

export interface DashboardData {
  user: DashboardUser;
  metrics: DashboardMetrics;
  riskProfile: DashboardRiskProfile;
  recentTransactions: DashboardTransaction[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
  details?: string;
}

// Auth API calls
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        otp: data.otp,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  async requestOtp(data: OtpRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request OTP');
    }

    return response.json();
  },
};

// Dashboard API calls
export const dashboardApi = {
  async getDashboardData(): Promise<DashboardResponse> {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard data');
    }

    return response.json();
  },
};

// Token management
export const tokenStorage = {
  setToken(token: string) {
    localStorage.setItem('authToken', token);
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  removeToken() {
    localStorage.removeItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
