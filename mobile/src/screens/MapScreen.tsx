import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HeritageSite, RootStackParamList } from '../types';
import { getSites } from '../services/api';
import { GEOAPIFY_KEY } from '../config';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function buildMapHTML(sites: HeritageSite[]): string {
  const markers = sites
    .filter((s: HeritageSite) => s.latitude && s.longitude)
    .map(
      (s) => `
        L.marker([${s.latitude}, ${s.longitude}], { icon: goldIcon })
          .addTo(map)
          .bindPopup(\`
            <div style="font-family:sans-serif;min-width:160px">
              <b style="font-size:14px">${escapeJs(s.name)}</b><br/>
              <span style="color:#6B7280;font-size:12px">${escapeJs(s.location || '')}</span><br/>
              <button onclick="window.ReactNativeWebView.postMessage('${escapeJs(s.id)}')"
                style="margin-top:8px;background:#111827;color:#fff;border:none;
                       border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px">
                View Details →
              </button>
            </div>
          \`);
      `
    )
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-popup-content-wrapper { border-radius: 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([9.145, 40.489673], 6);

    // Geoapify tile layer
    L.tileLayer(
      'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}',
      {
        attribution: '© <a href="https://www.geoapify.com/">Geoapify</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 20,
      }
    ).addTo(map);

    // Gold marker icon
    const goldIcon = L.divIcon({
      html: '<div style="width:28px;height:28px;background:#F59E0B;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
      className: '',
    });

    ${markers}
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const navigation = useNavigation<Nav>();
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);

  useEffect(() => {
    getSites()
      .then((data) => setSites(data.filter((s: HeritageSite) => s.latitude && s.longitude)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMessage = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) setSelectedSite(site);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#111827" />;
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: buildMapHTML(sites) }}
        onMessage={(e: { nativeEvent: { data: string } }) => handleMessage(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
      />

      {/* Site preview card */}
      {selectedSite && (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{selectedSite.name}</Text>
            {selectedSite.location && (
              <Text style={styles.cardLoc}>📍 {selectedSite.location}</Text>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => navigation.navigate('SiteDetail', { site: selectedSite })}
            >
              <Text style={styles.detailBtnText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSite(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Site list pill */}
      <View style={styles.legend}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendContent}>
          {sites.map((s: HeritageSite) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.pill, selectedSite?.id === s.id && styles.pillActive]}
              onPress={() => setSelectedSite(s)}
            >
              <Text style={[styles.pillText, selectedSite?.id === s.id && styles.pillTextActive]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  card: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardLoc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailBtn: { backgroundColor: '#111827', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  detailBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  closeBtn: { padding: 4 },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  legendContent: { paddingHorizontal: 16, gap: 8 },
  pill: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  pillTextActive: { color: '#fff' },
});
