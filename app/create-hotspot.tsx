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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

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

	const { action, hotspotEnc } = useLocalSearchParams();
	const insets = useSafeAreaInsets();

	const [authToken, setAuthToken] = useState('');
	const [id, setId] = useState('');
	const [name, setName] = useState('');
	const [position, setPosition] = useState('');
	const [startDate, setStartDate] = useState(new Date());
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);
	const [showMap, setShowMap] = useState(false);

	useEffect(() => {
		if (action == 'update' && typeof hotspotEnc === 'string')  {
			const hotspot = JSON.parse(hotspotEnc);
			setId(hotspot.id);
			setName(hotspot.name);
			setStartDate(new Date(hotspot.startTime));
			setEndDate(new Date(hotspot.endTime));
		}
		
		const init = async () => {
			const token = await AsyncStorage.getItem('authToken');
			setAuthToken(token ?? '');
		}

		init();

	}, [hotspotEnc, action]);

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

	async function validate() {

		//const token = await AsyncStorage.getItem('authToken');
		const title = 'Invalid data';

		if (!authToken) {
			Alert.alert('Error', 'Not authenticated');
			return false;
		}

		if (!name || name.length < 3) {
			Alert.alert(title, 'Name too short.');
			return false;
		}

		if (!position) {
			Alert.alert(title, 'Position not set.');
			return false;
		}

		return true;
	}

	const updateHotspot = async () => {
		
		if (!validate())
			return;

		const hotspot: Omit<Hotspot, 'id'> = {
			name,
			position: {
				latitude: 41.18,
				longitude: 21.35,
			},
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
		};

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authToken,
				},
				body: JSON.stringify(hotspot),
			});

			if (!response.ok) {
				throw new Error('Failed to create hotspot');
			}

			const newHotspot: Hotspot = await response.json();

		} catch (error: any) {
			Alert.alert('Errore di accesso', error.message);
		}
	}

	const createHotspot = async () => {
		
		if (!validate())
			return;

		const hotspot: Omit<Hotspot, 'id'> = {
			name: 'Test',
			position: {
				latitude: 41.18,
				longitude: 21.35,
			},
			startTime: 'start',
			endTime: 'end',
		};
		/*
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
		
			} catch (error: any) {
			  Alert.alert('Errore di accesso', error.message);
			}
			  */
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
				<Text style={styles.sectionTitle}>{action == 'create' ? "Create" : "Update" } hotspot</Text>
			</View>
			<View style={styles.container}>
				<Input value={id} style={{ display: 'none' }}/>

				<Text style={styles.label}>Name</Text>
				<Input
					placeholder="Name"
					style={styles.input}
					value={name}
					onChangeText={setName}
					autoCapitalize="none"
				/>

				<Text style={styles.label}>Position</Text>
				<View style={styles.rowLeft}>
					<Input
						style={styles.input}
						value={position}
						autoCapitalize="none"
						disabled={true}
					/>
					<TouchableOpacity style={styles.selectButton} onPress={() => setShowMap(true)}>
						<Ionicons name="map" size={25} color="#fff" />
					</TouchableOpacity>
				</View>

				{/* Start time */}
				<Text style={styles.label}>Start time</Text>
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
				<Text style={styles.label}>End time</Text>
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

				{action == 'create' ? (
					<Button style={{ marginTop: 30 }} onPress={createHotspot}>
						Create
					</Button>
				) : (
				<Button style={{ marginTop: 30 }} onPress={updateHotspot}>
					Update
				</Button>
				)}

			</View>
		</View >
	);
};

export default CreateHotspot;
