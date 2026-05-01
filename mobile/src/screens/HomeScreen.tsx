import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HeritageSite, RootStackParamList } from '../types';
import { getSites } from '../services/api';
import RemoteImage from '../components/RemoteImage';
import { useTranslation } from 'react-i18next';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [filtered, setFiltered] = useState<HeritageSite[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = async () => {
    setError(false);
    try {
      const data = await getSites();
      setSites(data);
      setFiltered(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? sites.filter((s: HeritageSite) => s.name.toLowerCase().includes(q) || (s.location || '').toLowerCase().includes(q)) : sites);
  }, [search, sites]);

  const renderSite = ({ item }: { item: HeritageSite }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SiteDetail', { site: item })}>
      <RemoteImage
        uri={item.image_url}
        style={styles.cardImage}
        borderRadius={18}
      />
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.location && <Text style={styles.cardLocation}>📍 {item.location}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchSites')}
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#111827" />
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
          <Text style={styles.errorText}>{t('serverError')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderSite}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<Text style={styles.sectionTitle}>{t('heritageSites')}</Text>}
          ListEmptyComponent={<Text style={styles.empty}>{t('noSitesFound')}</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 14 },
  card: { marginBottom: 14, borderRadius: 18, overflow: 'hidden', height: 200 },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardImageStyle: { borderRadius: 18 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)', borderRadius: 18 },
  cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  cardName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardLocation: { color: '#E2E8F0', fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 15 },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  errorText: { fontSize: 15, color: '#6B7280' },
  retryBtn: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
