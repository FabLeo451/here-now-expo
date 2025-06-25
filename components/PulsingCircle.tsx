import React, { useEffect, useRef } from 'react';
import { Animated, View, Platform } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PulsingCircleProps = {
  center: { latitude: number; longitude: number };
  onPress?: () => void;
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

      <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} onPress={onPress}>
        {/* Transparent but visible View trasparente with clickable area */}
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 15,
            backgroundColor: 'rgba(0, 0, 0, 0.01)', // invisible but clickable
            //backgroundColor: 'red', // debug
          }}
        />
      </Marker>
    </>
  );
}
