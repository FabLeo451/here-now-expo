import { createContext } from 'react';

export type User = {
  name: string;
  isUser: boolean;
  isGuest: boolean;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

