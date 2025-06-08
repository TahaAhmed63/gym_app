import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  gym_id: string;
  gym_name?: string;
  country?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    session: {
      access_token: string;
      expires_at: number;
    };
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    gym_id: string;
  };
}

interface StaffMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  gym_id: string;
  created_at: string;
  updated_at: string;
}

let currentUser: User | null = null;

export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`https://gymbackend-nfa0.onrender.com/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (data.success && data.data) {
      currentUser = data.data.user;
      // Store the access token and user data in AsyncStorage
      await AsyncStorage.setItem('access_token', data.data.session.access_token);
      await AsyncStorage.setItem('token_expires_at', data.data.session.expires_at.toString());
      await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
      
      // Set up token expiration check
      const expiresAt = data.data.session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Clear token and user data when it expires
      setTimeout(async () => {
        await AsyncStorage.multiRemove(['access_token', 'token_expires_at', 'user_data']);
        currentUser = null;
      }, timeUntilExpiry);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function initiateRegistration(
  name: string,
  email: string,
  phone: string,
  password: string,
  gymName: string,
  country: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://gymbackend-nfa0.onrender.com/api/auth/register/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        email, 
        phone, 
        password,
        gymName,
        country
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Registration initiation error:', error);
    return false;
  }
}

export async function verifyAndCompleteRegistration(
  email: string,
  otp: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://gymbackend-nfa0.onrender.com/api/auth/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Registration verification error:', error);
    return false;
  }
}

export async function resetPassword(email: string): Promise<boolean> {
  try {
    const response = await fetch(`https://gymbackend-nfa0.onrender.com/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Password reset error:', error);
    return false;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // First try to get from memory
    if (currentUser) return currentUser;

    // Then try to get from storage
    const userData = await AsyncStorage.getItem('user_data');
    if (userData) {
      currentUser = JSON.parse(userData);
      return currentUser;
    }

    // Finally, try to fetch from server
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return null;

    const response = await fetch('https://gymbackend-nfa0.onrender.com/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      currentUser = data.data;
      await AsyncStorage.setItem('user_data', JSON.stringify(data.data));
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      await fetch('https://gymbackend-nfa0.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.multiRemove(['access_token', 'token_expires_at', 'user_data']);
    currentUser = null;
  }
}

export type { User, StaffMember };