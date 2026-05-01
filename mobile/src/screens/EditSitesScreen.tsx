import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getSites, updateSite } from '../services/api';
import { HeritageSite } from '../types';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditSitesScreen() {
  const navigation = useNavigation<Nav>();
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await getSites();
      setSites(data);
    } catch {
      Alert.alert('Error', 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (site: HeritageSite) => {
    setSelectedSite(site);
    setName(site.name);
    setDescription(site.description || '');
    setHistory(site.history || '');
    setLocation(site.location || '');
    setLatitude(site.latitude?.toString() || '');
    setLongitude(site.longitude?.toString() || '');
    setImageUrl(site.image_url || '');
    setModalVisible(true);
  };

  const saveChanges = async () => {
    if (!selectedSite) return;
    setSaving(true);
    try {
      const updated = await updateSite(selectedSite.id, {
        name: name.trim(),
        description: description.trim() || null,
        history: history.trim() || null,
        location: location.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        image_url: imageUrl.trim() || null,
      });
      setSites((prev) => prev.map((s) => (s.id === selectedSite.id ? updated : s)));
      setModalVisible(false);
      Alert.alert('Success', 'Site updated');
    } catch {
      Alert.alert('Error', 'Failed to update site');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Existing Sites</Text>
        {sites.map((site) => (
          <TouchableOpacity key={site.id} style={styles.siteItem} onPress={() => openEditModal(site)}>
            <Ionicons name="location" size={24} color="#F59E0B" />
            <View style={styles.siteInfo}>
              <Text style={styles.siteName}>{site.name}</Text>
              {site.location && <Text style={styles.siteLocation}>{site.location}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.modalTitle}>Edit Site</Text>
            {[
              { label: 'Name *', value: name, setter: setName },
              { label: 'Description', value: description, setter: setDescription },
              { label: 'History', value: history, setter: setHistory },
              { label: 'Location', value: location, setter: setLocation },
              { label: 'Latitude', value: latitude, setter: setLatitude },
              { label: 'Longitude', value: longitude, setter: setLongitude },
              { label: 'Image URL', value: imageUrl, setter: setImageUrl },
            ].map(({ label, value, setter }) => (
              <View key={label} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setter}
                  placeholder={`Enter ${label.replace(' *', '').toLowerCase()}`}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveChanges} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 20 },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  siteInfo: { flex: 1, marginLeft: 12 },
  siteName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  siteLocation: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelBtn: { flex: 1, marginRight: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  cancelText: { color: '#374151', fontWeight: '600' },
  saveBtn: { flex: 1, marginLeft: 10, backgroundColor: '#111827', paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: '600' },
});