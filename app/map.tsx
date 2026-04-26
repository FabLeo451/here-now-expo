import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Map from '@/components/Map';
import { useWebsocket } from "@/hooks/useWebsocket";

const MapTab: React.FC = () => {
    const [gpsPermission, setGPSPermission] = useState<boolean>(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const { isConnected, sendMessage, callback } = useWebsocket();

    // Init
    useEffect(() => {
        const init = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            const granted = status === 'granted';
            setGPSPermission(granted);

            if (granted) {
                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
            }
        };

        init();
    }, []);

    // Start/stop location tracking only when tab is focused
    useFocusEffect(
        useCallback(() => {

            let subscription: Location.LocationSubscription | null = null;

            const startTracking = async () => {
                subscription = await Location.watchPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                    distanceInterval: 1,
                }, (loc) => {
                    console.log('[map]', loc);
                    setLocation(loc);
                });
            };

            startTracking();

            return () => {
                if (subscription) {
                    try {
                        subscription.remove?.();
                    } catch (e) {
                        console.log('Subscription cleanup failed (ignored)');
                    }

                    subscription = null;
                }
            };
        }, [])
	);
	
	const onMessage = useCallback((message) => {
		console.log('[map] onMessage', message);
		/*
		if (message.Type === "map") {
			let str = decodeBase64(message.Payload);
			let parsed: Hotspot[] = JSON.parse(str);

			//console.log('[map] decoded payload =', str);

			if (!parsed)
				parsed = [];

			console.log('[map] Updating hotspots...', parsed.length);
			setHotspots(parsed);
		}
		*/
	}, []);
	
	const handleCreate = async () => {
        console.log('[map] Add hotspot');
		//router.replace('/create-hotspot');

        type Params = {
            action: string;
            latIn: number | null;
            longIn: number | null;
        };

        const params: Params = {
            action: 'create',
            latIn: null,
            longIn: null
        };

        if (selectedCoords) {
            params.latIn = selectedCoords.latitude
            params.longIn = selectedCoords.longitude
        }

		router.push({
			pathname: '/edit-hotspot',
			params: params
		});
	}

    if (!gpsPermission) {
        return <Text>GPS needed, please enable.</Text>;
    }

    if (!location) {
        return <Text>Loading position...</Text>;
    }

    return (
        <View style={{ flex: 1 }}>

            {/* MAP */}
            <View style={{ flex: 1 }}>
                <Map
                    userCoords={location ? location.coords : null}
                    onSelect={(coords: any) => {
                        console.log('[map] Selected:', coords);
                        setSelectedCoords(coords);
                    }}
                />
            </View>

            {/* FAB ADD */}
            {selectedCoords && (
                <Pressable
                    onPress={handleCreate}
                    style={({ pressed }) => [
                        styles.fab,
                        pressed && Platform.OS !== 'web' && { opacity: 0.7 },
                    ]}
                >
                    <Ionicons name="add" size={25} color="#fff" />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',

    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // shadow Android
    elevation: 5,

    // web shadow (react-native-web)
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
      cursor: 'pointer',
    }),
  },
});

export default MapTab;
