import React from 'react';
import { View, Text } from 'react-native';

export const Marker = (props: any) => <View {...props} />;
export const Circle = (props: any) => <View {...props} />;
export const UrlTile = (props: any) => <View {...props} />;
export const Polyline = (props: any) => <View {...props} />;

export default function MapView(props: any) {
  return (
    <View style={props.style || { flex: 1, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
      <Text>Map not supported on Web</Text>
      {props.children}
    </View>
  );
}
