import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import ModalHotspot from '@/components/ModalHotspot';
import type { Hotspot } from '@/lib/hotspot';

type LatLng = {
  latitude: number;
  longitude: number;
};

type Boundaries = {
  northEast: LatLng;
  southWest: LatLng;
};

type MapProps = {
  mapRef: React.RefObject<any>;
  initialCoords: LatLng;
  markerCoords: LatLng;
  hotspots: Hotspot[];
  onMapReady?: () => void;
  onRegionChangeCompleteBounds?: (bounds: Boundaries) => void;
};

export default function Map({
  mapRef,
  initialCoords,
  markerCoords,
  hotspots,
  onMapReady,
  onRegionChangeCompleteBounds
}: MapProps) {
  const webViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState<{ visible: boolean; id: string }>({
    visible: false,
    id: '',
  });

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'HOTSPOT_CLICKED') {
        setModalVisible({ visible: true, id: message.id });
      }

      if (message.type === 'REGION_CHANGED' && typeof onRegionChangeCompleteBounds === 'function') {
        onRegionChangeCompleteBounds(message.bounds);
      }
    } catch (e) {
      console.warn('Invalid WebView message', e);
    }
  };

  const moveToMyPosition = () => {
    webViewRef.current?.injectJavaScript(`
      if (typeof moveToUser === 'function') {
        moveToUser();
      }
    `);
  };

  // Aggiorna dinamicamente il marker utente (es. GPS)
  useEffect(() => {
    if (webViewRef.current) {
      const js = `
        if (typeof updateUserPosition === 'function') {
          updateUserPosition(${markerCoords.latitude}, ${markerCoords.longitude});
        }
      `;
      webViewRef.current.injectJavaScript(js);
    }

	console.log('[Map.native]', markerCoords);

  }, [markerCoords]);

  // Aggiorna dinamicamente gli hotspot
  useEffect(() => {
    if (webViewRef.current && hotspots?.length) {
      const hotspotData = JSON.stringify(hotspots);
      const js = `
        if (typeof updateHotspots === 'function') {
          updateHotspots(${hotspotData});
        }
      `;
      webViewRef.current.injectJavaScript(js);
    }

	console.log('[Map.native] hotspots: ', hotspots.length);

  }, [hotspots]);


	const htmlContentRef = useRef(generateLeafletHTML({ initialCoords, markerCoords, hotspots }));

  return (
    <View style={styles.mapContainer}>
      <ModalHotspot
        visible={modalVisible.visible}
        id={modalVisible.id}
        onClose={() => setModalVisible({ visible: false, id: 'dummyId' })}
      />

      <TouchableOpacity style={styles.fab} onPress={moveToMyPosition}>
        <Ionicons name="person" size={25} color="#fff" />
      </TouchableOpacity>

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContentRef.current }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
    </View>
  );
}

function generateLeafletHTML({
  initialCoords,
  markerCoords,
  hotspots,
}: {
  initialCoords: LatLng;
  markerCoords: LatLng;
  hotspots: Hotspot[];
}): string {
  const hotspotJSArray = JSON.stringify(hotspots);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Leaflet Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }

      .pulsing-circle {
        width: 30px;
        height: 30px;
        background: rgba(0,122,255,0.7);
        border-radius: 50%;
        animation: pulse 1.5s infinite;
        position: relative;
      }

      .pulsing-circle::after {
        content: '';
        width: 30px;
        height: 30px;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        background: rgba(0,122,255,0.4);
        animation: pulse-ring 1.5s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.2); opacity: 0.6; }
      }

      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2); opacity: 0; }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <script>
      const map = L.map('map').setView([${initialCoords.latitude}, ${initialCoords.longitude}], 18);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      let userMarker = L.marker([${markerCoords.latitude}, ${markerCoords.longitude}])
        .addTo(map)
        .bindPopup("La tua posizione");

      function updateUserPosition(lat, lng) {
        userMarker.setLatLng([lat, lng]);
      }

      function moveToUser() {
        map.setView(userMarker.getLatLng(), map.getZoom());
      }

      let hotspotMarkers = [];

 function addHotspotMarker(h) {
        const el = L.divIcon({
          html: \`
            <div style="position: relative; text-align: center;">
              <div class="pulsing-circle"></div>
              <div style="
                position: absolute;
                top: 35px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 12px;
                color: black;
                font-weight: bold;
                white-space: nowrap;
                pointer-events: none;
              ">
                \${h.label || h.name || ''}
              </div>
            </div>
          \`,
          className: '',
          iconSize: [40, 50],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([h.position.latitude, h.position.longitude], { icon: el }).addTo(map);
        marker.on('click', () => {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'HOTSPOT_CLICKED',
            id: h.id
          }));
        });
        hotspotMarkers.push(marker);
      }

      function updateHotspots(hotspots) {
        hotspotMarkers.forEach(m => map.removeLayer(m));
        hotspotMarkers = [];
        hotspots.forEach(h => addHotspotMarker(h));
      }

      // Inizializzazione iniziale
      const initialHotspots = ${hotspotJSArray};
      updateHotspots(initialHotspots);

      map.on('moveend', () => {
        const bounds = map.getBounds();
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'REGION_CHANGED',
          bounds: {
            northEast: {
              latitude: bounds.getNorthEast().lat,
              longitude: bounds.getNorthEast().lng
            },
            southWest: {
              latitude: bounds.getSouthWest().lat,
              longitude: bounds.getSouthWest().lng
            }
          }
        }));
      });
    </script>
  </body>
</html>
`;
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 5,
  },
});
