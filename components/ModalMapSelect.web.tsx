import { View, Text } from 'react-native';

type Props = {
	visible: boolean;
	latitude: number;
	longitude: number;
	//onClose: () => void;
	onSelect: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function ModalMapSelect({ visible, latitude, longitude, onSelect }: Props) {

		return (
			<View>
				<Text>Maps not supported on Web</Text>
				{/* Oppure qui potresti usare una WebView con una mappa JS tipo Leaflet o Google Maps */}
			</View>
		);
}
