import React, { useState } from 'react';
import { Text, Platform, Linking } from 'react-native';
import * as Device from 'expo-device';
import { Alert, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Layout, TextProps, Input, Button, Spinner } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontAwesome } from '@expo/vector-icons';
import { styles } from '@/Style';

const getDeviceType = () => {
	switch (Device.deviceType) {
		case Device.DeviceType.PHONE:
			return 'Phone';
		case Device.DeviceType.TABLET:
			return 'Tablet';
		case Device.DeviceType.DESKTOP:
			return 'Desktop';
		case Device.DeviceType.TV:
			return 'TV';
		case Device.DeviceType.UNKNOWN:
		default:
			return 'Unknown';
	}
};

const validateEmail = (email: string): boolean => {
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
};


export default function LoginScreen() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [guestName, setGuestName] = useState('');

	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [guestNameError, setGuestNameError] = useState('');

	const [loading, setLoading] = useState(false);
	const insets = useSafeAreaInsets();





	const getDeviceInfo = () => {
		const name = Constants.manifest?.name ?? Constants.expoConfig?.name ?? 'unknown';
		const version = Constants.manifest?.version ?? Constants.expoConfig?.version ?? 'unknown';
		const agent = name + '/' + version;
		const platform = Platform.OS + ' ' + Platform.Version;
		const model = Device.modelName || 'Undefined';
		const deviceName = Device.deviceName || 'Undefined';
		const deviceType = getDeviceType();

		return { agent, platform, model, deviceName, deviceType };
	};

	const handleLogin = async () => {
		let valid = true;

		if (!validateEmail(email)) {
			setEmailError('Email non valida');
			valid = false;
		} else {
			setEmailError('');
		}

		if (password.trim() === '') {
			setPasswordError('Password non può essere vuota');
			valid = false;
		} else {
			setPasswordError('');
		}

		if (!valid) return;

		setLoading(true);
		const { agent, platform, model, deviceName, deviceType } = getDeviceInfo();

		try {

			console.log('[login] Logging in...', `${process.env.EXPO_PUBLIC_API_BASE_URL}/login`);

			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, agent, platform, model, deviceName, deviceType }),
			});

			if (!response.ok) {
				throw new Error('Email o password errati');
			}

			type LoginResponse = {
				token: string;
				name: string;
			};

			const data = await response.json() as LoginResponse;

			console.log('[login] Authenticated');

			await AsyncStorage.setItem('authToken', data.token);

			const context = {
				user: {
					name: data.name,
					isGuest: false,
					isAuthenticated: true
				}
			};

			console.log('context = ', context);

			await AsyncStorage.setItem('context', JSON.stringify(context));

			/*setTimeout(() => {
				console.log('[login] Redirecting...');
				router.replace('/(tabs)');
			}, 1000)*/
			
			//setLoggedIn(true);
			router.replace('/(tabs)');

		} catch (error) {
			//console.log('[login]', error)
			const message = error instanceof Error ? error.message : 'Unknown error';
			const cause = error instanceof Error ? error.cause : 'Unknown cause';
			Alert.alert('Access error:', message + '\n' + cause);
		} finally {
			setLoading(false);
		}
	};

	const handleGuestLogin = async () => {
		if (!guestName.trim()) {
			setGuestNameError('Inserisci un nome per accedere come ospite.');
			return;
		} else {
			setGuestNameError('');
		}

		setLoading(true);
		const { agent, platform, model, deviceName, deviceType } = getDeviceInfo();

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/login?guest`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: guestName, agent, platform, model, deviceName, deviceType }),
			});

			if (!response.ok) {
				throw new Error('Errore nel login ospite');
			}

			const data = await response.json();

			await AsyncStorage.setItem('authToken', data.token);

			const context = {
				user: {
					name: guestName,
					isGuest: true,
					isAuthenticated: false
				}
			};

			await AsyncStorage.setItem('context', JSON.stringify(context));

			router.replace('/(tabs)');

		} catch (error) {
			//console.log('[login]', error)
			const message = error instanceof Error ? error.message : 'Unknown error';
			Alert.alert('Access error:', message);
		} finally {
			setLoading(false);
		}
	};

	return (
	<View style={{
		paddingTop: insets.top,
		paddingBottom: insets.bottom,
		paddingLeft: insets.left,
		paddingRight: insets.right,
		flex: 1,
		backgroundColor: '#f0f0f0',
	  }}
	>
		<Layout style={styles.container}>
			<Text style={styles.mainTitle}>HereN<FontAwesome name="wifi" size={22} color="#000" />w</Text>

			<Input
				placeholder="Email"
				style={[styles.input, { marginBottom: 10 }]}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				textContentType="emailAddress"
				status={emailError ? 'danger' : 'basic'}
				caption={emailError}
			/>

			<Input
				placeholder="Password"
				style={[styles.input, { marginBottom: 10 }]}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				textContentType="password"
				status={passwordError ? 'danger' : 'basic'}
				caption={passwordError}
				autoCapitalize="none"
			/>

			<Button
				style={styles.button}
				onPress={handleLogin}
				disabled={loading}
				accessoryRight={loading ? () => <LoadingIndicator /> : undefined}
			>
				Log in
			</Button>

			<Text
				style={styles.link}
				status="primary"
				onPress={() => Linking.openURL('https://www.ekhoes.com/sign-up')}
			>
				No account? Sign up
			</Text>

			<Text category="h6" style={styles.divider}>Or</Text>

			<Input
				placeholder="Name (Guest)"
				style={[styles.input, { marginBottom: 10 }]}
				value={guestName}
				onChangeText={setGuestName}
				status={guestNameError ? 'danger' : 'basic'}
				caption={guestNameError}
				autoCapitalize="words"
			/>

			<Button
				style={styles.button}
				onPress={handleGuestLogin}
				disabled={loading}
				accessoryRight={loading ? () => <LoadingIndicator /> : undefined}
			>
				Enter as guest
			</Button>

			<Text style={styles.footer} appearance="hint" category="c1">
				An app by ekhoes.com
			</Text>
		</Layout>
		</View>
	);
}

export const LoadingIndicator = (): JSX.Element => (
	<View style={{ marginLeft: 10 }}>
		<Spinner size="small" />
	</View>
);
