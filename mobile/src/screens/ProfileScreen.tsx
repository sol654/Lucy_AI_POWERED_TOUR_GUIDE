import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { submitFeedback, updateProfile } from '../services/api';
import { normalizeRemoteUrl } from '../config';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LANGUAGE_OPTIONS = [
  { code: 'en', labelKey: 'english' },
  { code: 'am', labelKey: 'amharic' },
  { code: 'ti', labelKey: 'tigrinya' },
  { code: 'or', labelKey: 'oromo' },
];

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const languages = LANGUAGE_OPTIONS.map((lang) => ({
    ...lang,
    label: t(lang.labelKey as any),
  }));
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [savingLang, setSavingLang] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    user?.profile_picture_url ? normalizeRemoteUrl(user.profile_picture_url) : null
  );

  useEffect(() => {
    if (user?.profile_picture_url) {
      const normalized = normalizeRemoteUrl(user.profile_picture_url);
      setProfileImageUrl(`${normalized}${normalized.includes('?') ? '&' : '?'}cb=${Date.now()}`);
    } else {
      setProfileImageUrl(null);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(t('signOut'), t('areYouSure'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            Alert.alert(t('goodbye'), t('seeYouSoon'));
          } catch {
            Alert.alert(t('error'), t('couldNotSignOut'));
          }
        },
      },
    ]);
  };

  const handleLanguageChange = async (code: string) => {
    if (!user || user.language_preference === code || savingLang) return;
    setSavingLang(true);
    try {
      const updated = await updateProfile({ language_preference: code });
      updateUser(updated);
    } catch {
      Alert.alert('Error', 'Could not update language preference');
    } finally {
      setSavingLang(false);
    }
  };

  const sendFeedback = async (rating: number) => {
    try {
      await submitFeedback('App feedback', rating);
      setFeedbackSent(true);
    } catch {
      Alert.alert('Error', 'Could not submit feedback');
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.noUser}>{t('notSignedIn')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatar}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      {user.role === 'admin' && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Admin</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('languagePreference')}</Text>
          {savingLang && <ActivityIndicator size="small" color="#6B7280" />}
        </View>
        <View style={styles.langRow}>
          {languages.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[
                styles.langChip,
                user.language_preference === l.code && styles.langChipActive,
                savingLang && styles.langChipDisabled,
              ]}
              onPress={() => handleLanguageChange(l.code)}
              disabled={savingLang}
            >
              <Text style={[
                styles.langText,
                user.language_preference === l.code && styles.langTextActive,
              ]}>
                {l.label}
              </Text>
              {user.language_preference === l.code && (
                <Ionicons name="checkmark" size={13} color="#fff" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('accountSettings')}</Text>
        <TouchableOpacity style={styles.settingBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="person-outline" size={20} color="#374151" />
          <Text style={styles.settingText}>{t('editProfile')}</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingBtn} onPress={() => navigation.navigate('ChangePassword')}>
          <Ionicons name="lock-closed-outline" size={20} color="#374151" />
          <Text style={styles.settingText}>{t('changePassword')}</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('rateExperience')}</Text>
        {feedbackSent ? (
          <Text style={styles.thanks}>{t('thanksFeedback')}</Text>
        ) : (
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => sendFeedback(n)}>
                <Ionicons name="star" size={32} color="#F59E0B" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {user.role === 'admin' && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => navigation.navigate('Admin')}
        >
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
          <Text style={styles.adminBtnText}>{t('adminPanel')}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>{t('signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, alignItems: 'center', paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noUser: { color: '#9CA3AF', fontSize: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 8 },
  badge: { backgroundColor: '#FEF3C7', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 8 },
  badgeText: { color: '#92400E', fontWeight: '700', fontSize: 12 },
  section: { width: '100%', marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  langChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  langChipDisabled: { opacity: 0.5 },
  langText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  langTextActive: { color: '#fff' },
  stars: { flexDirection: 'row', gap: 8 },
  thanks: { color: '#059669', fontWeight: '600', fontSize: 15 },
  adminBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8, backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  adminBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  settingBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8 },
  settingText: { flex: 1, color: '#374151', fontWeight: '600', fontSize: 15, marginLeft: 12 },
});
