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
		useMap,
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

	const getUserIcon = (accuracy?: number) => {
		const color = accuracy && accuracy > 50 ? "#8e8e93" : "#007aff";

		return L.divIcon({
			className: '',
			html: `
				<div style="position: relative;">
					<div style="
						width: 16px;
						height: 16px;
						background: ${color};
						border-radius: 50%;
						border: 3px solid white;
					"></div>
				</div>
			`,
			iconSize: [16, 16],
			iconAnchor: [8, 8],
		});
	};

	function BoundsListener({ onChange }: any) {
		const map = useMap();

		useMapEvents({
			moveend: () => {
				if (!onChange) return;

				const bounds = map.getBounds();

				onChange({
					northEast: { latitude: bounds.getNorthEast().lat, longitude: bounds.getNorthEast().lng },
					southWest: { latitude: bounds.getSouthWest().lat, longitude: bounds.getSouthWest().lng },
				});
			},
		});

		return null;
	}

	LeafletMap = function ({
		userCoords,
		onSelect,
		selectedCoords,
		onBoundsChange,
	}: any) {
		return (
			<div style={{ height: '100vh', width: '100%' }}>
				<MapContainer
					center={
						userCoords
							? [userCoords.latitude, userCoords.longitude]
							: [0, 0]
					}
					zoom={15}
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; OpenStreetMap contributors"
					/>

					<LocationSelector onSelect={onSelect} />

					<BoundsListener onChange={onBoundsChange} />

					{userCoords && (
						<Marker
							position={[
								userCoords.latitude,
								userCoords.longitude,
							]}
							icon={getUserIcon(userCoords.accuracy)}
						/>
					)}

					{selectedCoords && (
						<Marker
							position={[
								selectedCoords.latitude,
								selectedCoords.longitude,
							]}
						/>
					)}
				</MapContainer>
			</div>
		);
	};
}

type Props = {
	userCoords: { latitude: number; longitude: number } | null;
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
	onBoundsChange?: (bounds: {
		northEast: { latitude: number; longitude: number };
		southWest: { latitude: number; longitude: number };
	}) => void;
};

export default function Map({
	userCoords,
	onSelect,
	onBoundsChange,
}: Props) {
	const [selectedCoords, setSelectedCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	if (!isClient) return null;

	return (
		<LeafletMap
			userCoords={userCoords}
			onSelect={(coords: any) => {
				setSelectedCoords(coords);
				onSelect(coords);
			}}
			selectedCoords={selectedCoords}
			onBoundsChange={onBoundsChange}
		/>
	);
}
