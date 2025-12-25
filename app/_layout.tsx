import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useFonts, Dosis_600SemiBold } from '@expo-google-fonts/dosis';
import { AuthProvider } from '@/context/AuthProvider';
import { WebsocketProvider } from '@/context/WebsocketContext';
import { useAuth } from '@/hooks/useAuth';
import { Redirect, useSegments } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Dosis_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <WebsocketProvider>
        <RootLayoutNav />
      </WebsocketProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) return null;

  const inAuthGroup = segments[0] === 'login';

  // 🔐 Non loggato → solo login
  if (!user && !inAuthGroup) {
    return <Redirect href="/login" />;
  }

  // 🔓 Loggato → fuori dal login
  if (user && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        {...eva}
        theme={colorScheme === 'dark' ? eva.dark : eva.light}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </ApplicationProvider>
    </>
  );
}

