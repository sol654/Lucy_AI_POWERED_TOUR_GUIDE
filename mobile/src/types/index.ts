export interface HeritageSite {
  id: string;
  name: string;
  description: string | null;
  history: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  audio_url: string | null;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  language_preference: string;
  profile_picture_url?: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  heritage_site_id: string;
  created_at: string;
}

export interface Journey {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface JourneySite {
  id: string;
  journey_id: string;
  heritage_site_id: string;
  order_index: number;
}

export interface QueryResponse {
  text: string;
  audio_base64: string | null;
  images: string[];
  map_query: string | null;
  site_coords: {
    site_name: string;
    latitude: number | null;
    longitude: number | null;
    location: string;
  } | null;
  suggested_followups: string[];
}

export interface VoiceQueryResponse {
  transcribed_text: string;
  response: QueryResponse;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  message: string;
  rating: number | null;
  created_at: string;
}

import { NavigatorScreenParams } from '@react-navigation/native';

export interface AdminStats {
  total_users: number;
  total_sites: number;
  total_feedback: number;
  total_journeys: number;
  total_favorites: number;
}

export type RootStackParamList = {
  Intro: undefined;
  Auth: { mode: 'signin' | 'signup'; redirectTo?: keyof MainTabParamList };
  Main: NavigatorScreenParams<MainTabParamList>;
  SiteDetail: { site: HeritageSite };
  JourneyDetail: { journey: Journey };
  Admin: undefined;
  EditSites: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Voice: undefined;
  Favorites: undefined;
  Journeys: undefined;
  Profile: undefined;
};
