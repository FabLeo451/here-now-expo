import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	Modal,
	StyleSheet,
	Alert,
	Platform,
	Linking
} from 'react-native';
import { Text, Button } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "@/Style";
import { Hotspot } from '@/lib/hotspot'

function openInGoogleMaps(latitude: number, longitude: number) {
	const url = Platform.select({
		ios: `http://maps.apple.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}`,
		android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`, 
	});

	Linking.openURL(url ?? '');
}

type Props = {
	visible: boolean;
	id: string;
	onClose: () => void;
};

export default function ModalHotspot({ visible, id, onClose }: Props) {
	const [context, setContext] = useState(null);
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [likes, setLikes] = useState<number>(0);
	const [likedByMe, setLikedByMe] = useState<boolean>(false);
	const [loading, setLoading] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const [subscribed, setSubscribed] = useState<boolean>(false);

	useEffect(() => {
		const init = async () => {
			const token = await AsyncStorage.getItem('authToken');

			//console.log('visible = ', visible, 'id = ', id);

			if (!visible)
				return;

			const contextStr = await AsyncStorage.getItem('context');
			const ctx = contextStr ? JSON.parse(contextStr) : {};
			setContext(ctx);
			setAuthenticated(ctx.user.isAuthenticated);

			if (token)
				getHotspot(token, id);
		};

		init();
	}, [visible, id]);

	useEffect(() => {

		if (hotspots[0]) {
			setLikes(hotspots[0].likes);
			setLikedByMe(hotspots[0].likedByMe);
			setSubscribed(hotspots[0].subscribed);
		}

	}, [hotspots]);

	const handleLike = async (like: boolean) => {

		console.log('[ModalHotspot.Like] ', like);

		const token = await AsyncStorage.getItem('authToken');

		if (!token || !authenticated)
			return;

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}/like`, {
				method: like ? 'POST' : 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				//console.log('[ModalHotspot.Like] ', response);
				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			setLikedByMe(like);
			setLikes(prev => like ? prev + 1 : prev - 1);

		} catch (error: any) {
			console.log('[ModalHotspot.Like] ', error);
			Alert.alert('Error', error.message);
		} finally {

		}
	}

	const handleSubscription = async (subscribe: boolean) => {

		console.log('[ModalHotspot.handleSubscription] ', subscribe);

		const token = await AsyncStorage.getItem('authToken');

		if (!token || !authenticated)
			return;

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}/subscription`, {
				method: subscribe ? 'POST' : 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				//console.log('[ModalHotspot.Like] ', response);
				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			setSubscribed(subscribe);

		} catch (error: any) {
			console.log('[ModalHotspot.handleSubscription] ', error);
			Alert.alert('Error', error.message);
		} finally {

		}
	}

	const getHotspot = async (token: string, id: string) => {

		//console.log(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`);

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				console.log('[ModalHotspot.Like] ', response);
				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			const data: Hotspot[] = await response.json();
			setHotspots(data);
			setLoaded(true);

			//Alert.alert('', JSON.stringify(data))
		} catch (error: any) {
			console.log('[ModalHotspot] ', error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	const stylesModal = StyleSheet.create({
		overlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		content: {
			paddingHorizontal: 20,
			paddingTop: 10,
			paddingBottom: 20,
			backgroundColor: 'white',
			borderRadius: 10,
			elevation: 5,
			minWidth: 350
		},
		text: {
			marginBottom: 10,
			fontSize: 16,
		},
		map: {
			/*width: Dimensions.get('window').width,
			height: Dimensions.get('window').height,*/
			width: 350,
			height: 350,
		},
		closeButton: {
			position: 'absolute',
			top: 10,
			right: 10,
			zIndex: 1,
		},
	});

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={() => onClose()}
		>

			{loading && (<View><Text>Loading...</Text></View>)}


			{loaded && (
				<View style={stylesModal.overlay}>
					<View style={stylesModal.content}>
						<TouchableOpacity onPress={() => onClose()} style={stylesModal.closeButton}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>

						<Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 5 }}>{hotspots[0].name}</Text>
						<Text style={{ fontSize: 10, fontStyle: "italic", marginBottom: 8, color:"gray" }}>Created by {hotspots[0].owner}</Text>
						<Text style={{ fontSize: 12, marginBottom: 8, color:"slategray" }}>{hotspots[0].description}</Text>

						<View style={[styles.rowLeft, { marginVertical: 8 }]}>

							{/* Subscribe/unsubscribe */}
							{!hotspots[0].ownedByMe &&
								(
									<View style={[styles.rowLeft, { marginVertical: 8, marginRight: 20 }]}>
										<TouchableOpacity
											onPress={() => {
												handleSubscription(!subscribed);
											}}
										>
											{subscribed ? (
												<Ionicons name="notifications" size={25} color="royalblue" />
											) : (
												<Ionicons name="notifications-outline" size={25} color="lightgray" />
											)}

										</TouchableOpacity>
									</View>
								)
							}

							{/* Likes */}
							<View style={[styles.rowLeft, { marginVertical: 8, marginRight: 20 }]}>
								<TouchableOpacity
									onPress={() => {
										handleLike(!likedByMe);
									}}
								>
									{likedByMe ? (
										<Ionicons name="thumbs-up" size={25} color="royalblue" />
									) : (
										<Ionicons name="thumbs-up-outline" size={25} color="lightgray" />
									)}

								</TouchableOpacity>
								<Text>{likes}</Text>
							</View>
						</View>

						{/* Open in Maps */}
						<TouchableOpacity
							style={[styles.rowLeft, { marginVertical: 8 }]}
							onPress={() => {
								const { latitude, longitude } = hotspots[0].position;
								openInGoogleMaps(latitude, longitude);
							}}
						>
							<Ionicons name="location-outline" size={25} color="steelblue" />
							<Text>Open in Maps</Text>
						</TouchableOpacity>

					</View>
				</View>
			)}

		</Modal>
	);


}