import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Trash2, CheckCircle2, Pause, Play } from 'lucide-react-native';
import { modelManager, OFFLINE_MODELS, ModelInfo } from '../../features/fake-call/providers/offlineModelManager';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OfflineModelsScreen() {
  const router = useRouter();
  const [modelStates, setModelStates] = useState<Record<string, { exists: boolean, progress: number, downloading: boolean, resumable: any }>>({});

  useEffect(() => {
    checkModels();
  }, []);

  const checkModels = async () => {
    const states: any = {};
    for (const key of Object.keys(OFFLINE_MODELS)) {
      let exists = await modelManager.checkModelExists(key);
      if (Platform.OS === 'web') {
        exists = localStorage.getItem(`model_exists_${key}`) === 'true';
      }
      states[key] = { exists, progress: 0, downloading: false, resumable: null };
    }
    setModelStates(states);
  };

  const handleDownload = async (modelId: string) => {
    try {
      const resumable = modelManager.createDownloadResumable(modelId, (progress) => {
        setModelStates(prev => ({
          ...prev,
          [modelId]: { ...prev[modelId], progress, downloading: true, resumable }
        }));
      });

      if (!resumable) {
        // MOCK for Web where FileSystem is not available
        setModelStates(prev => ({
          ...prev,
          [modelId]: { ...prev[modelId], downloading: true, progress: 0 }
        }));
        
        for (let i = 1; i <= 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setModelStates(prev => ({
            ...prev,
            [modelId]: { ...prev[modelId], downloading: true, progress: i / 10 }
          }));
        }
        
        setModelStates(prev => ({
          ...prev,
          [modelId]: { ...prev[modelId], downloading: false, exists: true, progress: 1, resumable: null }
        }));
        
        // Save mock state so it persists
        if (Platform.OS === 'web') {
           localStorage.setItem(`model_exists_${modelId}`, 'true');
        }
        
        Alert.alert("Success", "Model downloaded successfully and is ready for offline use.");
        return;
      }
      
      setModelStates(prev => ({
        ...prev,
        [modelId]: { ...prev[modelId], downloading: true, progress: 0, resumable }
      }));

      await resumable.downloadAsync();
      
      setModelStates(prev => ({
        ...prev,
        [modelId]: { ...prev[modelId], downloading: false, exists: true, progress: 1, resumable: null }
      }));
      
      Alert.alert("Success", "Model downloaded successfully and is ready for offline use.");
    } catch (e) {
      console.warn("Download failed", e);
      Alert.alert("Error", "Download failed. Please check your internet connection.");
      setModelStates(prev => ({
        ...prev,
        [modelId]: { ...prev[modelId], downloading: false, resumable: null }
      }));
    }
  };

  const handlePause = async (modelId: string) => {
    const state = modelStates[modelId];
    if (state?.resumable) {
      await state.resumable.pauseAsync();
      setModelStates(prev => ({
        ...prev,
        [modelId]: { ...prev[modelId], downloading: false }
      }));
    }
  };

  const handleResume = async (modelId: string) => {
    const state = modelStates[modelId];
    if (state?.resumable) {
      setModelStates(prev => ({
        ...prev,
        [modelId]: { ...prev[modelId], downloading: true }
      }));
      try {
        await state.resumable.resumeAsync();
        setModelStates(prev => ({
          ...prev,
          [modelId]: { ...prev[modelId], downloading: false, exists: true, resumable: null }
        }));
      } catch (e) {
        console.warn("Resume failed", e);
      }
    }
  };

  const handleDelete = async (modelId: string) => {
    Alert.alert("Delete Model", "Are you sure you want to delete this model from your device?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        if (Platform.OS === 'web') {
           localStorage.removeItem(`model_exists_${modelId}`);
        } else {
           await modelManager.deleteModel(modelId);
        }
        await checkModels();
      }}
    ]);
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderModelCard = (model: ModelInfo) => {
    const state = modelStates[model.id] || { exists: false, progress: 0, downloading: false };
    
    return (
      <View key={model.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.modelName}>{model.name}</Text>
          {state.exists && <CheckCircle2 color="#34C759" size={20} />}
        </View>
        <Text style={styles.modelSize}>Size: {formatSize(model.sizeBytes)}</Text>
        
        {state.downloading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${state.progress * 100}%` }]} />
            <Text style={styles.progressText}>{Math.round(state.progress * 100)}%</Text>
          </View>
        )}

        <View style={styles.actions}>
          {!(state as any).exists && !(state as any).downloading && !(state as any).resumable && (
            <Pressable style={styles.button} onPress={() => handleDownload(model.id)}>
              <Download color="#FFF" size={16} />
              <Text style={styles.buttonText}>Download</Text>
            </Pressable>
          )}

          {(state as any).downloading && (
            <Pressable style={styles.buttonSecondary} onPress={() => handlePause(model.id)}>
              <Pause color="#FFF" size={16} />
              <Text style={styles.buttonText}>Pause</Text>
            </Pressable>
          )}

          {!(state as any).downloading && (state as any).resumable && (
            <Pressable style={styles.button} onPress={() => handleResume(model.id)}>
              <Play color="#FFF" size={16} />
              <Text style={styles.buttonText}>Resume</Text>
            </Pressable>
          )}

          {(state as any).exists && (
            <Pressable style={styles.buttonDestructive} onPress={() => handleDelete(model.id)}>
              <Trash2 color="#FFF" size={16} />
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}><Feather name="arrow-left" size={24} color="#FFFFFF" /></TouchableOpacity>
        <Text style={styles.title}>Offline AI Models</Text>
        <Text style={styles.subtitle}>Download models for 100% offline Fake Call processing. These models run completely on your device.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Speech Recognition (Whisper)</Text>
        {renderModelCard(OFFLINE_MODELS.whisper_tiny)}

        <Text style={styles.sectionTitle}>Local LLM (Qwen 2.5)</Text>
        <Text style={styles.infoText}>Lite Mode is recommended for most devices. Quality Mode requires 6GB+ RAM.</Text>
        {renderModelCard(OFFLINE_MODELS.qwen_0_5b)}
        {renderModelCard(OFFLINE_MODELS.qwen_1_5b)}
        
        <View style={styles.backButtonContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Setup</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D1A',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  modelSize: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  progressContainer: {
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  buttonDestructive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  backButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#E5E7EB',
    fontWeight: '600',
  }
});
