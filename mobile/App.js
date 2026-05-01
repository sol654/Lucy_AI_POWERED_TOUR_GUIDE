import 'react-native-gesture-handler';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </I18nextProvider>
  );
}
