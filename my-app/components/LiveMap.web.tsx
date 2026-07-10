import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

export default function LiveMap({ location }: any) {
  if (location) {
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    // An embedded real map for the Web using an iframe
    return (
      <View pointerEvents="none" style={{ width: '100%', height: '100%' }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`}
        ></iframe>
      </View>
    );
  }

  // Fallback map image if location is still fetching
  return (
    <View pointerEvents="none" style={{ width: '100%', height: '100%' }}>
      <Image 
        source={require('@/assets/images/map_bg.png')} 
        style={{ width: '100%', height: '100%' }} 
        contentFit="cover" 
      />
    </View>
  );
}
