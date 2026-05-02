import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Coords = {
  latitude: number;
  longitude: number;
};

type UserCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
};

type Props = {
  userCoords: UserCoords | null;
  onSelect: (coords: Coords | null) => void;
};

export default function Map({ userCoords, onSelect }: Props) {
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);

  const handlePress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;

    setSelectedCoords(coords);
    onSelect(coords);
  };

  console.log('[Map.native]', userCoords);
  

const UserMarker = ({ accuracy, heading = 0 }: UserMarkerProps) => {
  const color = accuracy && accuracy > 50 ? '#8e8e93' : '#007aff';
  const safeHeading = heading >= 0 ? heading : 0;

  const rotation = useRef(new Animated.Value(0)).current;
  const currentHeading = useRef(0);

  useEffect(() => {
    let newHeading = safeHeading;
    let prevHeading = currentHeading.current;

    // 🔥 evita rotazioni lunghe (es. 350° → 10°)
    let diff = newHeading - prevHeading;
    if (diff > 180) newHeading -= 360;
    if (diff < -180) newHeading += 360;

    Animated.timing(rotation, {
      toValue: newHeading,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    currentHeading.current = newHeading;
  }, [safeHeading]);
 
   const rotateInterpolate = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={{
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: rotateInterpolate }],
      }}
    >

      {/* ombra + freccia */}
      <View
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },

          // Android shadow
          elevation: 5,
        }}
      >
		  <Svg width={24} height={24} viewBox="0 0 24 24">
		    <Path
		      d="M12 2 L18 20 L12 16 L6 20 Z"
		      fill={color}
		    />
		  </Svg>
      </View>
    </Animated.View>
  );
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

		{userCoords && (
		  <Marker coordinate={userCoords}>
			<UserMarker
			  accuracy={userCoords.accuracy}
			  heading={userCoords.heading}
			/>
		  </Marker>
		)}

        {selectedCoords && (
        <Marker
          coordinate={{
            latitude: selectedCoords.latitude,
            longitude: selectedCoords.longitude,
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
