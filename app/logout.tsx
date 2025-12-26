
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth'

export default function Logout() {
	const { logout } = useAuth();

	useEffect(() => {

		const logoutUser = async () => {

			const token = await AsyncStorage.getItem('authToken');

			try {

				console.log('[profile] logging out...');

				const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/logout`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token }),
				});

				console.log('[Logout] logging out...');

				/* Logout anyway
				if (!response.ok) {
					throw new Error('Error calling /logout');
				}
				*/

				await logout();

			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error';
				console.log('[Logout]', message);
				Alert.alert('Error:', message);
			}

			//await AsyncStorage.removeItem('authToken');

			router.replace('/login');
		}

		logoutUser();

	}, []);

	return null;
}
