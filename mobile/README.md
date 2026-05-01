# ሉሲ (Lucy) - Mobile Application

[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The ሉሲ (Lucy) mobile application is a cross-platform companion for exploring Ethiopian cultural heritage. Built with React Native and Expo, it provides a seamless Voice-UI experience and interactive mapping.

---

## 📱 Key Features

- **Voice Interface**: Dedicated voice screen for natural conversation with Lucy.
- **Interactive Heritage Maps**: Visual exploration of landmarks using native map integrations.
- **Multilingual UI**: The entire interface adapts to **Amharic**, **Tigrinya**, **Oromo**, and **English**.
- **User Profile**: Manage language preferences, view saved favorites, and track personal journeys.
- **Heritage Discovery**: Detailed site pages with high-quality images and AI-generated insights.

---

## 🛠 Tech Stack

- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: TypeScript for type-safe development
- **Navigation**: React Navigation (Stack & Tab navigation)
- **State Management**: React Context API
- **Maps**: Expo Maps (React Native Maps)
- **Audio**: Expo AV for voice recording and playback

---

## 🚀 Setup & Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/client) app on your physical device

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `mobile` directory:
```env
EXPO_PUBLIC_API_URL=http://your-local-ip:8000
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key
```

### 4. Run the App
```bash
# Start Expo development server
npx expo start
```
*Scan the QR code with your camera (iOS) or Expo Go app (Android) to launch the app.*

---

## 🌍 Language Support

The app uses `i18n` patterns to support:
- 🇪🇹 **Amharic (አማርኛ)**: Full Ethiopic script support.
- 🇪🇹 **Tigrinya (ትግርኛ)**: Specialized Ethiopic localization.
- 🇪🇹 **Oromo (Afaan Oromoo)**: Latin-based script support.
- 🇬🇧 **English**: Default international support.

---

## 📦 Build & Deployment

### Android
```bash
npx expo build:android
```

### iOS
```bash
npx expo build:ios
```

---

*For full project documentation, please refer to the [Root README](../README.md).*
