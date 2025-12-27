import React, { useEffect, useReducer, useState } from 'react';
import {
	Alert,
	View,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	Platform,
	Switch
} from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button } from '@ui-kitten/components';
import { styles } from "@/Style";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
//import ModalMapSelect from '@/components/ModalMapSelect';
import { Hotspot, Category } from '@/lib/hotspot';
import { useAuth } from '@/hooks/useAuth';
import { useIsFocused } from '@react-navigation/native';

const COMPONENT = 'EditHotspotTab';

type FormState = {
	id: string;
	name: string;
	description: string;
	category: Category | null;
	categoryId: string | null;
	enabled: boolean;
	isPrivate: boolean;
	startDate: Date;
	endDate: Date;
	location: { latitude: number; longitude: number } | null;
	position: string;
};

type FormAction =
	| { type: 'SET_FIELD'; field: keyof FormState; value: any }
	| { type: 'SET_LOCATION'; location: { latitude: number; longitude: number } }
	| { type: 'SET_POSITION'; position: string }
	| { type: 'SET_CATEGORY'; value: Category | null }
	| { type: 'RESET'; payload: Partial<FormState> };


const initialState: FormState = {
	id: '',
	name: '',
	description: '',
	category: null,
	categoryId: null,
	enabled: true,
	isPrivate: false,
	startDate: new Date(),
	endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
	location: { latitude: 41.9028, longitude: 12.4964 },
	position: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case 'SET_FIELD':
			return { ...state, [action.field]: action.value };
		case 'SET_LOCATION':
			return { ...state, location: action.location };
		case 'SET_POSITION':
			return { ...state, position: action.position };
		case 'RESET':
			return { ...state, ...action.payload };
		case 'SET_CATEGORY':
			return {
				...state,
				category: action.value,
				categoryId: action.value?.value || null,
			};

		default:
			return state;
	}
}

const EditHotspotTab: React.FC = () => {
	const { action, hotspotEnc } = useLocalSearchParams();
	const insets = useSafeAreaInsets();
	const { token } = useAuth();
	const isFocused = useIsFocused();

	const [form, dispatch] = useReducer(formReducer, initialState);
	const [confCategories, setConfCategories] = useState<Category[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);

	// Mounted flag per evitare warning su async
	const mountedRef = React.useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		console.log(`[${COMPONENT}] Mounted`);
		return () => { mountedRef.current = false; console.log(`[${COMPONENT}] Unmounted`); };
	}, []);

	const getCategories = async () => {
		if (!isFocused || refreshing) return;
		setRefreshing(true);
		console.log(`[${COMPONENT}] Getting categories...`);

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/categories`);
			if (!mountedRef.current) return;

			if (!response.ok) throw new Error('Failed to fetch categories');

			const data: Category[] = await response.json();

			if (mountedRef.current) {
				setConfCategories(data);
				console.log(`[${COMPONENT}] Categories updated`);
			}
		} catch (err: any) {
			console.log(`[${COMPONENT}] getCategories`, err);
		} finally {
			if (mountedRef.current) setRefreshing(false);
		}
	};

	useEffect(() => { getCategories(); }, [isFocused]);

	// Load hotspot if action = update
	useEffect(() => {
		if (!isFocused || action !== 'update' || !hotspotEnc) return;

		try {
			const hotspot: Hotspot = JSON.parse(hotspotEnc);
			if (!mountedRef.current) return;

			dispatch({
				type: 'RESET',
				payload: {
					id: hotspot.id,
					name: hotspot.name,
					description: hotspot.description,
					category: confCategories.find(c => c.value === hotspot.category) || null,
					categoryId: hotspot.category,
					enabled: hotspot.enabled,
					isPrivate: hotspot.private,
					startDate: new Date(hotspot.startTime),
					endDate: new Date(hotspot.endTime),
					location: hotspot.position,
					position: `${hotspot.position.latitude.toFixed(6)}, ${hotspot.position.longitude.toFixed(6)}`
				}
			});
		} catch {
			console.log(`[${COMPONENT}] Invalid hotspotEnc`);
		}
	}, [hotspotEnc, isFocused]);

	// Handlers picker
	const onChangeStartDate = (event: any, selectedDate?: Date) => {
		if (selectedDate) {
			dispatch({ type: 'SET_FIELD', field: 'startDate', value: selectedDate });
		}
		setShowStartDatePicker(false);
		setShowStartTimePicker(false);
	};

	const onChangeEndDate = (event: any, selectedDate?: Date) => {
		if (selectedDate) {
			dispatch({ type: 'SET_FIELD', field: 'endDate', value: selectedDate });
		}
		setShowEndDatePicker(false);
		setShowEndTimePicker(false);
	};

	const validate = (): boolean => {
		if (!token) { Alert.alert('Error', 'Not authenticated'); return false; }
		if (!form.name || form.name.length < 3) { Alert.alert('Invalid data', 'Name too short.'); return false; }
		if (!form.position) { Alert.alert('Invalid data', 'Location not set.'); return false; }
		return true;
	};

	const getHotspotPayload = (): Omit<Hotspot, 'id'> => ({
		name: form.name,
		description: form.description,
		enabled: form.enabled,
		private: form.isPrivate,
		position: form.location || { latitude: 0, longitude: 0 },
		startTime: form.startDate.toISOString(),
		endTime: form.endDate.toISOString(),
		category: form.category?.value,
	});

	const submitHotspot = async () => {
		if (!validate()) return;

		const payload = getHotspotPayload();
		const url = action === 'create'
			? `${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`
			: `${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${form.id}`;
		const method = action === 'create' ? 'POST' : 'PUT';

		try {
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json', Authorization: token! },
				body: JSON.stringify(payload),
			});
			if (!response.ok) throw new Error(`${action === 'create' ? 'Create' : 'Update'} failed`);
			router.replace("/hotspots");
		} catch (err: any) {
			Alert.alert('Error', err.message);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: '#f0f0f0' }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={0}
		>
			<ScrollView
				contentContainerStyle={{
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
					flexGrow: 1,
				}}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
			>
				<View style={styles.rowLeft}>
					<TouchableOpacity style={{ margin: 10 }} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.sectionTitle}>{action === 'create' ? "Create" : "Update"} hotspot</Text>
				</View>

				<View style={styles.container}>
					{/*
					<ModalMapSelect
						token={token}
						visible={modalVisible}
						latitude={form.location?.latitude ?? 0}
						longitude={form.location?.longitude ?? 0}
						onSelect={(coords) => {
							setModalVisible(false);
							if (coords) {
								dispatch({ type: 'SET_LOCATION', location: coords });
								dispatch({ type: 'SET_POSITION', position: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` });
							}
						}}
					/>
					*/}

					{/* Name */}
					<Text style={styles.label}>Name</Text>
					<Input
						placeholder="Name"
						style={styles.input}
						value={form.name}
						onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'name', value: text })}
						autoCapitalize="sentences"
					/>

					{/* Description */}
					<Text style={styles.label}>Description</Text>
					<Input
						multiline
						value={form.description}
						onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'description', value: text })}
					/>

					{/* Location */}
					<Text style={styles.label}>Location</Text>
					<View style={styles.rowLeft}>
						{form.position ? (
							<View style={styles.rowLeft}><Text>Selected</Text><Ionicons name="checkmark-sharp" size={25} color="#0b0" /></View>
						) : (
							<View style={styles.rowLeft}><Text style={{ color: "darkgray" }}>Not selected</Text><Ionicons name="help-circle-outline" size={25} color="darkgray" /></View>
						)}
						<TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
							<Ionicons name="locate" size={25} color="#fff" />
						</TouchableOpacity>
					</View>

					{/* Category */}
					<Text style={styles.label}>Category</Text>
					<View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}>
						<Picker
							selectedValue={form.category?.value ?? null}
							onValueChange={(value) => {
								const category = confCategories.find(c => c.value === value) || null;
								dispatch({ type: 'SET_CATEGORY', value: category });
							}}
						>
							<Picker.Item label="Select a category..." value={null} />
							{confCategories.map(c => (
								<Picker.Item key={c.value} label={c.label} value={c.value} />
							))}
						</Picker>
					</View>

					{/* Enabled / Private */}
					<View style={styles.row}>
						<Text style={styles.label}>Enabled</Text>
						<Switch value={form.enabled} onValueChange={(val) => dispatch({ type: 'SET_FIELD', field: 'enabled', value: val })} />
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Private</Text>
						<Switch value={form.isPrivate} onValueChange={(val) => dispatch({ type: 'SET_FIELD', field: 'isPrivate', value: val })} />
					</View>

					{/* Start / End Time */}
					<Text style={styles.label}>Start time</Text>
					<View style={styles.rowLeft}>
						<Text>{form.startDate.toLocaleString()}</Text>
						<TouchableOpacity style={styles.selectButton} onPress={() => setShowStartDatePicker(true)}>
							<Ionicons name="calendar" size={25} color="#fff" />
						</TouchableOpacity>
						<TouchableOpacity style={styles.selectButton} onPress={() => setShowStartTimePicker(true)}>
							<Ionicons name="time" size={25} color="#fff" />
						</TouchableOpacity>
					</View>
					{showStartDatePicker && <DateTimePicker value={form.startDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={onChangeStartDate} />}
					{showStartTimePicker && <DateTimePicker value={form.startDate} mode="time" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={onChangeStartDate} />}

					<Text style={styles.label}>End time</Text>
					<View style={styles.rowLeft}>
						<Text>{form.endDate.toLocaleString()}</Text>
						<TouchableOpacity style={styles.selectButton} onPress={() => setShowEndDatePicker(true)}>
							<Ionicons name="calendar" size={25} color="#fff" />
						</TouchableOpacity>
						<TouchableOpacity style={styles.selectButton} onPress={() => setShowEndTimePicker(true)}>
							<Ionicons name="time" size={25} color="#fff" />
						</TouchableOpacity>
					</View>
					{showEndDatePicker && <DateTimePicker value={form.endDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={onChangeEndDate} />}
					{showEndTimePicker && <DateTimePicker value={form.endDate} mode="time" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={onChangeEndDate} />}

					<Button style={{ marginTop: 30 }} onPress={submitHotspot}>
						{action === 'create' ? 'Create' : 'Save'}
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
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

export default EditHotspotTab;
