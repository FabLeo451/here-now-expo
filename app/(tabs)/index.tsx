import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditScreenInfo from '@/components/EditScreenInfo';
//import { Text, View } from '@/components/Themed';
import { Redirect, router } from 'expo-router';
import Navbar from '@/components/Navbar';

export default function HomeScreen() {

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');

      console.log('[index] Authenticated: ', !!token);
      

      if (!token) {
        console.log('[index] Redirecting to login...');
        router.replace("/login");
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <Navbar />
      <View style={styles.container}>
        <Text style={styles.title}>Tab One</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
