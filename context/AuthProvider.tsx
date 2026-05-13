import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AuthContext, User } from './AuthContext';
import Constants from 'expo-constants';
import * as Utils from '@/lib/utils';

const USER_KEY = 'herenow_user';
const TOKEN_KEY = 'herenow_token';
const REFRESH_TOKEN_KEY = 'herenow_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const restoreSession = async () => {
		
			console.log('[AuthProvider] Restoring session');
			
			try {
				const storedUser = await AsyncStorage.getItem(USER_KEY);
				let storedToken = await Utils.getToken(TOKEN_KEY);
				
				//console.log('[AuthProvider] storedUser = ',storedUser);
				//console.log('[AuthProvider] storedToken = ',storedToken);

				if (storedToken) {
					setToken(storedToken);
				}

				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}

				// Welcome
					const deviceType = await Utils.getDeviceType();
					const { agent, platform, model, deviceName } = Utils.getDeviceInfo();
					//console.log(Utils.getDeviceInfo());
					//console.log(deviceType);
					
					const headers = {
					  'Content-Type': 'application/json',
					};

					if (storedToken) {
					  headers['Authorization'] = `Bearer ${storedToken}`;
					}
					
					const res = await fetch(
						`${process.env.EXPO_PUBLIC_API_BASE_URL}/welcome`,
						{
							method: 'POST',
							headers,
							body: JSON.stringify({ agent, platform, model, deviceName, deviceType }),
						}
					);
					
					console.log(res);

					if (res.ok) {
						const data = await res.json();
						console.log('welcome: ',data);

						if (data.token) {
							await Utils.setToken(TOKEN_KEY, data.token);
							setToken(data.token);
							
							await Utils.setToken(REFRESH_TOKEN_KEY, data.refreshToken);
							
							var user = { name: data.name, isUser: false, isGuest: data.isGuest };
							setUser(user);
							await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
						}
					} else {
						switch(res.status) {
							case 401:
								console.log(res.statusText);
								logout();
								//router.replace('/')
								// To do: call /refresh
								break;
								
							default:
								console.log(res.statusText);
								break;
						}
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
		await Utils.setToken(TOKEN_KEY, token);
	};

	// Logout
	const logout = async () => {
		setUser(null);
		setToken(null);

		await AsyncStorage.removeItem(USER_KEY);
		await Utils.deleteToken(TOKEN_KEY);
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
