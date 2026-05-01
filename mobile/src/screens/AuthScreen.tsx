import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = {
  route: RouteProp<RootStackParamList, 'Auth'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function AuthScreen({ route, navigation }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>(route.params?.mode || 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const submit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    if (mode === 'signup' && !name) return Alert.alert('Error', 'Name is required');
    if (mode === 'signup' && password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');
    if (mode === 'signup' && (!securityQuestion || !securityAnswer))
      return Alert.alert('Error', 'Security question and answer are required');
    setLoading(true);
    try {
      let userName = '';
      if (mode === 'signin') {
        const user = await login(email, password);
        userName = user.name;
        Alert.alert('Welcome', `Welcome back, ${userName}!`);
      } else {
        const user = await register(name, email, password, securityQuestion, securityAnswer);
        userName = user.name;
        Alert.alert('Welcome', `Welcome to ሉሲ, ${userName}!`);
      }
      const targetTab = route.params?.redirectTo;
      if (targetTab) {
        navigation.navigate('Main', { screen: targetTab });
      }
      // Navigator automatically switches to Main stack when user state updates
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.detail ||
        e?.message ||
        String(e) ||
        'Authentication failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.sub}>
          {mode === 'signin' ? 'Sign in to continue your journey.' : 'Join ሉሲ and explore Ethiopia.'}
        </Text>

        {mode === 'signup' && (
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#9CA3AF" />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9CA3AF" />
        </View>

        {mode === 'signup' && (
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, confirmPassword.length > 0 && password !== confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>
        )}

        {mode === 'signup' && (
          <View style={styles.field}>
            <Text style={styles.label}>Security Question</Text>
            <TextInput style={styles.input} value={securityQuestion} onChangeText={setSecurityQuestion} placeholder="e.g., What is your favorite color?" placeholderTextColor="#9CA3AF" />
          </View>
        )}

        {mode === 'signup' && (
          <View style={styles.field}>
            <Text style={styles.label}>Security Answer</Text>
            <TextInput style={styles.input} value={securityAnswer} onChangeText={setSecurityAnswer} placeholder="Your answer" secureTextEntry placeholderTextColor="#9CA3AF" />
          </View>
        )}

        <TouchableOpacity style={styles.btnPrimary} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.toggle}>
            {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>

        {mode === 'signin' && (
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
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
  toggle: { textAlign: 'center', color: '#4B5563', fontSize: 14 },
  forgot: { textAlign: 'center', color: '#3B82F6', fontSize: 14, marginTop: 12 },
});
