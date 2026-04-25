import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
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

	const handleCreate = async () => {
		//router.replace('/create-hotspot');
		/*router.push({
			pathname: '/create-hotspot',
			params: { action: 'create' }
		});*/
        console.log('[MapTab] Add hotspot');
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
                        console.log('[MapTab] Selected:', coords);
                    }}
                />
            </View>

            {/* FAB ADD */}
            <Pressable
                onPress={handleCreate}
                style={({ pressed }) => [
                    styles.fab,
                    pressed && Platform.OS !== 'web' && { opacity: 0.7 },
                ]}
            >
                <Ionicons name="add" size={25} color="#fff" />
            </Pressable>

        </View>
    );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
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