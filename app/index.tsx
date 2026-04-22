import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View
} from 'react-native';
import * as Location from 'expo-location';
import LeafMap from '@/components/LeafMap.web';

const MapTab: React.FC = () => {
    const [gpsPermission, setGPSPermission] = useState<boolean>(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [markerCoords, setMarkerCoords] = useState(null);

    // Start once on mount: auth + WebSocket
    useEffect(() => {
        const init = async () => {

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

    return (
        <View>
            <LeafMap
                latitude={41.867356}
                longitude={12.468980}
                onSelect={(coords) => {
                    console.log('onSelect');
                }}
            />
        </View>
    );
};

export default MapTab;
