import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';

export default function DropdownMenu(): JSX.Element {
  const [visible, setVisible] = useState(false);

  const options = [
    { label: 'About', value: 'about' },
    { label: 'Debug', value: 'debug' },
    { label: 'Log out', value: 'logout' },
  ];

  const handleSelect = (value: string) => {
    setVisible(false);
    console.log('Selected:', value);

    switch (value) {
      case 'about':
        const version = Constants.expoConfig?.version ?? 'N/A';
        Alert.alert("HereNow", `Version ${version}\n\nThis is an app by ekhoes.com`);
        break;
      case 'debug':
        Alert.alert('Debug',
          `API base URL: ${process.env.EXPO_PUBLIC_API_BASE_URL}
Websocket URL: ${process.env.EXPO_PUBLIC_WEBSOCKET_URL}
`
        )
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const handleLogout = async () => {
    router.replace('/logout');
  };

  return (
    <View style={styles.wrapper}>
      {/* ICONA HAMBURGER */}
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Ionicons name="menu" size={28} color="#000" />
      </TouchableOpacity>

      {/* MODALE MENU */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={styles.menuItem}
              >
                <Text style={styles.menuText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    alignItems: 'flex-start',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 40,
    paddingRight: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 4,
    width: 160,
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
