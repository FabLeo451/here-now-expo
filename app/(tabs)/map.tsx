import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import Map from '@/components/Map';
import { Hotspot } from '@/lib/hotspot'

export default function MapTab() {
	const socket = useRef<WebSocket | null>(null);

	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [gpsPermission, setGPSPermission] = useState<boolean>(false);
	const [authToken, setAuthToken] = useState<string | null>('');
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [markerCoords, setMarkerCoords] = useState(null);

	// Start once on mount: auth + WebSocket
	useEffect(() => {
		const init = async () => {
			const token = await AsyncStorage.getItem('authToken');

			if (!token) {
				console.log('[MapTab] Redirecting to login...');
				router.replace('/login');
				return;
			}

			setAuthToken(token);

			// Request GPS permissions
			const { status } = await Location.requestForegroundPermissionsAsync();
			const granted = status === 'granted';
			setGPSPermission(granted);

			if (!granted) {
				console.warn('GPS permission not granted');
				return;
			}

			// Get current position
			const currentLocation = await Location.getCurrentPositionAsync({});
			setLocation(currentLocation);
			setMarkerCoords({
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude,
			});
		};

		init();

		return () => {
		};
	}, []);

	// Start/stop location tracking only when tab is focused
	useFocusEffect(
		useCallback(() => {
			if (!authToken) {
				return;
			}

			let subscription: Location.LocationSubscription;

			const startTracking = async () => {
				subscription = await Location.watchPositionAsync({
					accuracy: Location.Accuracy.Highest,
					distanceInterval: 1,
				}, (loc) => {
					setLocation(loc);
					setMarkerCoords({
						latitude: loc.coords.latitude,
						longitude: loc.coords.longitude,
					});

					sendUserPosition(loc.coords.latitude, loc.coords.longitude);
				});
			};

			const connectWebsocket = async () => {

				const wsUrl = `${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?token=${authToken}`;
				socket.current = new WebSocket(wsUrl);

				socket.current.onopen = () => {
					console.log('WebSocket connected');

					//if (currentLocation)
					//	sendUserPosition(currentLocation.coords.latitude, currentLocation.coords.longitude);

					startTracking();
				};

				socket.current.onmessage = (event) => {
					try {
						const message = JSON.parse(event.data);
						const parsed: Hotspot[] = JSON.parse(message.Text);
						setHotspots(parsed);
					} catch (e) {
						console.log('[websocket-reply]', e);
					}
				};

				socket.current.onerror = (error) => {
					console.error('WebSocket error:', error);
					//Alert.alert('Error', "Server disconnected:\n" + error);
				};

				socket.current.onclose = () => {
					console.log('WebSocket disconnected');

				};

			}

			connectWebsocket();

			return () => {
				if (subscription) {
					subscription.remove();
					console.log('[MapTab] GPS tracking stopped (tab unfocused)');
				}

				if (socket.current) {
					socket.current.close();
				}
			};
		}, [authToken])
	);

	function sendUserPosition(latitude: number, longitude: number) {
		if (socket.current && socket.current.readyState === WebSocket.OPEN) {
			const payload = {
				appId: process.env.EXPO_PUBLIC_APP_ID,
				type: 'position',
				text: JSON.stringify({
					latitude: latitude,
					longitude: longitude
				}),
			};
			socket.current.send(JSON.stringify(payload));
		}
	}

	return (
		<View style={{ flex: 1 }}>
			{markerCoords && (<Map markerCoords={markerCoords} hotspots={hotspots} />)}
		</View>
	);
}
