import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import ModalHotspot from '@/components/ModalHotspot'
import { Hotspot } from '@/lib/hotspot'

type LatLng = {
	latitude: number;
	longitude: number;
};

type MapProps = {
	markerCoords: LatLng;
	_hotspots: Hotspot[];
	onRegionChangeCompleteBounds?: (bounds: {
		northEast: LatLng;
		southWest: LatLng;
	}) => void;
};

export default function Map({ markerCoords, _hotspots, onRegionChangeCompleteBounds }: MapProps) {
	const [modalVisible, setModalVisible] = useState<{ visible: boolean; id: string }>({
		visible: false,
		id: '',
	});

	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [context, setContext] = useState(null);
	const [authToken, setAuthToken] = useState('');
	const [refreshing, setRefreshing] = useState(false);

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

		try {
			setRefreshing(true);
			setHotspots([]);

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				console.log(response)
				throw new Error('Failed to fetch: ' + response.status + ' ' + response.statusText);
			}

			const data: Hotspot[] = await response.json();
			setHotspots(data);
			//Alert.alert('', JSON.stringify(data))
		} catch (error: any) {
			console.log('[getMyHotspots] ', error);
			//Alert.alert('Error getting my hotspots', error.message);
		} finally {
			setRefreshing(false);
		}
	};
	return (
		<View>

			<ModalHotspot
				visible={modalVisible.visible}
				id={modalVisible.id}
				onClose={() => {
					setModalVisible({ visible: false, id: 'dummyId' });
				}}
			/>
						
			<Text>Hotspots</Text>
			{hotspots && (
				hotspots.map((h) => {
					return (
						<TouchableOpacity key={h.id} onPress={() => setModalVisible({ visible: true, id: h.id })}>
							<View>
								<Text>{h.name}</Text>
							</View>
						</TouchableOpacity>
					);
				})

			)}
		</View>
	);
}
