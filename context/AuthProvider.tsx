import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AuthContext, User } from './AuthContext';
import Constants from 'expo-constants';
import * as Utils from '@/lib/utils';
import { welcome } from "../api/auth";

const USER_KEY = 'herenow_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const restoreSession = async () => {

			console.log('[AuthProvider] Restoring session');

			try {
				const storedUser = await AsyncStorage.getItem(USER_KEY);
				let storedToken = await Utils.getAccessToken();

				//console.log('[AuthProvider] storedUser = ',storedUser);
				//console.log('[AuthProvider] storedToken = ',storedToken);

				if (storedToken) {
					setToken(storedToken);
				}

				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}

				// Welcome
				try {
					const data = await welcome();

					console.log('data = ', data);

					await Utils.setAccessToken(data.token);
					setToken(data.token);

					if (data.refreshToken)
						await Utils.setRefreshToken(data.refreshToken);

					var user = { name: data.name, isUser: data.isUser, isGuest: data.isGuest };
					setUser(user);
					await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
				} catch (error) {
					console.log(error);
				}


			} catch (err) {
				console.error('[AuthProvider] Session restore error', err);
			} finally {
				setLoading(false);
			}
		};

		restoreSession();
	}, []);

	// Login
	const login = async (user: User, token: string) => {
		setUser(user);
		setToken(token);

		await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
		await Utils.setAccessToken(token);
	};

	// Logout
	const logout = async () => {
		setUser(null);
		setToken(null);

		await AsyncStorage.removeItem(USER_KEY);
		await Utils.deleteTokens();
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
