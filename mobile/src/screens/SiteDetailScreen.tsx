import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Linking, Platform, Modal, FlatList,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { addFavorite, getFavorites, removeFavorite, audioGuide, getJourneys, addSiteToJourney } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Journey } from '../types';
import RemoteImage from '../components/RemoteImage';
import { GEOAPIFY_KEY } from '../config';

function buildSiteMapHTML(
  siteLat: number, siteLon: number, siteName: string,
  userLat?: number, userLon?: number,
): string {
  const safe = (s: string) => s.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const center = userLat && userLon
    ? `[(${siteLat} + ${userLat}) / 2, (${siteLon} + ${userLon}) / 2]`
    : `[${siteLat}, ${siteLon}]`;
  const zoom = userLat && userLon ? 8 : 13;

  const userMarker = userLat && userLon ? `
    const userIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#3B82F6;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize:[16,16], iconAnchor:[8,8], className:''
    });
    L.marker([${userLat}, ${userLon}], { icon: userIcon })
      .addTo(map).bindPopup('Your Location');

    // Draw straight line route
    const route = L.polyline(
      [[${userLat}, ${userLon}], [${siteLat}, ${siteLon}]],
      { color: '#F59E0B', weight: 3, dashArray: '8,6', opacity: 0.9 }
    ).addTo(map);
    map.fitBounds(route.getBounds(), { padding: [40, 40] });
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>* { margin:0; padding:0; } html,body,#map { width:100%; height:100%; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true, attributionControl: false })
      .setView(${center}, ${zoom});
    L.tileLayer(
      'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}',
      { maxZoom: 20 }
    ).addTo(map);

    const siteIcon = L.divIcon({
      html: '<div style="width:24px;height:24px;background:#F59E0B;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize:[24,24], iconAnchor:[12,24], className:''
    });
    L.marker([${siteLat}, ${siteLon}], { icon: siteIcon })
      .addTo(map).bindPopup('${safe(siteName)}').openPopup();

    ${userMarker}
  </script>
</body>
</html>`;
}

type Props = { route: RouteProp<RootStackParamList, 'SiteDetail'> };

export default function SiteDetailScreen({ route }: Props) {
  const { site } = route.params;
  const { user } = useAuth();
  const lang = user?.language_preference || 'en';
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loadingFav, setLoadingFav] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [journeyModalVisible, setJourneyModalVisible] = useState(false);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [addingToJourney, setAddingToJourney] = useState(false);

  useEffect(() => {
    getFavorites().then((favs) => {
      const match = favs.find((f) => f.heritage_site_id === site.id);
      if (match) setFavoriteId(match.id);
    }).catch(() => {});
    // Request location on mount
    requestLocation();
  }, [site.id]);



  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ lat: latitude, lon: longitude });
      // Calculate straight-line distance
      if (site.latitude && site.longitude) {
        const km = haversine(latitude, longitude, site.latitude, site.longitude);
        setDistance(km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
      }
    } catch {
      // location optional — map still shows site
    } finally {
      setLocationLoading(false);
    }
  };

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const openDirections = () => {
    if (site.latitude == null || site.longitude == null) return;
    const dst = `${site.latitude},${site.longitude}`;
    const label = encodeURIComponent(site.name);
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${dst}&dirflg=d`
      : `google.navigation:q=${dst}&mode=d`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dst}&destination_place_id=${label}&travelmode=driving`);
      }
    });
  };

  const playAudio = async (base64: string) => {
    try {
      const newUri = `data:audio/mp3;base64,${base64}`;
      player.replace(newUri);
      player.play();
    } catch {
      // audio playback is optional
    }
  };

  const stopAudio = async () => {
    try {
      player.pause();
    } catch {
      // ignore stop errors
    }
  };

  const toggleAudio = async () => {
    Alert.alert('Coming Soon', 'The Audio Guide feature is coming soon! Stay tuned.');
  };

  const toggleFavorite = async () => {
    setLoadingFav(true);
    try {
      if (favoriteId) {
        await removeFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        const fav = await addFavorite(site.id);
        setFavoriteId(fav.id);
      }
    } catch {
      Alert.alert('Error', 'Could not update favorites');
    } finally {
      setLoadingFav(false);
    }
  };

  const openJourneyPicker = async () => {
    try {
      const data = await getJourneys();
      if (data.length === 0) {
        Alert.alert('No Journeys', 'Create a journey first from the Journeys tab.');
        return;
      }
      setJourneys(data);
      setJourneyModalVisible(true);
    } catch {
      Alert.alert('Error', 'Could not load journeys');
    }
  };

  const handleAddToJourney = async (journeyId: string) => {
    setAddingToJourney(true);
    try {
      await addSiteToJourney(journeyId, site.id);
      setJourneyModalVisible(false);
      Alert.alert('Added', 'Site added to journey.');
    } catch {
      Alert.alert('Error', 'Could not add site to journey');
    } finally {
      setAddingToJourney(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RemoteImage uri={site.image_url} style={styles.image} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{site.name}</Text>
          {site.location && <Text style={styles.location}>📍 {site.location}</Text>}
        </View>
        <TouchableOpacity onPress={toggleFavorite} disabled={loadingFav} style={styles.favBtn}>
          {loadingFav
            ? <ActivityIndicator size="small" color="#F59E0B" />
            : <Ionicons name={favoriteId ? 'heart' : 'heart-outline'} size={28} color="#F59E0B" />}
        </TouchableOpacity>
      </View>

      {site.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{site.description}</Text>
        </View>
      )}

      {site.history && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          <Text style={styles.body}>{site.history}</Text>
        </View>
      )}

      {site.latitude != null && site.longitude != null && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          {/* Distance badge */}
          {(distance || locationLoading) && (
            <View style={styles.distanceRow}>
              <Ionicons name="navigate-outline" size={15} color="#3B82F6" style={styles.iconSpacingSmall} />
              <Text style={styles.distanceText}>
                {locationLoading ? 'Getting your location...' : `${distance} from your location`}
              </Text>
            </View>
          )}

          {/* Map with user location + site marker + route line */}
          <View style={styles.mapContainer}>
            <WebView
              style={styles.map}
              originWhitelist={['*']}
              source={{
                html: buildSiteMapHTML(
                  site.latitude, site.longitude, site.name,
                  userLocation?.lat, userLocation?.lon,
                ),
              }}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
            />
          </View>

          <Text style={styles.coords}>
            {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
          </Text>

          {/* Get Directions button */}
          <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
            <Ionicons name="navigate" size={18} color="#fff" style={styles.iconSpacing} />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.audioBtn, playing && styles.audioBtnActive]}
        onPress={toggleAudio}
        disabled={loadingAudio}
      >
        {loadingAudio
          ? <ActivityIndicator color="#fff" size="small" />
          : <Ionicons name={playing ? 'stop-circle' : 'play-circle'} size={24} color="#fff" style={styles.iconSpacing} />}
        <Text style={styles.audioBtnText}>
          {loadingAudio ? 'Generating Audio...' : playing ? 'Stop Audio Guide' : 'Play Audio Guide'}
        </Text>
      </TouchableOpacity>

      {/* Add to Journey */}
      <TouchableOpacity style={styles.journeyBtn} onPress={openJourneyPicker}>
        <Ionicons name="compass-outline" size={20} color="#F59E0B" style={styles.iconSpacing} />
        <Text style={styles.journeyBtnText}>Add to Journey</Text>
      </TouchableOpacity>

      {/* Journey picker modal */}
      <Modal visible={journeyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select a Journey</Text>
            {addingToJourney
              ? <ActivityIndicator size="large" color="#111827" style={{ marginVertical: 20 }} />
              : (
                <FlatList
                  data={journeys}
                  keyExtractor={(j) => j.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.journeyItem} onPress={() => handleAddToJourney(item.id)}>
                      <Ionicons name="map-outline" size={20} color="#F59E0B" style={styles.itemIcon} />
                      <Text style={styles.journeyItemText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            <TouchableOpacity onPress={() => setJourneyModalVisible(false)} style={{ marginTop: 12 }}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  image: { width: '100%', height: 260 },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 8 },
  name: { fontSize: 26, fontWeight: '800', color: '#111827' },
  location: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  favBtn: { padding: 4 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8 },
  body: { fontSize: 15, color: '#374151', lineHeight: 24 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  distanceText: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
  mapContainer: { height: 220, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  map: { flex: 1 },
  coords: { fontSize: 12, color: '#9CA3AF', marginTop: 6, marginBottom: 10 },
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 12,
  },
  directionsBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  iconSpacing: { marginRight: 8 },
  iconSpacingSmall: { marginRight: 6 },
  audioBtn: { margin: 16, backgroundColor: '#111827', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  audioBtnActive: { backgroundColor: '#DC2626' },
  audioBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  journeyBtn: { marginHorizontal: 16, marginBottom: 16, borderWidth: 2, borderColor: '#F59E0B', borderRadius: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  journeyBtnText: { color: '#F59E0B', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  journeyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  itemIcon: { marginRight: 12 },
  journeyItemText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cancel: { textAlign: 'center', color: '#6B7280', fontSize: 14, paddingVertical: 8 },
});
