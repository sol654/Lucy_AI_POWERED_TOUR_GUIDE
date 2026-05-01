import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { forgotPassword } from '../services/api';

type Props = {
  route: RouteProp<RootStackParamList, 'ForgotPassword'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !securityAnswer || !newPassword) return Alert.alert('Error', 'Please fill all fields');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    setLoading(true);
    try {
      await forgotPassword(email, securityAnswer, newPassword);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.detail ||
        e?.message ||
        String(e) ||
        'Failed to reset password';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.sub}>
          Enter your email, answer your security question, and set a new password.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Security Answer</Text>
          <TextInput style={styles.input} value={securityAnswer} onChangeText={setSecurityAnswer} placeholder="Your answer" secureTextEntry placeholderTextColor="#9CA3AF" />
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back to Sign In</Text>
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