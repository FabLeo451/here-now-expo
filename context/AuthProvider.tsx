import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthContext, User } from './AuthContext';

const USER_KEY = 'herenow_user';
const TOKEN_KEY = 'herenow_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        // Token from SecureStore
        let storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          return;
        }

        // Guest session
        if (!storedToken) {
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE_URL}/session/guest`,
            { method: 'POST' }
          );

          const data = await res.json();
          storedToken = data.token;

          await SecureStore.setItemAsync(TOKEN_KEY, storedToken);
        }

        setToken(storedToken);
        setUser(null);
      } catch (err) {
        console.error('Session restore error', err);
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

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem(USER_KEY);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
