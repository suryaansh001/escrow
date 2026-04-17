import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStorage, dashboardApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  kyc_status: string;
  bank_verified: boolean;
  reliability_score: number;
  status: string;
  security_pin?: string; // Will be set to true/false indicating if PIN is set
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
  updateSecurityPin: (pin: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

// JWT decode function (without verification for client-side)
const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Decode basic info from token
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.id) {
        throw new Error('Invalid token');
      }

      // Fetch full user data from API
      const userData = await dashboardApi.getUserProfile();
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      // If token is invalid, remove it
      if (err instanceof Error && err.message.includes('Invalid token')) {
        tokenStorage.removeToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  const logout = () => {
    tokenStorage.removeToken();
    setUser(null);
    setError(null);
  };

  const updateSecurityPin = async (pin: string) => {
    // This will be implemented later
    console.log('Update security pin:', pin);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    logout,
    updateSecurityPin,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};