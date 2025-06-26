import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Linking, Platform } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import PulsingCircle from '@/components/PulsingCircle'
import ModalHotspot from '@/components/ModalHotspot'

type LatLng = {
	latitude: number;
	longitude: number;
};

type Hotspot = {
	id: string;
	name: string;
	position: LatLng;
	startTime?: string;
	endTime?: string;
}

type MapProps = {
	markerCoords: LatLng;
	hotspots: Hotspot[];
};

export default function Map({ markerCoords, hotspots }: MapProps) {
	const [modalVisible, setModalVisible] = useState<{ visible: boolean; id: string }>({
		visible: false,
		id: '',
	});

	const mapRef = useRef<MapView>(null);
	const [screenPositions, setScreenPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
	const [mapMoving, setMapMoving] = useState(false);

	const { width, height } = Dimensions.get('window');
	const ASPECT_RATIO = width / height;
	const LATITUDE_DELTA = 0.005;
	const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

	useEffect(() => {

	}, [hotspots]);

	return (
		<View style={styles.mapContainer}>
			<ModalHotspot
				visible={modalVisible.visible}
				id={modalVisible.id}
				onClose={() => {
					setModalVisible({ visible: false, id: 'dummyId' });
				}}
			/>


			<MapView
				ref={mapRef}
				provider="google"
				style={styles.map}
				initialRegion={{
					latitude: markerCoords.latitude,
					longitude: markerCoords.longitude,
					latitudeDelta: LATITUDE_DELTA,
					longitudeDelta: LONGITUDE_DELTA,
				}}
				onRegionChange={() => {
					setMapMoving(true);
				}}
				onRegionChangeComplete={async () => {
					if (!mapRef.current) return;
					const newPositions: typeof screenPositions = {};
					for (const h of hotspots) {
						const point = await mapRef.current?.pointForCoordinate(h.position);
						if (point) {
							newPositions[h.id] = point;
						}
					}
					setScreenPositions(newPositions);
					setMapMoving(false);
				}}
			>
				{/* Marker user */}
				<Marker coordinate={markerCoords} title="Your position" />

				{hotspots.map((h) => (
					<PulsingCircle
						key={h.id}
						center={{ latitude: h.position.latitude, longitude: h.position.longitude }}
						onPress={() => setModalVisible({ visible: true, id: h.id })}
					/>
				))}
			</MapView>

			{/* Hotspot names */}
			{!mapMoving && (
				hotspots.map((h) => {
					const pos = screenPositions[h.id];
					if (!pos) return null;
					return (
						<View
							key={`label-${h.id}`}
							style={[
								styles.hotspotLabelOverlay,
								{ left: pos.x - 50, top: pos.y - 12 },
							]}
							pointerEvents="none"
						>
							<Text style={styles.hotspotText}>{h.name}</Text>
						</View>
					);
				})

			)}



		</View>
	);
}

const styles = StyleSheet.create({
	mapContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	map: {

		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	hotspotLabelOverlay: {
		position: 'absolute',
		backgroundColor: 'rgba(255,255,255,0.85)',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
		borderWidth: 0.5,
		borderColor: '#000',
		shadowColor: '#000',
		shadowOpacity: 0.3,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
		elevation: 2,
		maxWidth: 100,
		alignItems: 'center',
	},

	hotspotText: {
		fontSize: 12,
		color: '#000',
		textAlign: 'center',
		fontWeight: '500',
	},

});
