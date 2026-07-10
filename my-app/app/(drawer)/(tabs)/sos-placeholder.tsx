import React from 'react';
import { View } from 'react-native';

export default function SOSPlaceholderScreen() {
  // This is a dummy screen. The actual SOS button in the tab bar intercepts the press
  // and routes to /sos/active. This file exists just to prevent Expo Router warnings.
  return <View />;
}
