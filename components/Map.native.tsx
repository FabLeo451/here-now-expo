import React, { useState, useEffect } from 'react';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

type Coords = {
  latitude: number;
  longitude: number;
};

type Props = {
  userCoords: { latitude: number; longitude: number } | null;
  onSelect: (coords: Coords | null) => void;
};

export default function Map({ userCoords, onSelect }: Props) {
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);

  const handlePress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;

    setSelectedCoords(coords);
    onSelect(coords);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userCoords?.latitude || 0,
          longitude: userCoords?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handlePress}
      >

      <Marker coordinate={userCoords || { latitude: 0, longitude: 0 }}>
        <View
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* alone */}
          <View
            style={{
              position: 'absolute',
              width: 30,
              height: 30,
              borderRadius: 20,
              backgroundColor: 'rgba(0,122,255,0.2)',
            }}
          />

          {/* punto centrale */}
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#007AFF',
              borderWidth: 3,
              borderColor: 'white',
            }}
          />
        </View>
      </Marker>

        {selectedCoords && (
        <Marker
          coordinate={{
            latitude: selectedCoords?.latitude,
            longitude: selectedCoords?.longitude,
          }}
        />)}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});