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

interface Hotspot {
  id: string;
  name: string;
  position: {
    latitude: number;
    longitude: number;
  };
  startTime?: string;
  endTime?: string;
}

const HomeTab: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      console.log('[index] Authenticated: ', !!token);

      if (!token) {
        console.log('[index] Redirecting to login...');
        router.replace('/login');
      } else {
        setAuthToken(token);
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
    } catch (error: any) {
      console.log('[getMyHotspots] ', error);
      Alert.alert('Error getting my hotspots', error.message);
    }
  };

  const createHotspot = async () => {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    const hotspot: Omit<Hotspot, 'id'> = {
      name: 'Test',
      position: {
        latitude: 41.18,
        longitude: 21.35,
      },
      startTime: 'start',
      endTime: 'end',
    };

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(hotspot),
      });

      if (!response.ok) {
        throw new Error('Failed to create hotspot');
      }

      const newHotspot: Hotspot = await response.json();
      setHotspots((prev) => [...prev, newHotspot]);
    } catch (error: any) {
      Alert.alert('Errore di accesso', error.message);
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
    handleDelete(id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Hotspots</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {hotspots.length > 0 ? (
          hotspots.map((h) => (
            <View key={h.id} style={styles.card}>


              <View style={styles.row}>
                <Text style={styles.cardTitle}>{h.name}</Text>
                <TouchableOpacity
                  onPress={() => confirmDelete(h.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>




            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nessun hotspot disponibile</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Create Hotspot" onPress={createHotspot} />
      </View>
    </View>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // opzionale, per allineamento verticale
    paddingHorizontal: 16, // opzionale
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
});
