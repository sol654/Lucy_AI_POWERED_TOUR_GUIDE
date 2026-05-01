import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Journey, RootStackParamList } from '../types';
import { getJourneys, createJourney, deleteJourney } from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function JourneyScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      setJourneys(await getJourneys());
    } catch {
      Alert.alert(t('error'), 'Could not load journeys');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const create = async () => {
    if (!title.trim()) return Alert.alert(t('error'), 'Please enter a journey title');
    setCreating(true);
    try {
      const j = await createJourney(title.trim());
      setJourneys((prev) => [j, ...prev]);
      setTitle('');
      setModalVisible(false);
    } catch {
      Alert.alert(t('error'), 'Could not create journey');
    } finally {
      setCreating(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert(t('delete'), t('deleteJourneyPrompt'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive', onPress: async () => {
          try {
            await deleteJourney(id);
            setJourneys((prev) => prev.filter((j) => j.id !== id));
          } catch {
            Alert.alert(t('error'), 'Could not delete journey');
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#111827" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={journeys}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t('myJourneys')}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="compass-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t('noJourneysYet')}</Text>
            <Text style={styles.emptySub}>{t('createJourneyHint')}</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('JourneyDetail', { journey: item })}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="map" size={22} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t('newJourney')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('eGJourney')}
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={create}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={create} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('createJourney')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModalVisible(false); setTitle(''); }}>
              <Text style={styles.cancel}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  addBtn: { width: 40, height: 40, backgroundColor: '#111827', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  cardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  deleteBtn: { padding: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  input: { height: 48, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#111827', marginBottom: 14, backgroundColor: '#FAFAFA' },
  btnPrimary: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancel: { textAlign: 'center', color: '#6B7280', fontSize: 14, paddingVertical: 8 },
});
