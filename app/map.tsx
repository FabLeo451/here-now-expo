import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import Map from '@/components/Map';

const MapTab: React.FC = () => {
    const [gpsPermission, setGPSPermission] = useState<boolean>(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    // Init
    useEffect(() => {
        const init = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            const granted = status === 'granted';
            setGPSPermission(granted);

            if (!granted) {
                console.warn('GPS permission not granted');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        };

        init();
    }, []);

	// Start/stop location tracking only when tab is focused
	useFocusEffect(
		useCallback(() => {

			let subscription: Location.LocationSubscription;

			const startTracking = async () => {
				subscription = await Location.watchPositionAsync({
					accuracy: Location.Accuracy.Highest,
					distanceInterval: 1,
				}, (loc) => {
                    //console.log('[MapTab]', loc);
					setLocation(loc);
				});
			};

			startTracking();

			return () => {
				if (subscription) {
					subscription.remove();
					console.log('[MapTab] GPS tracking stopped (tab unfocused)');
				}
			};
		}, [])
	);

    if (!gpsPermission) {
        return <Text>Permesso GPS necessario</Text>;
    }

    if (!location) {
        return <Text>Loading position...</Text>;
    }

    return (
        <View style={{ flex: 1 }}>
            <Map
                userCoords={location.coords}
                onSelect={(coords: any) => {
                    console.log('[MapTab] Selected:', coords);
                }}
            />
        </View>
    );
};

export default MapTab;