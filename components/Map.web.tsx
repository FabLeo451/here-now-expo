import React, { useState } from 'react';

let LeafletMap: React.FC<any> = () => null;

const isClient = typeof window !== 'undefined';

if (isClient) {
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

	function LocationSelector({ onSelect }: any) {
		useMapEvents({
			click(e: any) {
				onSelect({
					latitude: e.latlng.lat,
					longitude: e.latlng.lng,
				});
			},
		});
		return null;
	}

	LeafletMap = function ({
		markerCoords,
		onSelect,
		selectedCoords,
	}: any) {
		return (
			<div style={{ height: '100vh', width: '100%' }}>
				<MapContainer
					center={[markerCoords.latitude, markerCoords.longitude]}
					zoom={15}
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; OpenStreetMap contributors"
					/>

					<LocationSelector onSelect={onSelect} />

					<Marker
						position={[
							selectedCoords?.latitude ?? markerCoords.latitude,
							selectedCoords?.longitude ?? markerCoords.longitude,
						]}
					/>
				</MapContainer>
			</div>
		);
	};
}

type Props = {
	markerCoords: { latitude: number; longitude: number } | null;
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function Map({
	markerCoords,
	onSelect,
}: Props) {
	const [selectedCoords, setSelectedCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	if (!isClient) return null;

	return (
		<LeafletMap
			markerCoords={markerCoords}
			onSelect={(coords: any) => {
				setSelectedCoords(coords);
				onSelect(coords);
			}}
			selectedCoords={selectedCoords}
		/>
	);
}