import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

type EditNoteScreenProps = {
  noteId: string;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export default function EditNoteScreen({ noteId }: EditNoteScreenProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const goToListNotes = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const loadNote = async () => {
      try {
        const note = await noteService.readNote(noteId);

        if (!isMounted) {
          return;
        }

        if (!note) {
          Alert.alert('Note not found', 'The selected note no longer exists.');
          goToListNotes();
          return;
        }

        setTitle(note.title);
        setContent(note.content);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        Alert.alert('Unable to load note', getErrorMessage(error));
        goToListNotes();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadNote();

    return () => {
      isMounted = false;
    };
  }, [goToListNotes, noteId]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError('Title is required.');
      return;
    }

    setValidationError(null);
    setSaving(true);

    try {
      await noteService.updateNote(noteId, trimmedTitle, content);
      goToListNotes();
    } catch (error) {
      Alert.alert('Unable to save note', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete note', 'This action cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void handleDelete();
        },
      },
    ]);
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await noteService.deleteNote(noteId);
      goToListNotes();
    } catch (error) {
      Alert.alert('Unable to delete note', getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const isSubmitting = saving || deleting;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          editable={!isSubmitting}
          onChangeText={(value) => {
            setTitle(value);
            if (validationError) {
              setValidationError(null);
            }
          }}
          placeholder="Enter note title"
          style={[styles.input, validationError ? styles.inputError : null]}
          value={title}
        />
        {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          editable={!isSubmitting}
          multiline
          numberOfLines={10}
          onChangeText={setContent}
          placeholder="Write your note"
          style={[styles.input, styles.contentInput]}
          textAlignVertical="top"
          value={content}
        />
      </View>

      <View style={styles.buttonGroup}>
        <Pressable
          disabled={isSubmitting}
          onPress={() => {
            void handleSave();
          }}
          style={[styles.button, styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}>
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>

        <Pressable
          disabled={isSubmitting}
          onPress={confirmDelete}
          style={[styles.button, styles.deleteButton, isSubmitting ? styles.buttonDisabled : null]}>
          <Text style={styles.buttonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
        </Pressable>

        <Pressable
          disabled={isSubmitting}
          onPress={goToListNotes}
          style={[styles.button, styles.secondaryButton, isSubmitting ? styles.buttonDisabled : null]}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
  },
  contentContainer: {
    gap: 20,
    padding: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  contentInput: {
    minHeight: 180,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
});
