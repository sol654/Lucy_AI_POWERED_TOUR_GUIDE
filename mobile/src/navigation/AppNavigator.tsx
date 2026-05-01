import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { RootStackParamList, MainTabParamList } from '../types';
import { useAuth } from '../context/AuthContext';

import IntroScreen from '../screens/IntroScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import VoiceScreen from '../screens/VoiceScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import JourneyScreen from '../screens/JourneyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SiteDetailScreen from '../screens/SiteDetailScreen';
import AdminScreen from '../screens/AdminScreen';
import EditSitesScreen from '../screens/EditSitesScreen';
import JourneyDetailScreen from '../screens/JourneyDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Map: 'map',
  Voice: 'mic',
  Favorites: 'heart',
  Journeys: 'compass',
  Profile: 'person',
};

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: '#111827',
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          elevation: 8,
          shadowOpacity: 0.05,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Ionicons name={TAB_ICONS[route.name] ?? 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('home'), tabBarLabel: t('home') }} 
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: t('map'), tabBarLabel: t('map') }} 
      />
      <Tab.Screen 
        name="Voice" 
        component={VoiceScreen} 
        options={{ title: t('voice'), tabBarLabel: t('voice') }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: t('favorites'), tabBarLabel: t('favorites') }} 
      />
      <Tab.Screen 
        name="Journeys" 
        component={JourneyScreen} 
        options={{ title: t('journeys'), tabBarLabel: t('journeys') }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: t('profile'), tabBarLabel: t('profile') }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="SiteDetail"
              component={SiteDetailScreen}
              options={{ headerShown: true, title: '' }}
            />
            {user.role === 'admin' && (
              <Stack.Screen
                name="Admin"
                component={AdminScreen}
                options={{ headerShown: true, title: 'Admin Panel', headerBackTitle: 'Back' }}
              />
            )}
            {user.role === 'admin' && (
              <Stack.Screen
                name="EditSites"
                component={EditSitesScreen}
                options={{ headerShown: true, title: 'Edit Sites', headerBackTitle: 'Back' }}
              />
            )}
            <Stack.Screen
              name="JourneyDetail"
              component={JourneyDetailScreen}
              options={{ headerShown: true, title: 'Journey', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Edit Profile', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: true, title: 'Change Password', headerBackTitle: 'Back' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: true, title: 'Forgot Password', headerBackTitle: 'Back' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
