import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { changePassword } from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChangePasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!currentPassword || !newPassword) return Alert.alert('Error', 'Please fill all fields');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'New passwords do not match');
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.detail ||
        e?.message ||
        String(e) ||
        'Failed to change password';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Change Password</Text>
        <Text style={styles.sub}>
          Enter your current password and set a new one.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9CA3AF" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9CA3AF" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, confirmPassword.length > 0 && newPassword !== confirmPassword && styles.inputError]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Change Password</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  heading: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sub: { fontSize: 15, color: '#6B7280', marginBottom: 28 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  inputError: { borderColor: '#DC2626' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 4 },
  btnPrimary: { backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  back: { textAlign: 'center', color: '#4B5563', fontSize: 14 },
});