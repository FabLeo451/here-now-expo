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
import { styles } from "@/app/Style";
import { Hotspot } from '@/lib/hotspot'

function openInGoogleMaps(latitude: number, longitude: number) {
	const url = Platform.select({
		ios: `http://maps.apple.com/?ll=${latitude},${longitude}`,
		android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`, // apre direttamente l'app Maps
	});

	Linking.openURL(url ?? '');
}


type Props = {
	visible: boolean;
	id: string;
	onClose: () => void;
};

export default function ModalHotspot({ visible, id, onClose }: Props) {
	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [loading, setLoading] = useState(true);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const init = async () => {
			const token = await AsyncStorage.getItem('authToken');

			console.log('visible = ', visible, 'id = ', id);

			if (!visible)
				return;

			if (token)
				getHotspot(token, id);
		};

		init();
	}, [visible, id]);

	const getHotspot = async (token: string, id: string) => {

		console.log(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`);

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch hotspots');
			}

			const data: Hotspot[] = await response.json();
			setHotspots(data);
			setLoaded(true);

			//Alert.alert('', JSON.stringify(data))
		} catch (error: any) {
			console.log('[getMyHotspots] ', error);
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
			padding: 10,
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
						<Text style={{ fontWeight: "bold", marginBottom: 20 }}>{hotspots[0].name}</Text>
						<TouchableOpacity
							style={styles.rowLeft}
							onPress={() => {
								const { latitude, longitude } = hotspots[0].position;
								openInGoogleMaps(latitude, longitude);
							}}
						>
							<Ionicons name="location-outline" size={25} color="steelblue" />
							<Text>Open in Google Maps</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

		</Modal>
	);


}