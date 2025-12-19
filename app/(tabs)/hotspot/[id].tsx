import React, { useEffect, useState, useRef } from 'react';
import {
	Alert,
	View,
	TextInput,
	TouchableOpacity,
	Pressable
} from 'react-native';
import { router } from 'expo-router';
import { Layout, Text, TextProps, Input, Button, Spinner } from '@ui-kitten/components';
import { styles } from "@/Style";
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Hotspot, Category } from '@/lib/hotspot'
import { HotspotSubscriptionButton } from '@/components/HotspotSubscriptionButton';
import { HotspotLikeButton } from '@/components/HotspotLikeButton';
import { Comments } from '@/components/Comments';
import { AppButton } from '@/components/AppButton';
import { Share } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import type MapView from 'react-native-maps';
import Map from '@/components/Map';

type Params = {
	id: string;
};

const HotspotPage: React.FC = () => {

	let { id } = useLocalSearchParams<Params>();

	const insets = useSafeAreaInsets();

	const { user, token } = useAuth();
	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [likes, setLikes] = useState<number>(0);
	const [likedByMe, setLikedByMe] = useState<boolean>(false);
	const [loading, setLoading] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const [subscribed, setSubscribed] = useState<boolean>(false);
	const [notFound, setNotFound] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);
	const [targetCoords, setTargetCoords] = useState(null);
	const mapRef = useRef<MapView>(null);

	useEffect(() => {

		const init = async () => {
			if (token)
				getHotspot(token, id);
		}

		init();

	}, [id]);

	const getHotspot = async (token: string, id: string) => {

		console.log(`[HotspotPage.getHotspot] Getting hotspot ${id}`);

		setError(false)

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			//console.log('[HotspotPage.getHotspot] response =', response);

			if (response.ok) {
				const data: Hotspot[] = await response.json();
				setHotspots(data);

				setLikes(data[0].likes);
				setLikedByMe(data[0].likedByMe);
				setSubscribed(data[0].subscribed);
				setTargetCoords({
					latitude: data[0].position.latitude,
					longitude: data[0].position.longitude,
				});

				setLoaded(true);
			} else {
				//console.log('[HotspotPage.getHotspot] ', response);

				if (response.status == 404)
					setNotFound(true);
				else
					setError(true);
			}

			//Alert.alert('', JSON.stringify(data))
		} catch (error: any) {
			console.log('[HotspotPage.getHotspot] ', error);
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	const shareHotspot = async (hotspot: Hotspot) => {
		try {
			const message = `📍 Take a look at this hotspot!
				${hotspot.name}

				https://ekhoes.com/herenow/hotspot/${hotspot.id}
				`;

			await Share.share({
				message,
			});
		} catch (error) {
			console.log('Share error:', error);
		}
	};

	return (
		<View style={{
			paddingTop: insets.top,
			paddingBottom: insets.bottom,
			paddingLeft: insets.left,
			paddingRight: insets.right,
			flex: 1,
			backgroundColor: '#f0f0f0',
		}}>

			{loading && (<View><Text>Loading...</Text></View>)}

			{error && (
				<View style={{ marginTop: 50, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
					<Ionicons name="alert-circle-outline" size={30} color="red" />
					<Text style={{ fontSize: 20, fontWeight: "bold" }}>Unable to retrieve hotspot</Text>
					<AppButton
						title="Retry"
						icon={<Ionicons name="refresh-outline" size={18} color="white" />}
						onPress={() => {
							if (token) getHotspot(token, id);
						}}
					/>
				</View>
			)}

			{notFound && (
				<View style={{ marginTop: 50, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
					<Text style={{ fontSize: 25, fontWeight: "bold" }}>Hotspot not found</Text>
					<AppButton
						title="Home"
						icon={<Ionicons name="home-outline" size={18} color="white" />}
						onPress={() => {
							router.replace('/(tabs)')
						}}
					/>
				</View>
			)}

			{(loaded) && (
				<>
					<View style={{ height: 250 }}>
						<Map
							mapRef={mapRef}
							//initialCoords={targetCoords ? targetCoords : markerCoords} 
							initialCoords={targetCoords}
							markerCoords={targetCoords} 
							hotspots={hotspots}
							onMapReady={() => {
								console.log('[map] Map ready');
								//setMapReady(true);
							}}
							onRegionChangeCompleteBounds={(boundaries: Boundaries) => {
								//console.log("Visible map:", boundaries);
								//sendMapBoundaries(boundaries);
							}}
						/>
					</View>
					<View style={styles.container}>

						{/* Name */}
						<Text style={{ fontSize: 20, fontWeight: "bold" }}>{hotspots[0].name}</Text>
						<Text style={{ fontSize: 10, fontStyle: "italic", marginBottom: 14, color: "dimgray" }}>Created by {hotspots[0].owner}</Text>

						{/* Description */}
						<Text>{hotspots[0].description}</Text>

						{/* Category */}
						{/* <Text style={styles.label}>{hotspots[0].category}</Text>*/}

						<View style={[styles.row, { marginVertical: 8 }]}>

							<AppButton
								title="View on map"
								icon={<Ionicons name="map-outline" size={15} color="white" />}
								onPress={() => {
									const h = hotspots[0];
									router.push({
										pathname: '/map',
										params: {
											hotspotId: String(h.id),
											targetLatitude: String(h.position.latitude),
											targetLongitude: String(h.position.longitude),
										},
									});
								}}
							/>

							{/* Likes */}
							{user?.isAuthenticated &&
								(
									<HotspotLikeButton
										hotspotId={hotspots[0].id}
										initialLikedByMe={likedByMe}
										initialLikes={likes}
										onChange={(value) => console.log("Liked by me:", value)}
									/>
								)
							}

							{/* Share */}
							<TouchableOpacity onPress={() => { shareHotspot(hotspots[0]) }} >
								<Ionicons name="share-social-outline" size={25} color="green" />
							</TouchableOpacity>


							{/* Subscribe/unsubscribe */}
							{(!hotspots[0].ownedByMe && user?.isAuthenticated) &&
								(
									<HotspotSubscriptionButton
										hotspotId={hotspots[0].id}
										initialSubscribed={subscribed}
										onChange={(value) => console.log("New subscription state:", value)}
									/>
								)
							}
						</View>

						{/* Comments */}
						{user?.isAuthenticated &&
							(
								<Comments hotspotId={hotspots[0].id} />
							)
						}

					</View>
				</>
			)}
		</View >

	);
};

export default HotspotPage;
