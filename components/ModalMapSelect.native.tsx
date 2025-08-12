import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text, Button } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

type Props = {
  visible: boolean;
  latitude: number;
  longitude: number;
  onSelect: (coords: { latitude: number; longitude: number } | null) => void;
};

export default function ModalMapSelect({
  visible,
  latitude,
  longitude,
  onSelect,
}: Props) {
  const webViewRef = useRef(null);
  const selectedCoords = useRef<{ latitude: number; longitude: number } | null>(null);

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data?.latitude && data?.longitude) {
      selectedCoords.current = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }
  };

  const stylesModal = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 5,
      alignItems: 'center',
    },
    map: {
      width: 350,
      height: 200,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Map</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <style>
        #map { height: 100%; width: 100%; margin: 0; padding: 0; }
        html, body { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
  		const zoom = 18;
        const map = L.map('map').setView([${latitude}, ${longitude}], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
        }).addTo(map);

        let marker = L.marker([${latitude}, ${longitude}], { draggable: true }).addTo(map);
        marker.on('dragend', function (e) {
          const { lat, lng } = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
        });

        map.on('click', function(e) {
          const { lat, lng } = e.latlng;
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
        });

        // Send initial location on load
        window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: ${latitude}, longitude: ${longitude} }));
      </script>
    </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => onSelect(null)}
    >
      <View style={stylesModal.overlay}>
        <View style={stylesModal.content}>
          <TouchableOpacity onPress={() => onSelect(null)} style={stylesModal.closeButton}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={{ marginBottom: 10 }}>Touch the map, then hit "Select"</Text>
          <WebView
            ref={webViewRef}
            style={stylesModal.map}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
          />
          <Button
            style={{ marginTop: 10 }}
            onPress={() =>
              onSelect(selectedCoords.current ?? { latitude, longitude })
            }
          >
            Select
          </Button>
        </View>
      </View>
    </Modal>
  );
}
