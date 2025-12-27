import React, { useEffect, useState, useCallback } from 'react';
import {
	Text,
	View,
	StyleSheet,
	ActivityIndicator,
	Linking,
	ScrollView,
	TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
import { Hotspot, isActive, getMyHotspots, getMyHSubscriptionsCount } from '@/lib/hotspot'
import { useAuth } from '@/hooks/useAuth';

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
	const [total, setTotal] = useState<number | null>(0);
	const [active, setActive] = useState<number | null>(0);
	const [inactive, setInactive] = useState<number | null>(0);
	const [subs, setSubs] = useState<number | null>(0);
	//const [context, setContext] = useState<any>(null);
	const { user, token } = useAuth();

	useFocusEffect(

		useCallback(() => {
			let hasFocus = true;

			const checkAuth = async () => {

				console.log('[index] Home page focused. Checking authorization and refreshing data...');

				if (!token) {
					router.replace('/login');
					return;
				}

				// Check token validity
				const valid = await isTokenValid(token);
				if (!valid) {
					router.replace('/logout');
					return;
				}

				if (user?.isAuthenticated) {
					try {
						const hotspots = await getMyHotspots(token);

						setTotal(null);
						const subsCount = await getMyHSubscriptionsCount(token);

						if (hasFocus) {
							let total = hotspots ? hotspots.length : 0,
								nActive = 0,
								nInactive = 0;

							if (total > 0)
								hotspots.forEach(h => (isActive(h) ? nActive++ : nInactive++));

							setTotal(total);
							setActive(nActive);
							setInactive(nInactive);

							setSubs(subsCount);
						}
					} catch (error) {
						console.error('[HomeTab]', error);
					}
				}
			};

			checkAuth();
			return () => {
				hasFocus = false;
			};

		}, [token, user])
	);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.header}>Hello, {user?.name || 'Utente'} 👋</Text>

			<Text style={styles.subtitle}>Here’s your dashboard</Text>

			<View style={styles.cardContainer}>
				<StatCard
					icon="radio-outline"
					color="#3B82F6"
					label="Total hotspots"
					value={total}
					onPress={() => router.replace('/hotspots')}
				/>
				<StatCard
					icon="power-outline"
					color="forestgreen"
					label="Active hotspots"
					value={active}
					onPress={() => router.replace('/hotspots?filter=active')}
				/>
				<StatCard
					icon="power-outline"
					color="silver"
					label="Inactive hotspots"
					value={inactive}
					onPress={() => router.replace('/hotspots?filter=inactive')}
				/>
				<StatCard
					icon="notifications"
					color="orange"
					label="Subscriptions"
					value={subs}
					onPress={() => console.log('Go to subscriptions')}
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

const StatCard = ({
	icon,
	label,
	value,
	color,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: number | null;
	color: string;
	onPress?: () => void;
}) => (
	<TouchableOpacity
		activeOpacity={0.7}
		onPress={onPress}
		style={[styles.card, { borderLeftColor: color }]}
	>
		<View style={styles.cardHeader}>
			<Ionicons name={icon} size={22} color={color} />
			<Text style={styles.cardTitle}>{label}</Text>
		</View>

		<View style={styles.cardValueContainer}>
			{typeof value === 'number' ? (
				<Text style={[styles.cardValue, { color: color }]}>{value}</Text>
			) : (
				<ActivityIndicator size="small" color={color} />
			)}
		</View>
	</TouchableOpacity>
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
		marginBottom: 40,
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
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 16,
	},
	card: {
		width: '45%',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 8,
		borderLeftWidth: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	cardTitle: {
		fontSize: 13,
		fontWeight: '600',
		marginLeft: 8,
		color: '#374151',
	},
	cardValue: {
		fontSize: 40,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	cardValueContainer: {
		marginTop: 0,
		alignItems: 'center', // centra orizzontalmente
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
