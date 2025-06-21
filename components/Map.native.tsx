import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Callout, MapPressEvent } from 'react-native-maps';

// Tipizzazione delle coordinate (latitudine e longitudine)
type LatLng = {
  latitude: number;
  longitude: number;
};

// Props del componente
type MapProps = {
  markerCoords: LatLng;
};

export default function Map({ markerCoords }: MapProps) {
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;

  const LATITUDE_DELTA = 0.005;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  // Funzione per gestire il tocco sulla mappa
  const handleMapPress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    console.log('Mappa toccata in:', coords);
    alert(`Hai toccato: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
  };

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
        onPress={handleMapPress}
      >
        {/* Marker principale */}
        <Marker coordinate={markerCoords} title="Your position" />

        {/* Cerchio statico su Roma */}
        <Circle
          center={{ latitude: 41.9028, longitude: 12.4964 }}
          radius={10}
          strokeColor="#0000FF"
          fillColor="rgba(0,0,255,0.2)"
        />

        {/* Marker su Roma con Callout */}
        <Marker coordinate={{ latitude: 41.9028, longitude: 12.4964 }}>
          <View style={styles.markerLabel}>
            <Text style={styles.markerText}>Roma</Text>
          </View>
          <Callout>
            <View style={{ padding: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>Roma</Text>
              <Text>Capitale d'Italia</Text>
            </View>
          </Callout>
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
    flex: 1,
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
