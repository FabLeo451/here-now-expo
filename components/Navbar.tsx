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

export default function Navbar(): JSX.Element {
  const [visible, setVisible] = useState(false);

  const options = [
    { label: 'Profilo', value: 'profile' },
    { label: 'Impostazioni', value: 'settings' },
    { label: 'Esci', value: 'logout' },
  ];

  const handleSelect = (value: string) => {
    setVisible(false);
    console.log('Hai selezionato:', value);
    // aggiungi qui router.push(...) o logout
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.placeholder} /> {/* spazio sinistro per bilanciare */}
        <Text style={styles.title}>HereNow</Text>
        <TouchableOpacity onPress={() => setVisible(true)} style={styles.icon}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* MENU DROPDOWN */}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'gainsboro',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    /*fontWeight: 'bold',*/
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  icon: {
    padding: 8,
  },
  placeholder: {
    width: 32, // spazio per bilanciare l'icona a sinistra (se vuota)
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
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
