import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthContext, User } from './AuthContext';
import Constants from 'expo-constants';
import * as Utils from '@/lib/utils';

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

				// Get token
				let storedToken = await Utils.getToken(TOKEN_KEY);

				if (storedUser && storedToken) {
					setUser(JSON.parse(storedUser));
					Utils.setToken(TOKEN_KEY, storedToken);
					return;
				}

				// Create guest session
				if (!storedToken) {
					const deviceType = await Utils.getDeviceType();
					const { agent, platform, model, deviceName } = Utils.getDeviceInfo();
					//console.log(Utils.getDeviceInfo());
					//console.log(deviceType);

					const res = await fetch(
						`${process.env.EXPO_PUBLIC_API_BASE_URL}/session/guest`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ agent, platform, model, deviceName, deviceType }),
						}
					);

					if (res.ok) {
						const data = await res.json();
						storedToken = data.token;

						if (storedToken) {
							await SecureStore.setItemAsync(TOKEN_KEY, storedToken);
							setToken(storedToken);
						}

						setUser(null);
					} else {
						console.log('Unable to create guest session');
					}
				}

			} catch (err) {
				console.error('Session restore error', err);
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
		await SecureStore.setItemAsync(TOKEN_KEY, token);
	};

	// Logout
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
