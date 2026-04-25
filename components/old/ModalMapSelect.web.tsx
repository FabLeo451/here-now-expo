import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

let LeafletMap: React.FC<any> = () => null; // Fallback vuoto

const isClient = typeof window !== 'undefined';

if (isClient) {
	// Import dinamico solo lato client
	const L = require('leaflet');
	require('leaflet/dist/leaflet.css');
	delete L.Icon.Default.prototype._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
		shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
	});

	const {
		MapContainer,
		TileLayer,
		Marker,
		useMapEvents,
	} = require('react-leaflet');

	function LocationSelector({ onSelect }: { onSelect: (coords: { latitude: number; longitude: number }) => void }) {
		useMapEvents({
			click(e) {
				onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
			},
		});
		return null;
	}

	LeafletMap = function ({ latitude, longitude, onSelect, selectedCoords }: any) {
		return (
			<div style={{ height: 350, width: '100%', marginBottom: 10 }}>
				<MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; OpenStreetMap contributors'
					/>
					<LocationSelector onSelect={onSelect} />
					<Marker position={[selectedCoords?.latitude ?? latitude, selectedCoords?.longitude ?? longitude]} />
				</MapContainer>
			</div>
		);
	};
}

type Props = {
	visible: boolean;
	latitude: number;
	longitude: number;
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function ModalMapSelect({ visible, latitude, longitude, onSelect }: Props) {
	const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);

	const handleSelect = () => {
		if (selectedCoords) {
			onSelect(selectedCoords);
		}
	};

	const styles = StyleSheet.create({
		overlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		content: {
			width: 400,
			backgroundColor: 'white',
			padding: 10,
			borderRadius: 10,
		},
		closeButton: {
			position: 'absolute',
			top: 10,
			right: 10,
			zIndex: 1000,
		},
	});

	if (!isClient) {
		// Durante SSR, mostra solo loader o nulla
		return null;
	}

	return (
		<Modal visible={visible} transparent>
			<View style={styles.overlay}>
				<View style={styles.content}>
					<TouchableOpacity onPress={() => onSelect(null)} style={styles.closeButton}>
						<Ionicons name="close" size={24} color="black" />
					</TouchableOpacity>

					<Text style={{ marginBottom: 8 }}>Click on the map, then press Select</Text>

					<LeafletMap
						latitude={latitude}
						longitude={longitude}
						onSelect={setSelectedCoords}
						selectedCoords={selectedCoords}
					/>

					<Button onPress={handleSelect}>Select</Button>
				</View>
			</View>
		</Modal>
	);
}
