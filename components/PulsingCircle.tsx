import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Circle } from 'react-native-maps';

export default function PulsingCircle({ center }: { center: { latitude: number; longitude: number } }) {
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
    <AnimatedCircle
      center={center}
      radius={radius}
      strokeColor="#00FF00"
      fillColor="rgba(0,255,0,0.2)"
    />
  );
}

// Wrapper per supportare Animated con MapView.Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);