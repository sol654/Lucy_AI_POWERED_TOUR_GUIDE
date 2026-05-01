import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const FALLBACK = 'https://images.unsplash.com/photo-1578796109381-b9476eb2c249?w=800&q=80';

// Wikimedia (and some other CDNs) block the default React Native user-agent.
// Passing a browser-like User-Agent + Referer header fixes it.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
  'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
  'Referer': 'https://en.wikipedia.org/',
};

interface Props {
  uri: string | null | undefined;
  style: StyleProp<ImageStyle>;
  borderRadius?: number;
}

export default function RemoteImage({ uri, style, borderRadius }: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed || !uri ? FALLBACK : uri;

  return (
    <Image
      source={{ uri: src, headers: HEADERS }}
      style={[style, borderRadius ? { borderRadius } : undefined]}
      onError={() => setFailed(true)}
    />
  );
}
