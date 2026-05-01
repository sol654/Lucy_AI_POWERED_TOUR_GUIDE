const apiUrl = process.env.EXPO_PUBLIC_API_URL || undefined;
const geoapifyKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || '3f12f82ec1354dff82b3073996487c9d';

module.exports = {
  expo: {
    name: 'lucy-ai-guide-mobile',
    slug: 'lucy-ai-guide-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    // icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    // splash: {
    //   image: './assets/splash.png',
    //   resizeMode: 'contain',
    //   backgroundColor: '#ffffff',
    // },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      // adaptiveIcon: {
      //   foregroundImage: './assets/adaptive-icon.png',
      //   backgroundColor: '#ffffff',
      // },
      package: 'com.eaxayaz.lucyai',
    },
    web: {
      // favicon: './assets/favicon.png',
    },
    extra: {
      ...(apiUrl ? { apiUrl } : {}),
      geoapifyKey,
    },
    plugins: [
      "expo-audio"
    ]
  },
};
