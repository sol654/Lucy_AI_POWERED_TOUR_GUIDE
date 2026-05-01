import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  getAdminStats, getAdminUsers, deleteUser, updateUserRole,
  getAdminFeedback, deleteFeedback,
  getSites, createSite, deleteSite,
} from '../services/api';
import { AdminStats, User, Feedback, HeritageSite } from '../types';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Tab = 'stats' | 'users' | 'sites' | 'feedback';

export default function AdminScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New site modal
  const [siteModal, setSiteModal] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [siteLat, setSiteLat] = useState('');
  const [siteLon, setSiteLon] = useState('');
  const [siteImage, setSiteImage] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'stats') setStats(await getAdminStats());
      else if (tab === 'users') setUsers(await getAdminUsers());
      else if (tab === 'sites') setSites(await getSites());
      else if (tab === 'feedback') setFeedback(await getAdminFeedback());
    } catch {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = (label: string, onConfirm: () => void) =>
    Alert.alert(`Delete ${label}`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);

  const handleDeleteUser = (user: User) =>
    confirmDelete(`user "${user.name}"`, async () => {
      try {
        await deleteUser(user.id);
        setUsers((p) => p.filter((u) => u.id !== user.id));
      } catch { Alert.alert('Error', 'Could not delete user'); }
    });

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert('Change Role', `Set ${user.name} as ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          try {
            const updated = await updateUserRole(user.id, newRole);
            setUsers((p) => p.map((u) => u.id === updated.id ? updated : u));
          } catch { Alert.alert('Error', 'Could not update role'); }
        },
      },
    ]);
  };

  const handleDeleteSite = (site: HeritageSite) =>
    confirmDelete(`"${site.name}"`, async () => {
      try {
        await deleteSite(site.id);
        setSites((p) => p.filter((s) => s.id !== site.id));
      } catch { Alert.alert('Error', 'Could not delete site'); }
    });

  const handleDeleteFeedback = (fb: Feedback) =>
    confirmDelete('feedback', async () => {
      try {
        await deleteFeedback(fb.id);
        setFeedback((p) => p.filter((f) => f.id !== fb.id));
      } catch { Alert.alert('Error', 'Could not delete feedback'); }
    });

  const handleCreateSite = async () => {
    if (!siteName.trim()) return Alert.alert('Error', 'Name is required');
    setCreating(true);
    try {
      const site = await createSite({
        name: siteName.trim(),
        description: siteDesc.trim() || null,
        history: null,
        location: siteLocation.trim() || null,
        latitude: siteLat ? parseFloat(siteLat) : null,
        longitude: siteLon ? parseFloat(siteLon) : null,
        image_url: siteImage.trim() || null,
        audio_url: null,
      });
      setSites((p) => [site, ...p]);
      setSiteModal(false);
      setSiteName(''); setSiteDesc(''); setSiteLocation('');
      setSiteLat(''); setSiteLon(''); setSiteImage('');
    } catch { Alert.alert('Error', 'Could not create site'); }
    finally { setCreating(false); }
  };

  const TABS: { key: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { key: 'stats', icon: 'bar-chart', label: 'Stats' },
    { key: 'users', icon: 'people', label: 'Users' },
    { key: 'sites', icon: 'location', label: 'Sites' },
    { key: 'feedback', icon: 'chatbubbles', label: 'Feedback' },
  ];

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons name={t.icon} size={18} color={tab === t.key ? '#fff' : '#6B7280'} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing
        ? <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#111827" />
        : (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          >
            {/* ── Stats ── */}
            {tab === 'stats' && stats && (
              <View style={styles.statsGrid}>
                {([
                  ['Users', stats.total_users, 'people', '#3B82F6'],
                  ['Sites', stats.total_sites, 'location', '#F59E0B'],
                  ['Feedback', stats.total_feedback, 'chatbubbles', '#10B981'],
                  ['Journeys', stats.total_journeys, 'compass', '#8B5CF6'],
                  ['Favorites', stats.total_favorites, 'heart', '#EF4444'],
                ] as [string, number, keyof typeof Ionicons.glyphMap, string][]).map(([label, val, icon, color]) => (
                  <View key={label} style={styles.statCard}>
                    <Ionicons name={icon} size={28} color={color} />
                    <Text style={styles.statVal}>{val}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Users ── */}
            {tab === 'users' && users.map((u) => (
              <View key={u.id} style={styles.row}>
                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{u.name}</Text>
                  <Text style={styles.rowSub}>{u.email}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.chip, u.role === 'admin' ? styles.chipAdmin : styles.chipUser]}
                  onPress={() => handleToggleRole(u)}
                >
                  <Text style={styles.chipText}>{u.role}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(u)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}

            {/* ── Sites ── */}
            {tab === 'sites' && (
              <>
                <TouchableOpacity style={styles.addBtn} onPress={() => setSiteModal(true)}>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>Add New Site</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('EditSites')}>
                  <Ionicons name="create" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>Edit Existing Sites</Text>
                </TouchableOpacity>
                {sites.map((s) => (
                  <View key={s.id} style={styles.row}>
                    <Ionicons name="location" size={22} color="#F59E0B" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{s.name}</Text>
                      {s.location && <Text style={styles.rowSub}>{s.location}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteSite(s)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {/* ── Feedback ── */}
            {tab === 'feedback' && feedback.map((fb) => (
              <View key={fb.id} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.starsRow}>
                    {fb.rating && Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={14}
                        color={i < fb.rating! ? '#F59E0B' : '#E5E7EB'}
                      />
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteFeedback(fb)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.feedbackMsg}>{fb.message}</Text>
                <Text style={styles.feedbackDate}>{new Date(fb.created_at).toLocaleDateString()}</Text>
              </View>
            ))}

            {/* Empty states */}
            {!loading && tab === 'users' && users.length === 0 && <Text style={styles.empty}>No users found.</Text>}
            {!loading && tab === 'sites' && sites.length === 0 && <Text style={styles.empty}>No sites found.</Text>}
            {!loading && tab === 'feedback' && feedback.length === 0 && <Text style={styles.empty}>No feedback yet.</Text>}
          </ScrollView>
        )}

      {/* Add Site Modal */}
      <Modal visible={siteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.modalTitle}>New Heritage Site</Text>
            {[
              ['Name *', siteName, setSiteName, false],
              ['Description', siteDesc, setSiteDesc, false],
              ['Location', siteLocation, setSiteLocation, false],
              ['Latitude', siteLat, setSiteLat, true],
              ['Longitude', siteLon, setSiteLon, true],
              ['Image URL', siteImage, setSiteImage, false],
            ].map(([label, val, setter, numeric]) => (
              <View key={label as string} style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>{label as string}</Text>
                <TextInput
                  style={styles.input}
                  value={val as string}
                  onChangeText={setter as (t: string) => void}
                  keyboardType={numeric ? 'decimal-pad' : 'default'}
                  placeholderTextColor="#9CA3AF"
                  placeholder={label as string}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={handleCreateSite} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Create Site</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSiteModal(false)} style={{ marginTop: 12 }}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabBar: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  tabBtnActive: { backgroundColor: '#111827' },
  tabLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  content: { padding: 16, paddingBottom: 100 },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '46%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  statVal: { fontSize: 28, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  // Rows
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  rowAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rowAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  chip: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginRight: 8 },
  chipAdmin: { backgroundColor: '#FEF3C7' },
  chipUser: { backgroundColor: '#F3F4F6' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#374151' },
  deleteBtn: { padding: 4 },
  // Feedback
  feedbackCard: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  starsRow: { flexDirection: 'row', gap: 2 },
  feedbackMsg: { fontSize: 14, color: '#374151', lineHeight: 20 },
  feedbackDate: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  // Add button
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111827', borderRadius: 12, paddingVertical: 13, marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: { height: 46, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: '#111827', backgroundColor: '#FAFAFA' },
  cancel: { textAlign: 'center', color: '#6B7280', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 15 },
});
