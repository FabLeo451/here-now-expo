import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HamburgerMenu(): JSX.Element {
  const [visible, setVisible] = useState(false);

  const options = [
    { label: 'Profilo', value: 'profile' },
    { label: 'Impostazioni', value: 'settings' },
    { label: 'Esci', value: 'logout' },
  ];

  const handleSelect = (value: string) => {
    setVisible(false);
    console.log('Selezionato:', value);
    // Puoi aggiungere qui navigazione o logica
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
