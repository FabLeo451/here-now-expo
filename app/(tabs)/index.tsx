import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { styles } from "@/Style";
import { Ionicons } from '@expo/vector-icons';
import { Hotspot } from '@/lib/hotspot'

const HomeTab: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [context, setContext] = useState({ user: { name: '' } });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      //console.log('[index] Token found: ', !!token);

      if (!token) {
        console.log('[index] Redirecting to login...');
        router.replace('/login');
      } else {

        const contextStr = await AsyncStorage.getItem('context');
        const ctx = contextStr ? JSON.parse(contextStr) : {};
        setContext(ctx);

        //setAuthToken(token);

        if (ctx.user.isAuthenticated)
          getMyHotspots(token);
      }
    };

    checkAuth();
  }, []);

  const getMyHotspots = async (token: string) => {

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotspots');
      }

      const data: Hotspot[] = await response.json();
      setHotspots(data);
      //Alert.alert('', JSON.stringify(data))
    } catch (error: any) {
      console.log('[getMyHotspots] ', error);
      Alert.alert('Error getting my hotspots', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const token = await AsyncStorage.getItem('authToken');

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setHotspots((prev) => prev.filter((h) => h.id !== id));
    } catch (error: any) {
      Alert.alert('Error on delete', error.message);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete hotspot",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => handleDelete(id) }
      ]
    );
  };

  const handleCreate = async () => {
    //router.replace('/create-hotspot');
    router.push({
      pathname: '/create-hotspot',
      params: { action: 'create' }
    });
  }

  const handleUpdate = async (hs: Hotspot) => {

    router.push({
      pathname: '/create-hotspot',
      params: { 
        action: 'update',
        hotspotEnc: JSON.stringify(hs)
      }
    });
  }

function isActive(h: Hotspot): boolean {
  if (!h.startTime || !h.endTime) return false;

  const now = new Date();
  const start = new Date(h.startTime);
  const end = new Date(h.endTime);

  return now >= start && now <= end;
}

  return (
    <View style={styles.containerList}>
      {/*<Text style={styles.hello}>Hello, {context.user ? context.user?.name : 'user'}</Text>*/}


          <TouchableOpacity style={styles.fab} onPress={() => handleCreate()}>
            <Ionicons name="add" size={25} color="#fff" />
          </TouchableOpacity>


      <ScrollView contentContainerStyle={styles.scrollContent}>

        {hotspots && hotspots.length > 0 ? (
          hotspots.map((h) => (
            <TouchableOpacity key={h.id} style={styles.listItem} onPress={() => handleUpdate(h)}>
              <View style={styles.row}>

                <View>
                  <Text style={styles.listItemTitle}>{h.name}</Text>
                  
                  <View style={styles.row}>
                    {isActive(h) ? (<><Ionicons name="radio-outline" size={16} color="forestgreen" /><Text style={{color:"forestgreen", marginLeft:5}}>Active</Text></>) : (<><Ionicons name="radio-outline" size={16} color="gray"/><Text style={{color:"gray", marginLeft:5}}>Inactive</Text></>)}
                  </View>

                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(h.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={24} />
                </TouchableOpacity>
                
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Nessun hotspot disponibile</Text>
        )}
      </ScrollView>

    </View>
  );
};

export default HomeTab;
