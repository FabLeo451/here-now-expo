import React, { useEffect, useState, useCallback } from 'react';
import {
	Text,
	View,
	StyleSheet,
	ActivityIndicator,
	Linking,
	ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
import { Hotspot, isActive } from '@/lib/hotspot';

const isTokenValid = async (token: string): Promise<boolean> => {
	try {
		const payloadBase64 = token.split('.')[1];
		const payloadJson = atob(payloadBase64);
		const payload = JSON.parse(payloadJson);
		if (!payload.exp) return true;
		const now = Math.floor(Date.now() / 1000);
		return payload.exp > now;
	} catch (err) {
		console.error('Error decoding token JWT:', err);
		return false;
	}
};

const HomeTab: React.FC = () => {
	const [total, setTotal] = useState<number | null>(null);
	const [active, setActive] = useState<number | null>(null);
	const [inactive, setInactive] = useState<number | null>(null);
	const [context, setContext] = useState<any>(null);

	useFocusEffect(
		useCallback(() => {
			const checkToken = async () => {
				const token = await AsyncStorage.getItem('authToken');
				if (!token) return;
				const valid = await isTokenValid(token);
				if (!valid) router.replace('/logout');
			};
			checkToken();
		}, [])
	);

	useEffect(() => {
		const checkAuth = async () => {
			const token = await AsyncStorage.getItem('authToken');
			if (!token) {
				router.replace('/login');
			} else {
				const contextStr = await AsyncStorage.getItem('context');
				const ctx = contextStr ? JSON.parse(contextStr) : {};
				setContext(ctx);
				if (ctx.user?.isAuthenticated) getMyHotspots(token);
			}
		};
		checkAuth();
	}, []);

	const getMyHotspots = async (token: string) => {
		try {
			setTotal(null);
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});
			if (!response.ok) throw new Error('Failed to fetch');
			const hotspots: Hotspot[] = await response.json();

			let total = hotspots.length,
				nActive = 0,
				nInactive = 0;

			hotspots.forEach(h => (isActive(h) ? nActive++ : nInactive++));

			setTotal(total);
			setActive(nActive);
			setInactive(nInactive);
		} catch (error: any) {
			console.log('[getMyHotspots]', error);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.header}>Hello, {context?.user?.name || 'Utente'} 👋</Text>

			<Text style={styles.subtitle}>Here’s a summary of your hotspots</Text>

			<View style={styles.cardContainer}>
				<StatCard
					icon="radio-outline"
					color="#3B82F6"
					label="Total"
					value={total}
				/>
				<StatCard
					icon="power-outline"
					color="forestgreen"
					label="Active"
					value={active}
				/>
				<StatCard
					icon="power-outline"
					color="gray"
					label="Inactive"
					value={inactive}
				/>
			</View>

			<View style={styles.footer}>
				<Text
					style={styles.link}
					onPress={() => Linking.openURL('https://www.ekhoes.com/')}
				>
					www.ekhoes.com
				</Text>
			</View>
		</ScrollView>
	);
};

// 🔹 COMPONENTE CARD RIUTILIZZABILE
const StatCard = ({
	icon,
	label,
	value,
	color,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: number | null;
	color: string;
}) => (
	<View style={[styles.card, { borderLeftColor: color }]}>
		<View style={styles.cardHeader}>
			<Ionicons name={icon} size={22} color={color} />
			<Text style={styles.cardTitle}>{label}</Text>
		</View>
		{typeof value === 'number' ? (
			<Text style={styles.cardValue}>{value}</Text>
		) : (
			<ActivityIndicator size="small" color={color} />
		)}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: '#F8FAFC',
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 20,
	},
	header: {
		fontSize: 26,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 50,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#6B7280',
		marginBottom: 30,
		textAlign: 'center',
	},
	cardContainer: {
		width: '100%',
		gap: 16,
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 16,
		borderLeftWidth: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginLeft: 8,
		color: '#374151',
	},
	cardValue: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#111827',
		textAlign: 'right',
	},
	footer: {
		marginTop: 50,
	},
	link: {
		color: '#3B82F6',
		textDecorationLine: 'underline',
		fontSize: 16,
	},
});

export default HomeTab;
