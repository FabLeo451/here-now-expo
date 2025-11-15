import React, { useEffect, useState, useCallback } from 'react';
import {
	Alert,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { styles } from "@/Style";
import { Ionicons } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
import DropdownHotspot from '@/components/DropdownHotspot'
import { Hotspot } from '@/lib/hotspot'

const isTokenValid = async (token: string): Promise<boolean> => {

	try {
		const payloadBase64 = token.split('.')[1];
		const payloadJson = atob(payloadBase64);
		const payload = JSON.parse(payloadJson);

		if (!payload.exp) return true;

		const now = Math.floor(Date.now() / 1000); // current time in seconds
		return payload.exp > now;
	} catch (err) {
		console.error('Error decoding token JWT:', err);
		return false;
	}
};

const HomeTab: React.FC = () => {
	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [context, setContext] = useState(null);
	const [authToken, setAuthToken] = useState('');
	const [refreshing, setRefreshing] = useState(false);

	useFocusEffect(
		useCallback(() => {
			const checkToken = async () => {

				const token = await AsyncStorage.getItem('authToken');

				if (!token)
					return;

				console.log('[index] Checking token validity...')
				const valid = await isTokenValid(token);
				if (!valid) {
					console.log('[index] Invalid token')
					router.replace('/logout');
				}
			};
			checkToken();
		}, [])
	);

	useEffect(() => {
		const checkAuth = async () => {
			const token = await AsyncStorage.getItem('authToken');
			//console.log('[index] Token found: ', !!token);

			if (!token) {
				console.log('[index] Redirecting to login...');
				router.replace('/login');
			} else {

				setAuthToken(token);

				const contextStr = await AsyncStorage.getItem('context');
				const ctx = contextStr ? JSON.parse(contextStr) : {};
				setContext(ctx);

				if (ctx.user.isAuthenticated)
					getMyHotspots(token);
			}
		};

		checkAuth();
	}, []);

	const getMyHotspots = async (token: string) => {

		try {
			setRefreshing(true);
			setHotspots([]);

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				console.log(response)
				throw new Error('Failed to fetch: ' + response.status + ' ' + response.statusText);
			}

			const data: Hotspot[] = await response.json();
			setHotspots(data);
			//console.log('[index]', JSON.stringify(data))
		} catch (error: any) {
			console.log('[getMyHotspots] ', error);
			Alert.alert('Error getting my hotspots', error.message);
		} finally {
			setRefreshing(false);
		}
	};

	const onRefresh = useCallback(() => {
		getMyHotspots(authToken);
	}, [authToken]);

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
				console.log(response);
				throw new Error('Failed to delete');
			}

			setHotspots((prev) => prev.filter((h) => h.id !== id));
		} catch (error: any) {
			Alert.alert('Error on delete', error.message);
		}
	};

	const handleClone = async (id: string) => {
		const token = await AsyncStorage.getItem('authToken');

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}/clone`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token ?? '',
				},
			});

			if (!response.ok) {
				console.log(response);
				throw new Error('Failed to clone');
			}

			onRefresh();
		} catch (error: any) {
			Alert.alert('Error on clone', error.message);
		}
	};

	const confirmDelete = (id: string) => {
		Alert.alert(
			"Delete hotspot",
			"Are you sure you want to delete this item?",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Yes", onPress: () => handleDelete(id) }
			]
		);
	};

	const handleCreate = async () => {
		//router.replace('/create-hotspot');
		router.push({
			pathname: '/create-hotspot',
			params: { action: 'create' }
		});
	}

	const handleUpdate = async (hs: Hotspot) => {

		router.push({
			pathname: '/create-hotspot',
			params: {
				action: 'update',
				hotspotEnc: JSON.stringify(hs)
			}
		});
	}

	function isActive(h: Hotspot): boolean {
		if (!h.enabled || !h.startTime || !h.endTime) return false;

		const now = new Date();
		const start = new Date(h.startTime);
		const end = new Date(h.endTime);

		return now >= start && now <= end;
	}

	if (!context)
		return null;

	if (context.user.isGuest)
		return (
			<View style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
			}}><Text>Only registered users can add hotspots</Text></View>
		)

	if (refreshing)
		return (<View style={{ margin: 10 }}><Text>Loading...</Text></View>)

	return (
		<View style={styles.containerList}>

			<TouchableOpacity style={styles.fab} onPress={() => handleCreate()}>
				<Ionicons name="add" size={25} color="#fff" />
			</TouchableOpacity>


			<ScrollView
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>

				{hotspots && hotspots.length > 0 ? (
					hotspots.map((h) => (
						<TouchableOpacity key={h.id} style={styles.listItem} onPress={() => handleUpdate(h)}>
							<View style={styles.row}>

								<View>
									<Text style={styles.listItemTitle}>{h.name}</Text>

									<View style={[styles.row, { gap: 20 }]}>
										<View style={styles.row}>
											{isActive(h) ? (<><Ionicons name="radio-outline" size={16} color="forestgreen" /><Text style={{ color: "forestgreen", marginLeft: 5 }}>Active</Text></>) : (<><Ionicons name="radio-outline" size={16} color="gray" /><Text style={{ color: "gray", marginLeft: 5 }}>Inactive</Text></>)}
										</View>
										<View style={styles.row}>
											{h.private ? (<><Ionicons name="lock-closed-outline" size={16} color="dimgray" /><Text style={{ color: "dimgray", marginLeft: 5 }}>Private</Text></>) : (<><Ionicons name="globe-outline" size={16} color="steelblue" /><Text style={{ color: "steelblue", marginLeft: 5 }}>Public</Text></>)}
										</View>
										<View style={styles.row}>
											{h.likes == 0 ? (<Ionicons name="thumbs-up-outline" size={16} color="lightgray" style={{ marginRight: 5 }} />) : (<Ionicons name="thumbs-up" size={16} color="royalblue" style={{ marginRight: 5 }} />)}
											<Text style={{ color: "gray" }} >{h.likes}</Text>
										</View>
										<View style={styles.row}>
											<Ionicons name="people" size={16} color="royalblue" style={{ marginRight: 5 }} />
											<Text style={{ color: "gray" }} >{h.subscriptions}</Text>
										</View>
									</View>

								</View>

								{/*<TouchableOpacity
                  onPress={() => confirmDelete(h.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={24} />
                </TouchableOpacity>*/}

								<DropdownHotspot
									onSelect={(value: string) => {

										//console.log(`Selected from '${h.id}': ${value}`);

										switch (value) {
											case 'clone':
												handleClone(h.id);
												break;

											case 'view_on_map':
												router.push({
													pathname: '/map',
													params: { 
														hotspotId: h.id, 
														targetLatitude: h.position.latitude, 
														targetLongitude: h.position.longitude 
													}
												});
												break;

											case 'delete':
												confirmDelete(h.id)
												break;
										}
									}}
								/>


							</View>
						</TouchableOpacity>
					))
				) : (
					<Text style={styles.emptyText}>No hotspot</Text>
				)}
			</ScrollView>

		</View>
	);
};

export default HomeTab;
