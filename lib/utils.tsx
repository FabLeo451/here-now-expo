import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const encodeBase64 = (text: string): string => {
  return Buffer.from(text, 'utf-8').toString('base64');
};

export const decodeBase64 = (base64: string): string => {
  return Buffer.from(base64, 'base64').toString('utf-8');
};

export const getToken = async (key: string) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

export const setToken = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.setItem(key, value);
  }
  return await SecureStore.setItemAsync(key, value);
};

export const deleteToken = async (key: string) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.removeItem(key);
  }
  return await SecureStore.deleteItemAsync(key);
};

export const getDeviceType = async (): Promise<string> => {
	const type = await Device.getDeviceTypeAsync();

	switch (type) {
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

function getBrowser() {
	const ua = navigator.userAgent;

	let browser = 'Unknown';

	if (ua.includes('Firefox/')) {
		browser = ua.match(/Firefox\/([\d.]+)/)?.[0] || 'Firefox';
	} else if (ua.includes('Edg/')) {
		browser = ua.match(/Edg\/([\d.]+)/)?.[0] || 'Edge';
	} else if (ua.includes('Chrome/')) {
		browser = ua.match(/Chrome\/([\d.]+)/)?.[0] || 'Chrome';
	} else if (ua.includes('Safari/')) {
		browser = ua.match(/Version\/([\d.]+)/)?.[0] || 'Safari';
	}

	return browser;
}

export const getDeviceInfo = () => {
	const name = Constants.expoConfig?.name ?? 'unknown';
	const version = Constants.expoConfig?.version ?? 'unknown';

	let agent = name + '/' + version;

	if (Platform.OS === 'web') {
		agent = getBrowser();
	}

	const platform = Platform.OS + ' ' + Platform.Version;
	const model = Device.modelName || 'Undefined';
	const deviceName = Device.deviceName || 'Undefined';
	//const deviceType = getDeviceType();

	return { agent, platform, model, deviceName };
};

