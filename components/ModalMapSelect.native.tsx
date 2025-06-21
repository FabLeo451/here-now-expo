import React, { useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	Modal,
	StyleSheet
} from 'react-native';
import { Text, Button } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

type Props = {
	visible: boolean;
	latitude: number;
	longitude: number;
	//onClose: () => void;
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function ModalMapSelect({ visible, latitude, longitude, onSelect }: Props) {
	const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);

	const handleMapPress = (e: MapPressEvent) => {
		const coords = e.nativeEvent.coordinate;
		setSelectedCoords(coords);
	};

	const handleSelect = () => {
		if (selectedCoords) {
		onSelect(selectedCoords); // Passa le coordinate al componente padre
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

	//console.log('[ModalMapSelect] Initial coords: ', latitude, longitude);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={() => onSelect(selectedCoords || { latitude, longitude })}
		>

			<View style={stylesModal.overlay}>
				<View style={stylesModal.content}>

					<TouchableOpacity onPress={() => onSelect(null)} style={stylesModal.closeButton}>
					<Ionicons name="close" size={24} color="black" />
					</TouchableOpacity>		

					<Text style={stylesModal.text}>Touch the map, then hit "Select"</Text>
					<MapView
						style={stylesModal.map}
						initialRegion={{
							latitude,
							longitude,
							latitudeDelta: 0.005,
							longitudeDelta: 0.005,
						}}
						onPress={handleMapPress}
					>
						<Marker coordinate={selectedCoords ?? { latitude, longitude }} />
					</MapView>
	  				<Button onPress={handleSelect} >Select</Button>
				</View>
			</View>

		</Modal>
	);


}