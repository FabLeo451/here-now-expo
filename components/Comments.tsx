import React, { useState, useEffect } from 'react';
import { FlatList, Alert, View, Text, TextInput, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "@/Style";
import { AppButton } from '@/components/AppButton';

const commentsLimit = Number(process.env.EXPO_PUBLIC_COMMENTS_LIMIT) || 10;

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
	const [readMore, setReadMore] = useState(true);
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

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${hotspotId}/comments?limit=${commentsLimit}&offset=${offset}`, {
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
			} else
				setReadMore(false);
			
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
			setMessage("");

		} catch (error: any) {
			console.log('[Comments] Error:', error);
			Alert.alert('Error', error.message);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<View style={{ flex: 1 }}>
			{context?.user.isAuthenticated && (
				<View>
					<TextInput
						style={[styles.textArea, {height: 70,}]}
						multiline={true}
						numberOfLines={3}
						value={message}
						onChangeText={setMessage}
					/>
					<View style={{ marginVertical: 10, width: 150 }}>
						<AppButton
							title="Add comment"
							disabled={updating}
							loading={updating}
							onPress={handleAddComment}
						/>
					</View>
				</View>
			)}

			<FlatList
				data={comments}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<CommentComponent comment={item} />
				)}
				ListFooterComponent={
					loading ? (
						<Text style={{ textAlign: 'center', padding: 8 }}>
							Loading comments...
						</Text>
					) : readMore ? (
						<Pressable
							onPress={() => getComments(hotspotId)}
							style={{
								backgroundColor: '#cececeff',
								padding: 2,
								borderRadius: 4,
								justifyContent: 'center',
								alignItems: 'center',
								marginVertical: 8,
							}}
						>
							<Ionicons name="chevron-down-outline" size={22} color="#333" />
						</Pressable>
					) : null
				}
			/>

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
