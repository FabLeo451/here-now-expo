import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { styles } from "@/app/Style";
import Map from '@/components/Map'

interface Hotspot {
  id: string;
  name: string;
  position: {
    latitude: number;
    longitude: number;
  };
  startTime?: string;
  endTime?: string;
}

// Tipizza meglio il tipo di WebSocket
export default function MapTab() {
	const socket = useRef<WebSocket | null>(null);

	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [gpsPermission, setGPSPermission] = useState<boolean>(false);
	const [message, setMessage] = useState<string>('');
	const [authToken, setAuthToken] = useState<string | null>('');
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [markerCoords, setMarkerCoords] = useState({
		latitude: 41.9028,
		longitude: 12.4964,
	});

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

			// Connect to WebSocket
			const wsUrl = `${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?token=${token}`;
			socket.current = new WebSocket(wsUrl);

			socket.current.onopen = () => {
				console.log('WebSocket connected');
				//sendPosition(currentLocation); 
			};

			socket.current.onmessage = (event) => {
				//console.log('[websocket-reply]', event.data);

				try {
					const message = JSON.parse(event.data);
					//console.log('[maps] message = ', message);
					const parsed: Hotspot[] = JSON.parse(message.Text);

					setHotspots(parsed);

					//console.log('[maps] parsed = ', parsed);

				} catch(e) {
					console.log('[websocket-reply]', e);
				}
			};

			socket.current.onerror = (error) => {
				console.error('WebSocket error:', error);
			};

			socket.current.onclose = () => {
				console.log('WebSocket disconnected');
			};


			console.log('[map] Starting main loop');

			// One and only subscription to watcher
			const subscription = await Location.watchPositionAsync({
				accuracy: Location.Accuracy.Highest,
				//timeInterval: process.env.EXPO_PUBLIC_POSITION_TIME_INTERVAL || 1000, // every 1 second
				distanceInterval: 1,
			}, (loc) => {
				setLocation(loc);
				setMarkerCoords({
					latitude: loc.coords.latitude,
					longitude: loc.coords.longitude,
				});

				// Send position to websocket server
				if (socket.current) {
					const payload = {
						appId: process.env.EXPO_PUBLIC_APP_ID,
						type: 'position',
						token,
						text: JSON.stringify({
							latitude: loc.coords.latitude,
							longitude: loc.coords.longitude
						}),
					};
					socket.current.send(JSON.stringify(payload));
				}
			});

			return () => {
				subscription.remove(); // pulizia
			};
		};

		init();

		return () => {
			// Cleanup
			if (socket.current) {
				socket.current.close();
			}

		};
	}, []);

	return (
		<View style={{ flex: 1 }}>

			<Text>Messaggio dal server: {message}</Text>
			{location && (
				<Text>
					Posizione attuale: {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
				</Text>
			)}

			<Map markerCoords={markerCoords} hotspots={hotspots}/>

		</View>
	);
}
