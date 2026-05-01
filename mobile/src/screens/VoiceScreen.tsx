import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, TextInput, Linking,
} from 'react-native';
import { useAudioRecorder, AudioModule, RecordingPresets, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { textQuery, voiceQuery, updateProfile, getSites } from '../services/api';
import { QueryResponse, RootStackParamList, HeritageSite } from '../types';
import { GEOAPIFY_KEY } from '../config';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function buildMiniMapHTML(lat: number, lon: number, name: string): string {
  const safe = (s: string) => s.replace(/'/g, "\\'").replace(/"/g, '\\"');
  return `<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>*{margin:0;padding:0;}html,body,#map{width:100%;height:100%;}</style>
</head>
<body><div id="map"></div>
<script>
  const map = L.map('map',{zoomControl:false,attributionControl:false}).setView([${lat},${lon}],10);
  L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}',{maxZoom:20}).addTo(map);
  const icon = L.divIcon({html:'<div style="width:20px;height:20px;background:#F59E0B;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',iconSize:[20,20],iconAnchor:[10,20],className:''});
  L.marker([${lat},${lon}],{icon}).addTo(map).bindPopup('${safe(name)}').openPopup();
</script></body></html>`;
}

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'am', label: 'አማ', full: 'Amharic' },
  { code: 'ti', label: 'ትግ', full: 'Tigrinya' },
  { code: 'or', label: 'Oro', full: 'Oromo' },
];

const UI_TEXTS: Record<string, { title: string; sub: string; micHint: string; micHintActive: string; placeholder: string; listenLabel: string; playingLabel: string; askLabel: string; siteViewLabel: string; } > = {
  en: {
    title: 'Ask ሉሲ',
    sub: 'English · Tap mic or type',
    micHint: 'Tap to speak',
    micHintActive: 'Tap to stop',
    placeholder: 'Ask ሉሲ about Ethiopian heritage...',
    listenLabel: 'Listen to ሉሲ',
    playingLabel: 'Playing ሉሲ',
    askLabel: 'Ask ሉሲ',
    siteViewLabel: 'View Site',
  },
  am: {
    title: 'ሉሲን ጠይቁ',
    sub: 'አማርኛ · ማዕቀብ ወይም ጽሁፍ ይጠቀሙ',
    micHint: 'ለመናገር ይጫኑ',
    micHintActive: 'ለመቆም ይጫኑ',
    placeholder: 'ስለ ኢትዮጵያ ቅርስ ይጠይቁ...',
    listenLabel: 'ሉሲን ስማ',
    playingLabel: 'ሉሲን እየተሰማ ነው',
    askLabel: 'ሉሲን ጠይቁ',
    siteViewLabel: 'ጣብያ ይመልከቱ',
  },
  ti: {
    title: 'ሉሲን ጠይቁ',
    sub: 'ትግርኛ · መናገር ወይም ጽሁፍ ይጠቀሙ',
    micHint: 'ብርሃኑ ለመናገር ይጫኑ',
    micHintActive: 'ለመቆም ይጫኑ',
    placeholder: 'ስለ ኢትዮጵያ ቅርስ ይጠይቁ...',
    listenLabel: 'ሉሲን ተስማ',
    playingLabel: 'ሉሲን እየተሰማ እያለው',
    askLabel: 'ሉሲን ጠይቁ',
    siteViewLabel: 'ጣብያ ይቁርሙ',
  },
  or: {
    title: 'ሉሲ gaafadhu',
    sub: 'Oromo · Sagalee yookiin barruu fayyadami',
    micHint: 'Dubbachuuf tuqi',
    micHintActive: 'Dhaabuuf tuqi',
    placeholder: 'Waaʼee aadaa Itoophiyaa ሉሲ gaafadhu...',
    listenLabel: 'ሉሲ dhaggeeffadhu',
    playingLabel: 'ሉሲ dhaggeeffamaa jira',
    askLabel: 'ሉሲ gaafadhu',
    siteViewLabel: 'Bakki ilaali',
  },
};

export default function VoiceScreen() {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation<Nav>();
  const [lang, setLang] = useState(user?.language_preference || 'en');
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;
  
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [transcribed, setTranscribed] = useState('');

  // Sync language from user profile every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.language_preference) {
        setLang(user.language_preference);
      }
    }, [user?.language_preference])
  );

  const handleLangChange = async (code: string) => {
    if (code === lang) return;
    setLang(code);
    // Persist to backend + update local user state so all screens stay in sync
    try {
      const updated = await updateProfile({ language_preference: code });
      updateUser(updated);
    } catch {
      // non-critical — lang is still set locally for this session
    }
  };

  const startRecording = async () => {
    try {
      await AudioModule.requestRecordingPermissionsAsync();
      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recorder.stop();
    const uri = recorder.uri;
    await AudioModule.setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (!uri) return;
    setLoading(true);
    try {
      const result = await voiceQuery(uri);
      setTranscribed(result.transcribed_text);
      setResponse(result.response);
      if (result.response.audio_base64) playAudio(result.response.audio_base64);
    } catch (e: any) {
      console.error('Voice query error:', e?.response?.data || e?.message || e);
      Alert.alert('Error', e?.response?.data?.detail || 'Voice query failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const submitText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setTranscribed('');
    try {
      const result = await textQuery(textInput, lang);
      setResponse(result);
      if (result.audio_base64) playAudio(result.audio_base64);
    } catch (e: any) {
      console.error('Text query error:', e?.response?.data || e?.message || e);
      Alert.alert('Error', e?.response?.data?.detail || 'Query failed. Please sign out and sign in again.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (base64: string) => {
    Alert.alert('Coming Soon', 'The Audio Guide feature is coming soon! Stay tuned.');
  };

  const audioSource = response?.audio_base64;

  const ui = UI_TEXTS[lang] || UI_TEXTS.en;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{ui.title}</Text>

      {/* Language selector — changes persist to profile */}
      <View style={styles.langRow}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langChip, lang === l.code && styles.langChipActive]}
            onPress={() => handleLangChange(l.code)}
          >
            <Text style={[styles.langChipText, lang === l.code && styles.langChipTextActive]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sub}>{ui.sub}</Text>

      {/* Voice button */}
      <TouchableOpacity
        style={[styles.micBtn, isRecording && styles.micBtnActive]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={loading}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.micHint}>{isRecording ? 'Tap to stop' : 'Tap to speak'}</Text>

      {/* Text input */}
      <View style={styles.textRow}>
        <TextInput
          style={styles.textInput}
          placeholder={ui.placeholder}
          placeholderTextColor="#9CA3AF"
          value={textInput}
          onChangeText={setTextInput}
          onSubmitEditing={submitText}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={submitText} disabled={loading}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#111827" />}

      {transcribed ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleLabel}>You said:</Text>
          <Text style={styles.bubbleText}>{transcribed}</Text>
        </View>
      ) : null}

      {response && (
        <View style={styles.responseBubble}>
          <Text style={styles.bubbleLabel}>ሉሲ:</Text>
          <Text style={styles.responseText}>{response.text}</Text>

          {/* Inline map when Lucy identifies a specific site */}
          {response.site_coords?.latitude && response.site_coords?.longitude && (
            <View style={styles.mapContainer}>
              <WebView
                style={styles.miniMap}
                originWhitelist={['*']}
                source={{ html: buildMiniMapHTML(
                  response.site_coords.latitude,
                  response.site_coords.longitude,
                  response.site_coords.site_name || '',
                )}}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={async () => {
                  try {
                    const sites = await getSites();
                    const match = sites.find((s: HeritageSite) =>
                      s.name.toLowerCase().includes((response.site_coords?.site_name || '').toLowerCase()) ||
                      (response.site_coords?.site_name || '').toLowerCase().includes(s.name.toLowerCase())
                    );
                    if (match) {
                      navigation.navigate('SiteDetail', { site: match });
                    } else {
                      Linking.openURL(`https://www.google.com/maps?q=${response.site_coords?.latitude},${response.site_coords?.longitude}`);
                    }
                  } catch {
                    Linking.openURL(`https://www.google.com/maps?q=${response.site_coords?.latitude},${response.site_coords?.longitude}`);
                  }
                }}
              >
                <Ionicons name="location" size={15} color="#fff" />
                <Text style={styles.mapBtnText}>{ui.siteViewLabel} {response.site_coords.site_name || ''}</Text>
              </TouchableOpacity>
            </View>
          )}

          {audioSource ? (
            <TouchableOpacity style={styles.audioControl} onPress={() => playAudio(audioSource)}>
              <Ionicons name={playing ? 'volume-high' : 'volume-medium'} size={18} color="#111827" />
              <Text style={styles.audioControlText}>{playing ? ui.playingLabel : ui.listenLabel}</Text>
            </TouchableOpacity>
          ) : null}

          {response.suggested_followups.length > 0 && (
            <View style={styles.followups}>
              {response.suggested_followups.map((q: string, i: number) => (
                <TouchableOpacity key={i} style={styles.followupChip} onPress={() => setTextInput(q)}>
                  <Text style={styles.followupText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, alignItems: 'center', paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12, alignSelf: 'flex-start' },
  langRow: { flexDirection: 'row', gap: 8, alignSelf: 'flex-start', marginBottom: 8 },
  langChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  langChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  langChipText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  langChipTextActive: { color: '#fff' },
  sub: { fontSize: 13, color: '#6B7280', marginBottom: 28, alignSelf: 'flex-start' },
  micBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  micBtnActive: { backgroundColor: '#DC2626' },
  micHint: { color: '#6B7280', fontSize: 14, marginBottom: 28 },
  textRow: { flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 },
  textInput: { flex: 1, height: 48, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  sendBtn: { width: 48, height: 48, backgroundColor: '#111827', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  bubble: { width: '100%', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 14, marginBottom: 12 },
  bubbleLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' },
  bubbleText: { fontSize: 15, color: '#374151' },
  responseBubble: { width: '100%', backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  responseText: { fontSize: 15, color: '#1E3A5F', lineHeight: 24 },
  followups: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  followupChip: { backgroundColor: '#DBEAFE', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  followupText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  mapContainer: { marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  miniMap: { width: '100%', height: 160 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F59E0B', paddingVertical: 9, paddingHorizontal: 14, justifyContent: 'center' },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  audioControl: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E0F2FE', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14, alignSelf: 'flex-start' },
  audioControlText: { color: '#075985', fontWeight: '700', fontSize: 13 },
});
