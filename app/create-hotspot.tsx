import React, { useEffect, useState } from 'react';
import {
	Alert,
	View,
	TextInput,
	TouchableOpacity,
	Platform,
	Switch
} from 'react-native';
import { router } from 'expo-router';
import { Layout, Text, TextProps, Input, Button, Spinner } from '@ui-kitten/components';
import { styles } from "@/Style";
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import ModalMapSelect from '@/components/ModalMapSelect'
import { Hotspot, Category } from '@/lib/hotspot'

const CreateHotspot: React.FC = () => {

	const { action, hotspotEnc } = useLocalSearchParams();
	const insets = useSafeAreaInsets();

	const [authToken, setAuthToken] = useState('');
	const [id, setId] = useState('');
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState(null);
	const [enabled, setEnabled] = useState(true);
	const [isPrivate, setPrivate] = useState(false);
	const [startDate, setStartDate] = useState(new Date());
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>({
		latitude: 41.9028,
		longitude: 12.4964,
	});
	const [position, setPosition] = useState(''); // On screen

	const [confCategories, setConfCategories] = useState<Category[]>([]);

	useEffect(() => {

		const init = async () => {
			const token = await AsyncStorage.getItem('authToken');
			setAuthToken(token ?? '');

			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('GPS not permitted');
				return;
			}

			let coords = { latitude: 0, longitude: 0 };

			if (action == 'update' && typeof hotspotEnc === 'string') {
				const hotspot = JSON.parse(hotspotEnc);
				//Alert.alert('', hotspotEnc)
				setId(hotspot.id);
				setName(hotspot.name);
				setDescription(hotspot.description);
				setCategory(hotspot.category);
				setPosition(hotspot.position.latitude.toFixed(6) + ', ' + hotspot.position.longitude.toFixed(6));
				setEnabled(hotspot.enabled);
				setPrivate(hotspot.private);
				setStartDate(new Date(hotspot.startTime));
				setEndDate(new Date(hotspot.endTime));

				coords.latitude = hotspot.position.latitude;
				coords.longitude = hotspot.position.longitude;

			} else {

				let loc = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.BestForNavigation, // o .BestForNavigation
					//maximumAge: 0,      // No cache
				});

				coords.latitude = loc.coords.latitude;
				coords.longitude = loc.coords.longitude;

			}

			setLocation(coords);

			//console.log('[init] Initial coords: ', coords);
		}

		init();
		getCategories();

	}, [hotspotEnc, action]);

	const getCategories = async () => {

		try {
			setConfCategories([]);

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/categories`, {
				method: 'GET',
			});

			if (!response.ok) {
				console.log(response)
				throw new Error('Failed to fetch: ' + response.status + ' ' + response.statusText);
			}

			const data: Category[] = await response.json();
			setConfCategories(data);
			//console.log('[create-hotspot]', JSON.stringify(data))
		} catch (error: any) {
			console.log('[getCategories] ', error);
			Alert.alert('Error getting categories', error.message);
		} finally {

		}
	};

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

	function validate() {

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
			Alert.alert(title, 'Location not set.');
			return false;
		}

		return true;
	}

	const updateHotspot = async () => {

		if (!validate())
			return;

		const hotspot: Omit<Hotspot, 'id'> = {
			name,
			description,
			enabled,
			private: isPrivate,
			position: {
				latitude: location?.latitude || 0,
				longitude: location?.longitude || 0,
			},
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
			category
		};

		console.log('[edit-hotspot] Updating', hotspot);

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
				throw new Error('Failed to update hotspot');
			}

			//const newHotspot: Hotspot = await response.json();

			router.replace("/");

		} catch (error: any) {
			Alert.alert('Error updating:', error.message);
		}
	}

	const createHotspot = async () => {

		if (!validate())
			return;

		const hotspot: Omit<Hotspot, 'id'> = {
			name,
			description,
			enabled,
			private: isPrivate,
			position: {
				latitude: location?.latitude || 0,
				longitude: location?.longitude || 0,
			},
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
			category
		};

		console.log('[edit-hotspot] Creating', hotspot);

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
				method: 'POST',
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

			router.replace("/");

		} catch (error: any) {
			Alert.alert('Error', error.message);
		}
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
				<TouchableOpacity style={{ marginHorizontal: 10, marginVertical: 10 }} onPress={() => router.replace("/")}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.sectionTitle}>{action == 'create' ? "Create" : "Update"} hotspot</Text>
			</View>
			<View style={styles.container}>
				<ModalMapSelect
					visible={modalVisible}
					latitude={location?.latitude ?? 0}
					longitude={location?.longitude ?? 0}
					onSelect={(coords: { latitude: number; longitude: number } | null) => {

						//Alert.alert(JSON.stringify(coords))
						setModalVisible(false);
						if (coords) {
							setLocation(coords);
							setPosition(coords.latitude.toFixed(6) + ', ' + coords.longitude.toFixed(6));
						}

					}}
				/>

				{/*<Input value={id} style={{ display: 'none' }} />*/}

				{/* Name */}
				<Text style={styles.label}>Name</Text>
				<Input
					placeholder="Name"
					style={styles.input}
					value={name}
					onChangeText={setName}
					autoCapitalize="sentences"
				/>

				{/* Description */}
				<Text style={styles.label}>Description</Text>
				<TextInput
					style={styles.textArea}
					multiline={true}
					numberOfLines={4}
					value={description}
					onChangeText={setDescription}
				/>

				{/* Location */}
				<Text style={styles.label}>Location</Text>
				<View style={styles.rowLeft}>
					{/*<Input
						style={styles.input}
						value={position}
						autoCapitalize="none"
						disabled={true}
					/>*/}
					{position ? (
						<View style={styles.rowLeft}><Text>Selected</Text><Ionicons name="checkmark-sharp" size={25} color="#0b0" /></View>
					) : (
						<View style={styles.rowLeft}><Text style={{ color: "darkgray" }}>Not selected</Text><Ionicons name="help-circle-outline" size={25} color="darkgray" /></View>
					)}
					<TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
						<Ionicons name="locate" size={25} color="#fff" />
					</TouchableOpacity>
				</View>

				{/* Category */}
				<View >
					<Text style={styles.label}>Category</Text>
					<RNPickerSelect
						onValueChange={(value) => setCategory(value)}
						items={confCategories}
						placeholder={{ label: 'Select a category...', value: null }}
						style={pickerSelectStyles}
						value={category}
					/>
				</View>
				
				{/* Enabled */}
				<View style={styles.row}>
					<Text style={styles.label}>Enabled</Text>
					<Switch
						value={enabled}
						onValueChange={setEnabled}
					/>
				</View>

				{/* Private */}
				<View style={styles.row}>
					<Text style={styles.label}>Private</Text>
					<Switch
						value={isPrivate}
						onValueChange={setPrivate}
					/>
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
							value={endDate}
							mode="date"
							display={Platform.OS === 'ios' ? 'inline' : 'default'}
							onChange={onChangeEndDate}
						/>
					)
				}
				{
					showEndTimePicker && (
						<DateTimePicker
							value={endDate}
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

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#f0f0f0',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    backgroundColor: '#f0f0f0',
  },
};

export default CreateHotspot;
