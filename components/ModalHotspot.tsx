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
import { router, useLocalSearchParams } from 'expo-router';
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
	hotspot: Hotspot | null;
	onClose: () => void;
};

export default function ModalHotspot({ visible, hotspot, onClose }: Props) {

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

				<View style={stylesModal.overlay}>
					<View style={stylesModal.content}>
						<TouchableOpacity onPress={() => onClose()} style={stylesModal.closeButton}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>

						<Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 5 }}>{hotspot?.name}</Text>
						<Text style={{ fontSize: 10, fontStyle: "italic", marginBottom: 8, color: "gray" }}>Created by {hotspot ? hotspot.owner : ""}</Text>
						<Text style={{ fontSize: 12, marginBottom: 8, color: "slategray" }}>{hotspot?.description}</Text>
						
						{/* Open details page */}
						<TouchableOpacity
							style={[styles.rowLeft, { marginVertical: 8 }]}
							onPress={() => {
								if (hotspot)
									router.navigate(`/hotspot/${hotspot.id}`);
							}}
						>
							<Ionicons name="clipboard-outline" size={25} color="green" />
							<Text>Open hotspot page</Text>
						</TouchableOpacity>
						
						{/* Open in Maps */}
						<TouchableOpacity
							style={[styles.rowLeft, { marginVertical: 8 }]}
							onPress={() => {
								if (!hotspot)
									return;

								const { latitude, longitude } = hotspot.position;
								openInGoogleMaps(latitude, longitude);
							}}
						>
							<Ionicons name="location-outline" size={25} color="steelblue" />
							<Text>Open in Maps</Text>
						</TouchableOpacity>

					</View>
				</View>


		</Modal>
	);
}
