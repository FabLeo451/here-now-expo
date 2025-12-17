import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Alert, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { styles } from "@/Style";

type Props = {
	hotspotId: string;                    // required
	initialLikedByMe?: boolean;          // optional default false
	initialLikes?: number;
	onChange?: (value: boolean) => void;  // optional callback
};

export const HotspotLikeButton: React.FC<Props> = ({
	hotspotId,
	initialLikedByMe = false,
	initialLikes = 0,
	onChange,
}) => {
	const [likes, setLikes] = useState<number>(initialLikes);
	const [likedByMe, setLikedByMe] = useState<boolean>(initialLikedByMe);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		//console.log(`[HotspotLikeButton.useEffect] Updating likes =,`, likes);
		//console.log(`[HotspotLikeButton.useEffect] Updating likedByMe = `, likedByMe);
	}, [likes, likedByMe]);

	const handleLike = async (like: boolean) => {
		if (loading) return;

		console.log('[LikeButton] like=', like);
		setLoading(true);

		const token = await AsyncStorage.getItem('authToken');
		if (!token) {
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${hotspotId}/like`,
				{
					method: like ? 'POST' : 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			setLikedByMe(like);
			setLikes(prev => like ? prev + 1 : prev - 1);
			onChange?.(like);

		} catch (error: any) {
			console.log('[LikeButton] Error:', error);
			Alert.alert('Error', error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
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
	);
};
