import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#1F2937" />
        <Text style={styles.headerTitle}>Emergency Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Feather name="settings" size={48} color="#6D28D9" />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.desc}>This screen is accessed via the side drawer navbar.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 16 },
  desc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});
