import React, { createElement, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LiveLocationData, DestinationLocation, RouteOption } from '../types/location.types';

interface Props {
  currentLocation: LiveLocationData | null;
  destination: DestinationLocation | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onLongPressMap: (e: any) => void;
}

export interface MapHandle {
  recenter: () => void;
}

export const SafeRouteMap = forwardRef<MapHandle, Props>(({ 
  currentLocation, destination, selectedRoute 
}, ref) => {
  
  // Default to Kolkata if location isn't ready
  const latitude = currentLocation?.latitude || 22.5750;
  const longitude = currentLocation?.longitude || 88.4280;

  const destLat = destination?.latitude || latitude;
  const destLng = destination?.longitude || longitude;

  const polylineCoords = selectedRoute?.coordinates
    ? JSON.stringify(selectedRoute.coordinates.map(c => [c.latitude, c.longitude]))
    : '[]';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: #f0f0f0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var startMarker = L.marker([${latitude}, ${longitude}]).addTo(map).bindPopup('Start');

        var destLat = ${destLat};
        var destLng = ${destLng};
        var hasDest = ${destination ? 'true' : 'false'};

        if (hasDest && (destLat !== ${latitude} || destLng !== ${longitude})) {
          L.marker([destLat, destLng]).addTo(map).bindPopup('Destination');
        }

        var routeCoords = ${polylineCoords};
        if (routeCoords.length > 0) {
          var polyline = L.polyline(routeCoords, {color: '#6D28D9', weight: 4}).addTo(map);
          map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
        } else if (hasDest) {
          var bounds = L.latLngBounds([
            [${latitude}, ${longitude}],
            [destLat, destLng]
          ]);
          map.fitBounds(bounds, { padding: [30, 30] });
        } else {
          map.setView([${latitude}, ${longitude}], 14);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {createElement('iframe', {
        srcDoc: htmlContent,
        style: { width: '100%', height: '100%', border: 'none' },
        allowFullScreen: true,
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#F1EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webFallbackText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#6D35E8',
  },
});
