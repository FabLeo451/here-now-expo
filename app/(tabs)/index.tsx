import React, { useEffect, useState, useCallback } from 'react';
import {
	Alert,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { styles } from "@/Style";
import { Ionicons } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
import DropdownHotspot from '@/components/DropdownHotspot'
import { Hotspot } from '@/lib/hotspot'

const isTokenValid = async (token: string): Promise<boolean> => {

	try {
		const payloadBase64 = token.split('.')[1];
		const payloadJson = atob(payloadBase64);
		const payload = JSON.parse(payloadJson);

		if (!payload.exp) return true;

		const now = Math.floor(Date.now() / 1000); // current time in seconds
		return payload.exp > now;
	} catch (err) {
		console.error('Error decoding token JWT:', err);
		return false;
	}
};

const HomeTab: React.FC = () => {
	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [context, setContext] = useState(null);
	const [authToken, setAuthToken] = useState('');
	const [refreshing, setRefreshing] = useState(false);

	useFocusEffect(
		useCallback(() => {
			const checkToken = async () => {

				const token = await AsyncStorage.getItem('authToken');

				if (!token)
					return;

				console.log('[index] Checking token validity...')
				const valid = await isTokenValid(token);
				if (!valid) {
					console.log('[index] Invalid token')
					router.replace('/logout');
				}
			};
			checkToken();
		}, [])
	);

	useEffect(() => {
		const checkAuth = async () => {
			const token = await AsyncStorage.getItem('authToken');
			//console.log('[index] Token found: ', !!token);

			if (!token) {
				console.log('[index] Redirecting to login...');
				router.replace('/login');
			} else {

				setAuthToken(token);

				const contextStr = await AsyncStorage.getItem('context');
				const ctx = contextStr ? JSON.parse(contextStr) : {};
				setContext(ctx);

				//if (ctx.user.isAuthenticated)
				//	getMyHotspots(token);
			}
		};

		checkAuth();
	}, []);

	return (
		<View style={styles.containerList}>

		<Text>Hello, {context?.user.name}</Text>

		</View>
	);
};

export default HomeTab;
