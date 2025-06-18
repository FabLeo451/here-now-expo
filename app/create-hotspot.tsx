import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Layout, Text, TextProps, Input, Button, Spinner } from '@ui-kitten/components';
import { styles } from "@/app/Style";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const CreateHotspot: React.FC = () => {

  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setStartTime(selectedDate);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <View style={{
      paddingTop: insets.top,
      paddingBottom: /*insets.bottom*/ 0,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      flex: 1,
      backgroundColor: '#f0f0f0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 50 }}>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text>Back</Text>
      </View>
      <View style={styles.container}>


      <Text>Name</Text>
      <Input
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />

      <Text>Start time</Text>
      <Text>{startTime.toLocaleString()}</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>


      {
        showDatePicker && (
          <DateTimePicker
            value={startTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChange}
          />
        )
      }

      </View>
    </View >
  );
};

export default CreateHotspot;
