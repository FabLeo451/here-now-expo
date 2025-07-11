import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, Linking, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import PulsingCircle from '@/components/PulsingCircle'
import ModalHotspot from '@/components/ModalHotspot'
import { Hotspot } from '@/lib/hotspot'

type LatLng = {
	latitude: number;
	longitude: number;
};

type MapProps = {
	markerCoords: LatLng;
	hotspots: Hotspot[];
	onRegionChangeCompleteBounds?: (bounds: {
		northEast: LatLng;
		southWest: LatLng;
	}) => void;
};

export default function Map({ markerCoords, hotspots, onRegionChangeCompleteBounds }: MapProps) {
	const [modalVisible, setModalVisible] = useState<{ visible: boolean; id: string }>({
		visible: false,
		id: '',
	});

	const mapRef = useRef<MapView>(null);
	const [screenPositions, setScreenPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
	const [mapMoving, setMapMoving] = useState(false);
	const [mapReady, setMapReady] = useState<boolean>(false);

	const { width, height } = Dimensions.get('window');
	const ASPECT_RATIO = width / height;
	const LATITUDE_DELTA = 0.005;
	const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

	useEffect(() => {
		console.log("[Map.native] Hotspots updated in <Map />:", hotspots);
		repositionHotspots();
	}, [mapReady, hotspots]);

	/**
	 * Used on Android to get around the cutted text issue
	 */
	async function repositionHotspots() {

		if (Platform.OS !== 'android')
			return;
		
		console.log('[Map.native] repositionHotspots, hotspots:', hotspots.length)

		const newPositions: typeof screenPositions = {};

		if (hotspots) {
			for (const h of hotspots) {
				const point = await mapRef.current?.pointForCoordinate(h.position);
				if (point) {
					newPositions[h.id] = point;
				}
			}
		}

		setScreenPositions(newPositions);

	}

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
				onMapReady={async () => {

					console.log('[Map.native] Map loaded');
					const boundaries = await mapRef.current?.getMapBoundaries();

					if (boundaries && typeof onRegionChangeCompleteBounds === 'function') {
						onRegionChangeCompleteBounds(boundaries);
					}

					setMapReady(true);

				}}
				onRegionChange={() => {
					setMapMoving(true);
				}}
				onRegionChangeComplete={async () => {
					const map = mapRef.current;

					if (!map) return;

					//repositionHotspots();
					

					const boundaries = await map.getMapBoundaries();
					// boundaries:
					// {
					//   northEast: { latitude, longitude },
					//   southWest: { latitude, longitude }
					// }

					if (typeof onRegionChangeCompleteBounds === 'function') {
						onRegionChangeCompleteBounds(boundaries);
					}

					setMapMoving(false);
				}}
			>
				{/* Marker user */}
				<Marker coordinate={markerCoords} title="Your position">
					<Image
						source={require('../assets/images/user.png')}
						style={{ width: 38, height: 38 }}
					/>
				</Marker>

				{hotspots && (
					hotspots.map((h) => (
						<View key={h.id}>
							<PulsingCircle

								center={{ latitude: h.position.latitude, longitude: h.position.longitude }}
								onPress={() => setModalVisible({ visible: true, id: h.id })}
							/>

							{/* On iOs use a regular marker (on Android the text is cutted off) */}
							{Platform.OS === 'ios' && (
								<Marker
									coordinate={h.position}
								>
									<View style={styles.hotspotLabelOverlay}>
										<Text style={styles.hotspotText}>{h.name}</Text>
									</View>
								</Marker>
							)}
						</View>
					))
				)}
			</MapView>

			{/* Hotspot names on Android to skip cutting bug */}
			{(Platform.OS === 'android' && hotspots && !mapMoving) && (
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
