import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { Hotspot, Category } from '@/lib/hotspot'
import { HotspotSubscriptionButton } from '@/components/HotspotSubscriptionButton';
import { HotspotLikeButton } from '@/components/HotspotLikeButton';
import { Comments } from '@/components/Comments';

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
	const [notFound, setNotFound] = useState<boolean>(false);

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

			//console.log('[HotspotPage.getHotspot] response =', response);

			if (response.ok) {
				const data: Hotspot[] = await response.json();
				setHotspots(data);
				setLoaded(true);

			} else {
				//console.log('[HotspotPage.getHotspot] ', response);

				if (response.status == 404)
					setNotFound(true);

				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			//Alert.alert('', JSON.stringify(data))
		} catch (error: any) {
			console.log('[HotspotPage.getHotspot] ', error);
		} finally {
			setLoading(false);
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
				<TouchableOpacity style={{ marginHorizontal: 10, marginVertical: 10 }} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.sectionTitle}>Hotspot</Text>
			</View>

			{loading && (<View><Text>Loading...</Text></View>)}

			{notFound && (
				<View style={{ marginTop:50, justifyContent: 'center', alignItems: 'center'}}>
					<Text style={{ fontSize: 25, fontWeight: "bold" }}>Not found</Text>
				</View>
			)}

			{(loaded && !notFound) && (
				<View style={styles.container}>

					{/* Name */}
					<Text style={styles.sectionTitle}>{hotspots[0].name}</Text>
					<Text style={{ fontSize: 10, fontStyle: "italic", marginBottom: 8, color: "gray" }}>Created by {hotspots[0].owner}</Text>

					{/* Description */}
					<Text>{hotspots[0].description}</Text>

					{/* Category */}
					{/* <Text style={styles.label}>{hotspots[0].category}</Text>*/}


					<View style={[styles.row, { marginVertical: 8 }]}>

<Pressable
    disabled={!hotspots?.length}
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
    style={({ pressed }) => [
        {
            backgroundColor: pressed ? '#0056b3' : '#007bff',
            padding: 10,
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: !hotspots?.length ? 0.5 : 1,
        },
    ]}
>
    <View style={styles.row}>
        <Ionicons name="map-outline" size={18} color="white" />
        <Text style={{ color: 'white' }}>View on map</Text>
    </View>
</Pressable>


						{/* Likes */}
						{authenticated &&
							(
								<HotspotLikeButton
									hotspotId={hotspots[0].id}
									initialLikedByMe={likedByMe}
									initialLikes={likes}
									onChange={(value) => console.log("Liked by me:", value)}
								/>
							)
						}

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
					</View>

					{/* Comments */}
					{authenticated &&
						(
							<Comments hotspotId={hotspots[0].id} />
						)
					}

				</View>
			)}
		</View >

	);
};

export default HotspotPage;
