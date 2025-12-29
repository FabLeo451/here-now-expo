import React from 'react';
import {
	Text,
	View,
	StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { useAuth } from '@/hooks/useAuth';
import { useWebsocket } from "@/hooks/useWebsocket";

const DisconnectedPage: React.FC = () => {
	const insets = useSafeAreaInsets();
	const { token } = useAuth();
	const { connect } = useWebsocket();

	return (
		<View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
			<Ionicons
				name="cloud-offline-outline"
				size={72}
				color="#9ca3af"
				style={styles.icon}
			/>

			<Text style={styles.title}>Herenow disconnected</Text>

			<Text style={styles.subtitle}>
				Connection lost.
				Please check your network and try again.
			</Text>

			<View style={styles.buttonContainer}>
				<AppButton
					title="Reconnect"
					icon={<Ionicons name="wifi-outline" size={18} color="white" />}
					onPress={async () => {
						if (!token) return;
						try {
							await connect(token);
							router.replace('/');
						} catch (e) {
							console.log('Reconnect failed', e);
						}
					}}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		backgroundColor: '#ffffff',
	},
	icon: {
		marginBottom: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 8,
		color: '#111827',
	},
	subtitle: {
		fontSize: 15,
		color: '#6b7280',
		textAlign: 'center',
		marginBottom: 32,
	},
	buttonContainer: {
		width: '100%',
	},
});

export default DisconnectedPage;
