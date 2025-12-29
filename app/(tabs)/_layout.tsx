import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Navbar from '@/components/Navbar';
import { useWebsocket } from "@/hooks/useWebsocket";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function ConnectionLost() {
  return (
    <View style={styles.container}>
      <Ionicons
        name="cloud-offline-outline"
        size={20}
        color="#b45309"
        style={styles.icon}
      />

      <Text style={styles.text}>
        Connection lost. Trying to reconnect…
      </Text>

      <ActivityIndicator size="small" color="#b45309" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed', // soft warning background
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: '#92400e',
    fontSize: 14,
  },
  spinner: {
    marginLeft: 8,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useWebsocket();

  return (
    <View style={{
      paddingTop: insets.top,
      paddingBottom: /*insets.bottom*/ 0,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      flex: 1,
      backgroundColor: '#f0f0f0',
    }}
    >
      <Navbar />
      {!isConnected && (<ConnectionLost />)}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          //headerShown: useClientOnlyValue(false, true),
          headerShown: false,
          tabBarStyle: {
            elevation: 0, // Android shadow
            shadowOpacity: 0, // iOS shadow
            borderTopWidth: 0, // iOS/web fallback
            backgroundColor: '#f0f0f0', // assicurati che non crei contrasto
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="hotspots"
          options={{
            title: 'Hotspots',
            tabBarIcon: ({ color }) => <TabBarIcon name="wifi" color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          }}
        />
        <Tabs.Screen
          name="hotspot/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}
