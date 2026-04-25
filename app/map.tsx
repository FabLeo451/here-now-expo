import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import Map from '@/components/Map';

const MapTab: React.FC = () => {
    const [gpsPermission, setGPSPermission] = useState<boolean>(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

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