import React, { useEffect, useState, useCallback } from 'react';
import {
	Text,
	View,
	StyleSheet,
	ActivityIndicator,
	Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { styles } from "@/Style";
import { Ionicons } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
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
	const [total, setTotal] = useState<number | null>(null);
	const [context, setContext] = useState(null);
	const [authToken, setAuthToken] = useState('');

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

				if (ctx.user.isAuthenticated)
					getMyHotspots(token);
			}
		};

		checkAuth();
	}, []);

	const getMyHotspots = async (token: string) => {

		console.log('[index] Getting hotspots...');

		try {
			setTotal(null);

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				console.log(response);
				throw new Error('Failed to fetch: ' + response.status + ' ' + response.statusText);
			}

			const hotspots: Hotspot[] = await response.json();

			//console.log('[index]', response);
			//console.log('[index]', hotspots);

			setTotal(hotspots ? hotspots.length : 0);

		} catch (error: any) {
			console.log('[getMyHotspots] ', error);
			//Alert.alert('Error getting my hotspots', error.message);
		} finally {
			//setTotal(null);
		}
	};

	return (
		<View style={styles.container}>

			<Text style={{ marginTop: 30, marginBottom: 50, textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>Hello, {context?.user.name}</Text>

			<View style={stylesTable.table}>
				<View style={stylesTable.row}>				
					<Text style={stylesTable.iconCell}><Ionicons name="radio-outline" size={18} color="blue" /></Text>
					<Text style={stylesTable.cell}>Total hotspots</Text>
					<Text style={stylesTable.cell}>{typeof total === 'number' ? (<Text>{total}</Text>) : (<ActivityIndicator size="small" color="#3B82F6" />)}</Text>
				</View>

				<View style={stylesTable.row}>
					<Text style={stylesTable.iconCell}><Ionicons name="power-outline" size={18} color="forestgreen" /></Text>
					<Text style={stylesTable.cell}>Active hotspots</Text>
					<Text style={stylesTable.cell}><ActivityIndicator size="small" color="#3B82F6" /></Text>
				</View>

				<View style={stylesTable.row}>
					<Text style={stylesTable.iconCell}><Ionicons name="power-outline" size={18} color="gray" /></Text>
					<Text style={stylesTable.cell}>Inactive hotspots</Text>
					<Text style={stylesTable.cell}><ActivityIndicator size="small" color="#3B82F6" /></Text>
				</View>
			</View>

			<View style={styles.footer}>
				<Text
					style={styles.link}
					onPress={() => Linking.openURL('https://www.ekhoes.com/')}
				>
					www.ekhoes.com
				</Text>
			</View>

		</View>
	);
};

const stylesTable = StyleSheet.create({
	table: {
		margin: 10,
	},
	row: {
		flexDirection: 'row',
	},
	iconCell: {
		padding: 10,
		// nessun flex → occupa solo lo spazio dell'icona
	},
	cell: {
		flex: 1,
		padding: 10,
		fontSize: 20
	},
});

export default HomeTab;
