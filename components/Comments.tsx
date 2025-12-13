import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Alert, View, Text, TextInput, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "@/Style";
import { AppButton } from '@/components/AppButton';

interface HotspotComment {
	id: number;
	hotspotId: string | null;
	userId: string | null;
	userName: string | null;
	message: string;
	created: string;  // ISO datetime string
	updated: string;  // ISO datetime string
}

type Props = {
	hotspotId: string; // required
};

export const Comments: React.FC<Props> = ({
	hotspotId,
}) => {
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [offset, setOffset] = useState(-1);
	const [message, setMessage] = useState('');
	const [comments, setComments] = useState<HotspotComment[]>([]);
	const [context, setContext] = useState(null);

	useEffect(() => {

		const init = async () => {

			const contextStr = await AsyncStorage.getItem('context');
			const ctx = contextStr ? JSON.parse(contextStr) : {};
			setContext(ctx);

			//console.log('[Comments] ctx =', ctx);

			getComments(hotspotId);
		}

		init();

	}, [hotspotId]);

	const getComments = async (hotspotId: string) => {

		try {
			setLoading(true);

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${hotspotId}/comments?limit=2&offset=${offset}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					//Authorization: token,
				},
			});

			if (!response.ok) {
				console.log(response)
				throw new Error('Failed to fetch: ' + response.status + ' ' + response.statusText);
			}

			const data: HotspotComment[] = await response.json();

			if (data) {
				setComments(prev => [...prev, ...data]);
				//console.log('[comments]', JSON.stringify(data))

				// Update offset

				let minOffset = offset;

				for (let i=0; i<data.length; i++) {
					if (data[i].id < minOffset || minOffset == -1)
						minOffset = data[i].id
				}

				setOffset(minOffset);
				console.log('[Comments] minOffset =', minOffset);
			}
			
		} catch (error: any) {
			console.log('[getMyHotspots] ', error);
			Alert.alert('Error getting my hotspots', error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleAddComment = async () => {
		if (updating) return;

		//console.log('[Comments] message =', message);
		setUpdating(true);

		const token = await AsyncStorage.getItem('authToken');
		if (!token) {
			setUpdating(false);
			return;
		}

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${hotspotId}/comment`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token,
					},
					body: JSON.stringify({
						userId: context?.user.id,
						message: message,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Error ' + response.status + ' ' + response.statusText);
			}

			const data: HotspotComment = await response.json();
			data.userName = context?.user.name;
			//console.log('[Comments] data:', data);

			setComments(prevComments => [data, ...prevComments]);

		} catch (error: any) {
			console.log('[Comments] Error:', error);
			Alert.alert('Error', error.message);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<View>
			{context?.user.isAuthenticated && (
				<View>
					<TextInput
						style={styles.textArea}
						multiline={true}
						numberOfLines={4}
						value={message}
						onChangeText={setMessage}
					/>
					<View style={{ marginVertical: 10, width: 150 }}>
						<AppButton
							title="Add comment"
							disabled={updating}
							onPress={handleAddComment}
						/>
					</View>
				</View>
			)}

			<View>
				{
					comments?.map((c) => (
						<CommentComponent key={c.id} comment={c} />
					))
				}
			</View>

			<View style={{ marginTop: 10 }}>
				{loading ? (<Text>Loading comments...</Text>) : (
					<Pressable
						onPress={() => getComments(hotspotId)}
						style={{
							backgroundColor: '#cececeff',
							padding: 2,
							borderRadius: 4,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Ionicons name="chevron-down-outline" size={22} color="#333" />
					</Pressable>
				)}
			</View>
		</View>
	);
};

function formatDateGlobal(isoString: string): string {
	const date = new Date(isoString);

	if (isNaN(date.getTime())) {
		return "Invalid date";
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

const CommentComponent = ({
	comment
}: {
	comment: HotspotComment;
}) => (
	<View style={{ marginTop: 20 }}>
		<View style={styles.rowLeft}>
			<Text style={{ fontWeight: 'bold' }}>{comment.userName}</Text>
			<Text style={{ color: 'gray' }}>{formatDateGlobal(comment.created)}</Text>
		</View>
		<Text style={{ marginTop: 5, fontStyle: 'italic' }}>{comment.message}</Text>
	</View>
);
