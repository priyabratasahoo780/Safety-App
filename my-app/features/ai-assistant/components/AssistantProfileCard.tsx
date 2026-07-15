import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, CheckCircle2 } from 'lucide-react-native';
import { ASSISTANT_NAME, ASSISTANT_DESCRIPTION } from '../constants/assistant.constants';

interface Props {}

export function AssistantProfileCard({}: Props = {}) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Bot size={42} color="#6D35E8" />
        <View style={styles.shieldBadge}>
          <CheckCircle2 size={12} color="#FFFFFF" fill="#6D35E8" />
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{ASSISTANT_NAME}</Text>
          <CheckCircle2 size={14} color="#6D35E8" />
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Offline (Blocked by Config)
          </Text>
        </View>
        
        <Text style={styles.description}>{ASSISTANT_DESCRIPTION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F2ECFF',
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E3F2',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    shadowColor: '#6D35E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10153A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#12B76A', // Green for online/active
  },
  statusText: {
    fontSize: 12,
    color: '#596080',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#596080',
    lineHeight: 18,
  },
});
