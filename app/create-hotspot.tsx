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
	const [startDate, setStartDate] = useState(new Date());
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);

	const onChangeStartDate = (event: any, selectedDate?: Date) => {
		if (selectedDate && selectedDate < endDate) setStartDate(selectedDate);
		setShowStartDatePicker(false);
		setShowStartTimePicker(false);
	};

	const onChangeEndDate = (event: any, selectedDate?: Date) => {
		if (selectedDate && selectedDate > startDate) setEndDate(selectedDate);
		setShowEndDatePicker(false);
		setShowEndTimePicker(false);
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
			<View style={styles.rowLeft}>
				<TouchableOpacity onPress={() => router.replace("/")}>
					<Ionicons name="arrow-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.sectionTitle}>Create an hotspot</Text>
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

				{/* Start time */}
				<Text>Start time</Text>
				<View style={styles.rowLeft}>
					<Text>{startDate.toLocaleString()}</Text>
					<TouchableOpacity style={styles.selectButton} onPress={() => setShowStartDatePicker(true)}>
						<Ionicons name="calendar" size={25} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.selectButton} onPress={() => setShowStartTimePicker(true)}>
						<Ionicons name="time" size={25} color="#fff" />
					</TouchableOpacity>
				</View>

				{
					showStartDatePicker && (
						<DateTimePicker
							value={startDate}
							mode="date"
							display={Platform.OS === 'ios' ? 'inline' : 'default'}
							onChange={onChangeStartDate}
						/>
					)
				}
				{
					showStartTimePicker && (
						<DateTimePicker
							value={startDate}
							mode="time"
							display={Platform.OS === 'ios' ? 'inline' : 'default'}
							onChange={onChangeStartDate}
						/>
					)
				}

				{/* End time */}
				<Text>End time</Text>
				<View style={styles.rowLeft}>
					<Text>{endDate.toLocaleString()}</Text>
					<TouchableOpacity style={styles.selectButton} onPress={() => setShowEndDatePicker(true)}>
						<Ionicons name="calendar" size={25} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.selectButton} onPress={() => setShowEndTimePicker(true)}>
						<Ionicons name="time" size={25} color="#fff" />
					</TouchableOpacity>
				</View>

				{
					showEndDatePicker && (
						<DateTimePicker
							value={startDate}
							mode="date"
							display={Platform.OS === 'ios' ? 'inline' : 'default'}
							onChange={onChangeEndDate}
						/>
					)
				}
				{
					showEndTimePicker && (
						<DateTimePicker
							value={startDate}
							mode="time"
							display={Platform.OS === 'ios' ? 'inline' : 'default'}
							onChange={onChangeEndDate}
						/>
					)
				}

			</View>
		</View >
	);
};

export default CreateHotspot;
