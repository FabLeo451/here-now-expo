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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { Hotspot, Category } from '@/lib/hotspot'
import { HotspotSubscriptionButton } from '@/components/HotspotSubscriptionButton';

type Params = {
  id: string;
};

const HotspotPage: React.FC = () => {

	let { id } = useLocalSearchParams<Params>();

	const insets = useSafeAreaInsets();

	const [authToken, setAuthToken] = useState('');
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
			setAuthToken(token ?? '');

			const contextStr = await AsyncStorage.getItem('context');
			const ctx = contextStr ? JSON.parse(contextStr) : {};
			setContext(ctx);
			setAuthenticated(ctx.user.isAuthenticated);

			if (token)
				getHotspot(token, id);
		}

		init();

	}, [id]);

	useEffect(() => {

		if (hotspots[0]) {
			setLikes(hotspots[0].likes);
			setLikedByMe(hotspots[0].likedByMe);
			setSubscribed(hotspots[0].subscribed);
		}

	}, [hotspots]);

	const getHotspot = async (token: string, id: string) => {

		console.log(`[HotspotPage.getHotspot] Getting hotspot ${id}`);

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				console.log('[HotspotPage.getHotspot] ', response);
				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			const data: Hotspot[] = await response.json();
			setHotspots(data);
			setLoaded(true);

			//Alert.alert('', JSON.stringify(data))
		} catch (error: any) {
			console.log('[ModalHotspot.getHotspot] ', error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

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
				<TouchableOpacity style={{ marginHorizontal: 10, marginVertical: 10 }} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.sectionTitle}>Hotspot</Text>
			</View>

			{loading && (<View><Text>Loading...</Text></View>)}

			{loaded && (
				<View style={styles.container}>

					{/* Name */}
					<Text style={styles.label}>{hotspots[0].name}</Text>
					<Text style={{ fontSize: 10, fontStyle: "italic", marginBottom: 8, color: "gray" }}>Created by {hotspots[0].owner}</Text>

					{/* Description */}
					<Text style={styles.label}>{hotspots[0].description}</Text>

					{/* Category */}
					{/* <Text style={styles.label}>{hotspots[0].category}</Text>*/}


						<View style={[styles.rowLeft, { marginVertical: 8 }]}>

							{/* Subscribe/unsubscribe */}
							{(!hotspots[0].ownedByMe && authenticated) &&
								(
									<HotspotSubscriptionButton
										hotspotId={hotspots[0].id}
										initialSubscribed={subscribed}
										onChange={(value) => console.log("New subscription state:", value)}
									/>
								)
							}

							{/* Likes */}
							{authenticated &&
								(
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

								)
							}
						</View>
						
				</View>
			)}
		</View >

	);
};

export default HotspotPage;
