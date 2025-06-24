import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	Modal,
	StyleSheet
} from 'react-native';
import { Text, Button } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

type Props = {
	visible: boolean;
	onClose: () => void;
};

export default function ModalHotspot({ visible, onClose }: Props) {

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
					<Text>Hotspot</Text>
				</View>
			</View>

		</Modal>
	);


}