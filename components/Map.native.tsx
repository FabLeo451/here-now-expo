import React, { useState, useEffect, useRef } from 'react';
import MapView, {
  Marker,
  MapPressEvent,
  Region,
} from 'react-native-maps';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Hotspot } from '@/lib/hotspot'

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

type Bounds = {
  northEast: { latitude: number; longitude: number };
  southWest: { latitude: number; longitude: number };
};

type Props = {
  userCoords: UserCoords | null;
  hotspots: Hotspot[];
  onSelect: (coords: Coords | null) => void;
  onBoundsChange?: (bounds: Bounds) => void;
};

type UserMarkerProps = {
  accuracy?: number;
  heading?: number;
};

export default function Map({
  userCoords,
  hotspots,
  onSelect,
  onBoundsChange,
}: Props) {
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    onSelect(coords);
  };

  const getBounds = (region: Region): Bounds => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

    return {
      northEast: {
        latitude: latitude + latitudeDelta / 2,
        longitude: longitude + longitudeDelta / 2,
      },
      southWest: {
        latitude: latitude - latitudeDelta / 2,
        longitude: longitude - longitudeDelta / 2,
      },
    };
  };

  const handleRegionChangeComplete = (
    region: Region,
    gesture?: { isGesture: boolean }
  ) => {
    if (!onBoundsChange) return;

    // opzionale: ignora cambi programmatici
    if (gesture && !gesture.isGesture) return;

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      onBoundsChange(getBounds(region));
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const UserMarker = ({ accuracy, heading = 0 }: UserMarkerProps) => {
    const color = accuracy && accuracy > 50 ? '#8e8e93' : '#007aff';
    const safeHeading = heading >= 0 ? heading : 0;

    const rotation = useRef(new Animated.Value(0)).current;
    const currentHeading = useRef(0);

    useEffect(() => {
      let newHeading = safeHeading;
      let prevHeading = currentHeading.current;

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
        <View
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 5,
          }}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M12 2 L18 20 L12 16 L6 20 Z" fill={color} />
          </Svg>
        </View>
      </Animated.View>
    );
  };

  const RadarMarker = () => {
    const scale1 = useRef(new Animated.Value(0)).current;
    const scale2 = useRef(new Animated.Value(0)).current;
    const scale3 = useRef(new Animated.Value(0)).current;

    const createPulse = (anim: any, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    useEffect(() => {
      createPulse(scale1, 0).start();
      createPulse(scale2, 600).start();
      createPulse(scale3, 1200).start();
    }, []);

    const renderWave = (anim: any) => {
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1.5],
      });

      const opacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
      });

      return (
        <Animated.View
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#4ade80',
            transform: [{ scale }],
            opacity,
          }}
        />
      );
    };

    return (
      <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
        {renderWave(scale1)}
        {renderWave(scale2)}
        {renderWave(scale3)}

        {/* centro */}
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'limegreen',
          }}
        />
      </View>
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
        onRegionChangeComplete={handleRegionChangeComplete}
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
          <Marker coordinate={selectedCoords} />
        )}

          // Hotspots
        {hotspots.map((hotspot: Hotspot) => (
          <Marker
            key={hotspot.id}
            coordinate={{
              latitude: hotspot.position.latitude,
              longitude: hotspot.position.longitude,
            }}
          >
            <RadarMarker />
          </Marker>
        ))}
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
