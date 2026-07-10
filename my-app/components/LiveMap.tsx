import React from 'react';
import MapView from 'react-native-maps';
import { View } from 'react-native';
import { Image } from 'expo-image';

export default function LiveMap({ location }: any) {
  return (
    <View pointerEvents="none" style={{ width: '100%', height: '100%' }}>
      {location ? (
        <MapView
          style={{ width: '100%', height: '100%' }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        />
      ) : (
        <Image 
          source={require('@/assets/images/map_bg.png')} 
          style={{ width: '100%', height: '100%' }} 
          contentFit="cover" 
        />
      )}
    </View>
  );
}
