import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { X, Check } from 'lucide-react-native';

interface EditRepositoryDetailsProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditRepositoryDetails({
  visible,
  onClose,
}: EditRepositoryDetailsProps) {
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [topics, setTopics] = useState('');
  const [isFocused, setIsFocused] = useState('description');

  const [includeReleases, setIncludeReleases] = useState(true);
  const [includeDeployments, setIncludeDeployments] = useState(true);
  const [includePackages, setIncludePackages] = useState(true);

  const Checkbox = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <Pressable style={styles.checkboxContainer} onPress={onChange}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={14} color="#ffffff" strokeWidth={3} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit repository details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#7d8590" />
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused === 'description' && styles.inputFocused,
                ]}
                placeholder="Short description of this repository"
                placeholderTextColor="#7d8590"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setIsFocused('description')}
                onBlur={() => setIsFocused('')}
              />
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused === 'website' && styles.inputFocused,
                ]}
                placeholder="Enter a valid URL"
                placeholderTextColor="#7d8590"
                value={website}
                onChangeText={setWebsite}
                onFocus={() => setIsFocused('website')}
                onBlur={() => setIsFocused('')}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Topics */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Topics (separate with spaces)</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused === 'topics' && styles.inputFocused,
                ]}
                value={topics}
                onChangeText={setTopics}
                onFocus={() => setIsFocused('topics')}
                onBlur={() => setIsFocused('')}
              />
            </View>

            {/* Checkboxes */}
            <View style={styles.checkboxGroup}>
              <Text style={styles.checkboxGroupTitle}>
                Include in the home page
              </Text>
              <Checkbox
                label="Releases"
                checked={includeReleases}
                onChange={() => setIncludeReleases(!includeReleases)}
              />
              <Checkbox
                label="Deployments"
                checked={includeDeployments}
                onChange={() => setIncludeDeployments(!includeDeployments)}
              />
              <Checkbox
                label="Packages"
                checked={includePackages}
                onChange={() => setIncludePackages(!includePackages)}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              onPress={() => {
                // handle save
                onClose();
              }}
            >
              <Text style={styles.saveButtonText}>Save changes</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 4, 9, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0d1117',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 8px 24px rgba(1, 4, 9, 0.4)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#161b22',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  headerTitle: {
    color: '#e6edf3',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#e6edf3',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e6edf3',
    fontSize: 14,
  },
  inputFocused: {
    borderColor: '#2f81f7',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        boxShadow: '0 0 0 3px rgba(47, 129, 247, 0.3)',
      } as any,
    }),
  },
  checkboxGroup: {
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxGroupTitle: {
    color: '#e6edf3',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8b949e',
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#2f81f7',
    borderColor: '#2f81f7',
  },
  checkboxLabel: {
    color: '#e6edf3',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  cancelButton: {
    backgroundColor: '#21262d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(240, 246, 252, 0.1)',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#238636',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
