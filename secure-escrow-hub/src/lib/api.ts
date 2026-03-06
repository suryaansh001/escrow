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

// Escrow API calls
export const escrowApi = {
  async createEscrow(data: any) {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/escrow/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create escrow');
    }

    return response.json();
  },

  async getEscrows() {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/escrow`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch escrows');
    }

    return response.json();
  },

  async getEscrowById(id: string) {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/escrow/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch escrow');
    }

    return response.json();
  },

  async updateEscrowState(id: string, state: string) {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/escrow/${id}/state`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update escrow state');
    }

    return response.json();
  },
};

// Disputes API calls
export const disputeApi = {
  async createDispute(data: any) {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/disputes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create dispute');
    }

    return response.json();
  },

  async getDisputes() {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/disputes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch disputes');
    }

    return response.json();
  },

  async getDisputeById(id: string) {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/disputes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dispute');
    }

    return response.json();
  },

  async resolveDispute(id: string, resolved_in_favor_of: string, resolution_notes: string) {
    const token = tokenStorage.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/disputes/${id}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ resolved_in_favor_of, resolution_notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resolve dispute');
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

// Generic HTTP client
export const api = {
  async request(method: string, endpoint: string, data?: any): Promise<any> {
    const token = tokenStorage.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async get(endpoint: string, data?: any): Promise<any> {
    return this.request('GET', endpoint, data);
  },

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request('POST', endpoint, data);
  },

  async put(endpoint: string, data?: any): Promise<any> {
    return this.request('PUT', endpoint, data);
  },

  async patch(endpoint: string, data?: any): Promise<any> {
    return this.request('PATCH', endpoint, data);
  },

  async delete(endpoint: string, data?: any): Promise<any> {
    return this.request('DELETE', endpoint, data);
  },
};
