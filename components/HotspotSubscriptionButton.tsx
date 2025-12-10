import React, { useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  hotspotId: string;                    // required
  initialSubscribed?: boolean;          // optional default false
  onChange?: (value: boolean) => void;  // optional callback
};

export const HotspotSubscriptionButton: React.FC<Props> = ({
  hotspotId,
  initialSubscribed = false,
  onChange,
}) => {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (subscribe: boolean) => {
    if (loading) return;

    //console.log('[SubscriptionButton] subscribe=', subscribe);
    setLoading(true);

    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${hotspotId}/subscription`,
        {
          method: subscribe ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error ' + response.status + ' ' + response.statusText);
      }

      setSubscribed(subscribe);
      onChange?.(subscribe);

    } catch (error: any) {
      console.log('[SubscriptionButton] Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handleSubscription(!subscribed)}
      disabled={loading}
    >
      {subscribed ? (
        <Ionicons name="notifications" size={25} color="royalblue" />
      ) : (
        <Ionicons name="notifications-outline" size={25} color="lightgray" />
      )}
    </TouchableOpacity>
  );
};
