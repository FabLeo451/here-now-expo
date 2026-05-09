import React, { useState } from 'react';
import { Hotspot } from '@/lib/hotspot'

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
		hotspots,
		onSelect,
		selectedCoords,
		onBoundsChange,
		onHotspotSelect
	}: any) {
		const hotspotIcon = L.divIcon({
			className: '',
			html: `
				<div style="
					filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.8));
				">
					<img
						src="/images/markers/green.png"
						style="
							width: 50px;
							height: 50px;
						"
					/>
				</div>
			`,
			iconSize: [50, 50],
			iconAnchor: [20, 40],
		});

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
							color="red"
							position={[
								selectedCoords.latitude,
								selectedCoords.longitude,
							]}
						/>
					)}

					// Hotspots
					{hotspots.map((hotspot: Hotspot) => (
						<Marker 
							key={hotspot.id}
							position={[
								hotspot.position.latitude,
								hotspot.position.longitude,
							]}
							icon={hotspotIcon}
							eventHandlers={{
								click: () => {
									onHotspotSelect(hotspot);
								},
							}}
						/>
					))}
				</MapContainer>
			</div>
		);
	};
}

type Props = {
	userCoords: { latitude: number; longitude: number } | null;
	hotspots: Hotspot[];
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
	onBoundsChange?: (bounds: {
		northEast: { latitude: number; longitude: number };
		southWest: { latitude: number; longitude: number };
	}) => void;
	onHotspotSelect: (hotspot: Hotspot) => void;
};

export default function Map({
	userCoords,
	hotspots,
	onSelect,
	onBoundsChange,
	onHotspotSelect
}: Props) {
	const [selectedCoords, setSelectedCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	if (!isClient) return null;

	console.log('[Map.web] hotspots =', hotspots);

	return (
		<LeafletMap
			userCoords={userCoords}
			hotspots={hotspots}
			onSelect={(coords: any) => {
				setSelectedCoords(coords);
				onSelect(coords);
			}}
			selectedCoords={selectedCoords}
			onBoundsChange={onBoundsChange}
			onHotspotSelect={onHotspotSelect}
		/>
	);
}
