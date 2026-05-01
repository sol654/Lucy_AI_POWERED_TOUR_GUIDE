import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Favorite, HeritageSite, RootStackParamList } from '../types';
import { getFavorites, getSite, removeFavorite } from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface FavWithSite extends Favorite { site?: HeritageSite }

export default function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [items, setItems] = useState<FavWithSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const favs = await getFavorites();
      const withSites = await Promise.all(
        favs.map(async (f) => {
          try { return { ...f, site: await getSite(f.heritage_site_id) }; }
          catch { return f; }
        })
      );
      setItems(withSites);
    } catch {
      Alert.alert(t('error'), t('serverError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const remove = async (fav: FavWithSite) => {
    try {
      await removeFavorite(fav.id);
      setItems((prev: FavWithSite[]) => prev.filter((i: FavWithSite) => i.id !== fav.id));
    } catch {
      Alert.alert(t('error'), 'Could not remove favorite');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#111827" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i: FavWithSite) => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>{t('savedSites')}</Text>}
        ListEmptyComponent={<Text style={styles.empty}>{t('noFavorites')}</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        renderItem={({ item }: { item: FavWithSite }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => item.site && navigation.navigate('SiteDetail', { site: item.site })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.site?.name || t('unknownSite')}</Text>
              {item.site?.location && <Text style={styles.cardLoc}>📍 {item.site.location}</Text>}
            </View>
            <TouchableOpacity onPress={() => remove(item)} style={styles.removeBtn}>
              <Ionicons name="heart-dislike-outline" size={22} color="#DC2626" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardLoc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  removeBtn: { padding: 4 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 15 },
});
