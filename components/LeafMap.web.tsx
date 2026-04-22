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
		latitude,
		longitude,
		onSelect,
		selectedCoords,
	}: any) {
		return (
			<div style={{ height: '100vh', width: '100%' }}>
				<MapContainer
					center={[latitude, longitude]}
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
							selectedCoords?.latitude ?? latitude,
							selectedCoords?.longitude ?? longitude,
						]}
					/>
				</MapContainer>
			</div>
		);
	};
}

type Props = {
	latitude: number;
	longitude: number;
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function LeafMap({
	latitude,
	longitude,
	onSelect,
}: Props) {
	const [selectedCoords, setSelectedCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	if (!isClient) return null;

	return (
		<LeafletMap
			latitude={latitude}
			longitude={longitude}
			onSelect={(coords: any) => {
				setSelectedCoords(coords);
				onSelect(coords);
			}}
			selectedCoords={selectedCoords}
		/>
	);
}