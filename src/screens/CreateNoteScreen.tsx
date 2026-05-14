import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as noteService from '../services/noteService';

const CreateNoteScreen = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = (): boolean => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError('Title is required.');
      return false;
    }

    setTitleError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await noteService.createNote(title.trim(), content);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save note.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (titleError && value.trim()) {
              setTitleError(null);
            }
          }}
          placeholder="Enter note title"
          style={[styles.input, titleError ? styles.inputError : null]}
          editable={!isSaving}
          returnKeyType="next"
        />
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your note"
          style={[styles.input, styles.contentInput]}
          editable={!isSaving}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [styles.button, styles.secondaryButton, pressed ? styles.buttonPressed : null]}
          disabled={isSaving}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            (pressed || isSaving) ? styles.buttonPressed : null,
          ]}
          disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Save</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  contentInput: {
    minHeight: 160,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default CreateNoteScreen;
