import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

// Creiamo un Circle animato
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PulsingCircleProps = {
  center: { latitude: number; longitude: number };
  onPress?: () => void; // handler opzionale per il tocco
};

export default function PulsingCircle({ center, onPress }: PulsingCircleProps) {
  const radius = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(radius, {
          toValue: 40,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(radius, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [radius]);

  return (
    <>
      <AnimatedCircle
        center={center}
        radius={radius}
        strokeColor="#00FF00"
        fillColor="rgba(0,255,0,0.2)"
      />
      <Marker
        coordinate={center}
        onPress={onPress}
        opacity={0} // invisibile ma intercetta i tocchi
        zIndex={1}  // opzionale: garantisce che sia "cliccabile" sopra il Circle
      />
    </>
  );
}
