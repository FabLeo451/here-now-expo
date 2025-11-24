import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import Map from '@/components/Map';
import type { MapView } from 'react-native-maps';
import { Hotspot } from '@/lib/hotspot'


type LatLng = {
	latitude: number;
	longitude: number;
};

type Boundaries = {
	northEast: LatLng;
	southWest: LatLng;
};

type Params = {
  hotspotId?: string;
  targetLatitude?: string;
  targetLongitude?: string;
};

export default function MapTab() {

	const mapRef = useRef<MapView>(null);

	let { hotspotId, targetLatitude, targetLongitude } = useLocalSearchParams<Params>();

	const socket = useRef<WebSocket | null>(null);

	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [gpsPermission, setGPSPermission] = useState<boolean>(false);
	const [authToken, setAuthToken] = useState<string | null>('');
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [targetCoords, setTargetCoords] = useState(null);
	const [markerCoords, setMarkerCoords] = useState(null);
	const [mapReady, setMapReady] = useState<boolean>(false);

	useFocusEffect(
		useCallback(() => {

			const updateLatLong = () => {

				console.log('[map] targetLatitude  = ', targetLatitude);
				console.log('[map] targetLongitude = ', targetLongitude);
				
				if (targetLatitude && targetLongitude) {
					setTargetCoords({
						latitude: parseFloat(targetLatitude),
						longitude: parseFloat(targetLongitude),
					});
				}
			};

			updateLatLong();

			// optional cleanup function
			return () => { };

		}, [targetLatitude, targetLongitude])
	);

	useEffect(() => {
		if (mapReady && targetCoords && mapRef.current) {
			console.log('[map] Animating to target coordinates...');
			mapRef.current.animateToRegion(
				{
					latitude: targetCoords.latitude,
					longitude: targetCoords.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				},
				1000 // duration in ms
			);
			setTargetCoords(null);
			targetLatitude = "";
			targetLongitude = "";
		}
	}, [mapReady, targetCoords]);

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

					// Hotspots updated by boundaries, not user position
					//sendUserPosition(loc.coords.latitude, loc.coords.longitude);
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
						let parsed: Hotspot[] = JSON.parse(message.Text);

						//console.log('[map] message.Text =', message.Text);

						if (!parsed)
							parsed = [];

						console.log('[map] Updating hotspots...', parsed.length);
						setHotspots(parsed);
					} catch (e) {
						console.log('[map][onmessage]', e);
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
/*
	function sendUserPosition(latitude: number, longitude: number) {
		if (socket.current && socket.current.readyState === WebSocket.OPEN) {
			const payload = {
				appId: process.env.EXPO_PUBLIC_APP_ID,
				type: 'hotspots',
				subtype: 'byPosition',
				text: JSON.stringify({
					latitude: latitude,
					longitude: longitude
				}),
			};
			socket.current.send(JSON.stringify(payload));
		}
	}
*/
	function sendMapBoundaries(boundaries: Boundaries) {
		if (socket.current && socket.current.readyState === WebSocket.OPEN) {

			console.log('[map] Querying for hotspots by boundaries...');

			const payload = {
				appId: process.env.EXPO_PUBLIC_APP_ID,
				type: 'hotspots',
				subtype: 'byBoundaries',
				text: JSON.stringify({
					northEast: { latitude: boundaries.northEast.latitude, longitude: boundaries.northEast.longitude },
					southWest: { latitude: boundaries.southWest.latitude, longitude: boundaries.southWest.longitude }
				}),
			};
			socket.current.send(JSON.stringify(payload));
		}
	}

	return (
		<View style={{ flex: 1 }}>
			{markerCoords ? (
				<Map
					mapRef={mapRef}
					initialCoords={targetCoords ? targetCoords : markerCoords} 
					markerCoords={markerCoords} 
					hotspots={hotspots}
					onMapReady= {() => {
						console.log('[map] Map ready');
						setMapReady(true);
					}}
					onRegionChangeCompleteBounds={(boundaries: Boundaries) => {
						//console.log("Visible map:", boundaries);
						sendMapBoundaries(boundaries);
					}}
				/>
			) : (
				<View style={{ margin: 10 }}>
					<Text>Loading map...</Text>
				</View>
			)}
		</View>
	);
}
