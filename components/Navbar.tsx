import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
//import { useRouter } from 'expo-router';
//import { Ionicons } from '@expo/vector-icons';

export default function Navbar(): JSX.Element {
  //const router = useRouter();

  return (
    <View style={styles.container}>
      {/*<TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>*/}

      <Text style={styles.title}>HereNow</Text>

      {/* Placeholder per allineare il titolo al centro */}
      <View style={{ width: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
});
