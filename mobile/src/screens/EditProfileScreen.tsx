import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePicture } from '../services/api';
import { normalizeRemoteUrl } from '../config';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profile_picture_url || null);
  const [saving, setSaving] = useState(false);

  const currentRemoteProfileUrl = user?.profile_picture_url || null;
  const displayProfilePicture = profilePicture
    ? profilePicture === currentRemoteProfileUrl
      ? normalizeRemoteUrl(profilePicture)
      : profilePicture
    : null;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const getImageMimeType = (uri: string) => {
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    switch (extension) {
      case 'png':
        return { name: 'profile.png', type: 'image/png' };
      case 'webp':
        return { name: 'profile.webp', type: 'image/webp' };
      default:
        return { name: 'profile.jpg', type: 'image/jpeg' };
    }
  };

  const uploadImage = async () => {
    if (!profilePicture) return null;
    const formData = new FormData();
    const { name, type } = getImageMimeType(profilePicture);
    formData.append('file', {
      uri: profilePicture,
      name,
      type,
    } as any);

    const uploadResult = await uploadProfilePicture(formData);
    return uploadResult.url;
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let pictureUrl: string | undefined = user.profile_picture_url;
      if (profilePicture && profilePicture !== user.profile_picture_url) {
        const url = await uploadImage();
        if (url) pictureUrl = url;
      }

      const updated = await updateProfile({ name, profile_picture_url: pictureUrl });
      updateUser(updated);
      if (updated.profile_picture_url) {
        setProfilePicture(updated.profile_picture_url);
      }
      Alert.alert(t('success'), t('profileUpdated'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.detail ||
        e?.message ||
        String(e) ||
        'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.noUser}>Not signed in</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('editProfile')}</Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        {displayProfilePicture ? (
          <Image source={{ uri: displayProfilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="camera" size={32} color="#6B7280" />
          </View>
        )}
        <View style={styles.editIcon} pointerEvents="none">
          <Ionicons name="pencil" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>{t('fullName')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('fullName')} placeholderTextColor="#9CA3AF" />
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('save')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
        <Text style={styles.btnSecondaryText}>{t('cancel')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, alignItems: 'center', paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noUser: { color: '#9CA3AF', fontSize: 16 },
  heading: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#111827', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  field: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  btnPrimary: { backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16, width: '100%' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnSecondary: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12, width: '100%' },
  btnSecondaryText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});