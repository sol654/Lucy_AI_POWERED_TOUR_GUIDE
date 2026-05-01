import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, StatusBar, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Intro'> };

const FEATURES = [
  { icon: '🗺️', title: 'Interactive Maps', desc: 'Explore heritage sites on a live map.', redirectTo: 'Map' as const },
  { icon: '🎙️', title: 'ሉሲ Chat Support', desc: 'Ask ሉሲ anything about Ethiopian heritage sites.', redirectTo: 'Voice' as const },
  { icon: '🔖', title: 'Save Journeys', desc: 'Build personalized travel itineraries.', redirectTo: 'Journeys' as const },
];

export default function IntroScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://www.image2url.com/r2/default/images/1776639034021-ca469a12-5476-4450-8cb6-d5b920eaedf9.jpg' }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.overlay} />
        <Text style={styles.heroTitle}>Discover Ethiopia</Text>
        <Text style={styles.heroSub}>
          Your AI-powered guide to ancient heritage sites in Ethiopia.
        </Text>
      </ImageBackground>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.title}
            style={styles.featureCard}
            onPress={() => navigation.navigate('Auth', { mode: 'signup', redirectTo: f.redirectTo })}
          >
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Auth', { mode: 'signup' })}>
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Auth', { mode: 'signin' })}>
          <Text style={styles.btnSecondaryText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  hero: { margin: 16, height: 320, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end', padding: 20 },
  heroImage: { borderRadius: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,40,0.25)' },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  heroSub: { color: '#E2E8F0', fontSize: 15, lineHeight: 22 },
  features: { paddingHorizontal: 16, marginTop: 8 },
  featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  featureIcon: { fontSize: 28, marginRight: 14 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#6B7280' },
  actions: { paddingHorizontal: 16, marginTop: 16 },
  btnPrimary: { backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnSecondary: { backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  btnSecondaryText: { color: '#111827', fontWeight: '700', fontSize: 16 },
});
