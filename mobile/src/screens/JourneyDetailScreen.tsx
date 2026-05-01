import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, JourneySite, HeritageSite } from '../types';
import { getJourneySites, getSite } from '../services/api';

type Props = { route: RouteProp<RootStackParamList, 'JourneyDetail'> };
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SiteEntry extends JourneySite { site?: HeritageSite }

export default function JourneyDetailScreen({ route }: Props) {
  const { journey } = route.params;
  const navigation = useNavigation<Nav>();
  const [entries, setEntries] = useState<SiteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const journeySites = await getJourneySites(journey.id);
      const withSites = await Promise.all(
        journeySites.map(async (js) => {
          try { return { ...js, site: await getSite(js.heritage_site_id) }; }
          catch { return js; }
        })
      );
      setEntries(withSites.sort((a, b) => a.order_index - b.order_index));
    } catch {
      Alert.alert('Error', 'Could not load journey sites');
    } finally {
      setLoading(false);
    }
  }, [journey.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#111827" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{journey.title}</Text>
            <Text style={styles.sub}>{entries.length} site{entries.length !== 1 ? 's' : ''}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No sites yet</Text>
            <Text style={styles.emptySub}>Open any heritage site and tap "Add to Journey" to build your itinerary.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => item.site && navigation.navigate('SiteDetail', { site: item.site })}
            disabled={!item.site}
          >
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.site?.name ?? 'Unknown Site'}</Text>
              {item.site?.location && (
                <Text style={styles.cardLoc}>📍 {item.site.location}</Text>
              )}
            </View>
            {item.site && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  indexBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  indexText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardLoc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
