import { createContext } from 'react';

export type User = {
  id: string;
  name: string;
  isGuest: boolean;
  isAuthenticated: boolean;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

