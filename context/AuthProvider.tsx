import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, User } from './AuthContext';

const USER_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Ripristino sessione all’avvio
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // 🔐 Login
  const login = async (user: User, token: string) => {
    setUser(user);
    setToken(token);

    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
      [TOKEN_KEY, token],
    ]);
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

