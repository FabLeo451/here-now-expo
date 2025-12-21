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

type DropdownOption = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap; // 👈 opzionale
  color?: string; // opzionale (utile per Delete)
};

type DropdownMenuProps = {
  options: DropdownOption[];
  onSelect: (value: string) => void;
};

export default function DropdownMenu({
  options,
  onSelect,
}: DropdownMenuProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <TouchableOpacity onPress={() => setVisible(true)}>
      <View style={styles.wrapper}>
        <Ionicons name="ellipsis-vertical" size={20} color="#000" />

        <Modal transparent visible={visible} animationType="fade">
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
            <View style={styles.menu}>
              {options.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.menuItem}
                  onPress={() => {
                    setVisible(false);
                    onSelect(option.value);
                  }}
                >
                  {option.icon && (
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={option.color ?? '#333'}
                      style={styles.icon}
                    />
                  )}

                  <Text
                    style={[
                      styles.menuText,
                      option.color && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </TouchableOpacity>

  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    margin: 5,
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
    width: 180,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
