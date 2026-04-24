import React, { useState, useEffect } from 'react';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

type Coords = {
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number;
  longitude: number;
  onSelect: (coords: Coords | null) => void;
};

export default function Map({ latitude, longitude, onSelect }: Props) {
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);

  useEffect(() => {
    console.log('Map.native.tsx');
  });

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
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handlePress}
      >
        <Marker
          coordinate={{
            latitude: selectedCoords?.latitude ?? latitude,
            longitude: selectedCoords?.longitude ?? longitude,
          }}
        />
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