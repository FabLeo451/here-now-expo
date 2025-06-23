import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Callout, MapPressEvent } from 'react-native-maps';
import PulsingCircle from '@/components/PulsingCircle'

// Tipizzazione delle coordinate (latitudine e longitudine)
type LatLng = {
  latitude: number;
  longitude: number;
};

type Hotspot = {
  id: string;
  name: string;
  position: LatLng;
  startTime?: string;
  endTime?: string;
}
/*
function PulsingCircle({ center }: { center: { latitude: number; longitude: number } }) {
  const [radius, setRadius] = useState(20);
  const [growing, setGrowing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadius(prev => {
        if (prev >= 40) {
          setGrowing(false);
          return prev - 2;
        } else if (prev <= 10) {
          setGrowing(true);
          return prev + 2;
        } else {
          return growing ? prev + 2 : prev - 2;
        }
      });
    }, 20); // ogni 100ms

    return () => clearInterval(interval);
  }, [growing]);

  return (
    <Circle
      center={center}
      radius={radius}
      strokeColor="#00FF00"
      fillColor="rgba(0,255,0,0.2)"
    />
  );
}
*/
// Props del componente
type MapProps = {
  markerCoords: LatLng;
  hotspots: Hotspot[];
};

export default function Map({ markerCoords, hotspots }: MapProps) {
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;

  const LATITUDE_DELTA = 0.005;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  //console.log("hotspots = ", hotspots)

  return (
    <View style={styles.mapContainer}>
      <MapView
        provider="google"
        style={styles.map}
        initialRegion={{
          latitude: markerCoords.latitude,
          longitude: markerCoords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        {/* Marker principale */}
        <Marker coordinate={markerCoords} title="Your position" />

        {hotspots && hotspots.length > 0 && (
          hotspots.map((h) => (
            <View key={h.id}>
              <PulsingCircle center={{ latitude: h.position.latitude, longitude: h.position.longitude }} />

              {<Marker coordinate={{ latitude: h.position.latitude, longitude: h.position.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={{
                  backgroundColor: 'yellow',
                  padding: 10,
                  width: 220, // anziché maxWidth
                  alignItems: 'center',
                }}>
                  <Text numberOfLines={2} style={{ fontSize: 12, color: 'black', textAlign: 'center' }}>
                    Testo che non viene tagliato
                  </Text>
                </View>
              </Marker>}
            </View>
          ))
        )}


        <Marker coordinate={{ latitude: 41.8678328, longitude: 12.468 }} anchor={{ x: 0.5, y: 1 }}>
          <View style={{ backgroundColor: 'yellow', padding: 10, maxWidth: 250 }}>
            <Text style={{ fontSize: 14, color: 'black', flexShrink: 1 }}>Testo che non deve tagliarsi</Text>
          </View>
        </Marker>

      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  map: {

    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  markerLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  markerText: {
    fontWeight: 'bold',
    color: 'black',
  },
});
