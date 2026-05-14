import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as noteService from '@/src/services/noteService';
import type { Note } from '@/src/types/note';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function ListNotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadNotes = React.useCallback(async (options?: { refreshing?: boolean }) => {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const fetchedNotes = await noteService.getAllNotes();
      setNotes(fetchedNotes);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load notes right now.');
    } finally {
      if (refreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      void loadNotes();
    }, [loadNotes])
  );

  const handleCreateNote = React.useCallback(() => {
    router.push('/create-note');
  }, [router]);

  const handleEditNote = React.useCallback(
    (noteId: string) => {
      router.push({
        pathname: '/edit-note/[noteId]',
        params: { noteId },
      });
    },
    [router]
  );

  const handleRefresh = React.useCallback(() => {
    void loadNotes({ refreshing: true });
  }, [loadNotes]);

  const renderNoteItem = React.useCallback(
    ({ item }: { item: Note }) => (
      <Pressable onPress={() => handleEditNote(item.id)} style={styles.noteCard}>
        <Text numberOfLines={1} style={styles.noteTitle}>
          {item.title.trim() || 'Untitled note'}
        </Text>
        <Text style={styles.noteDate}>Created {dateFormatter.format(new Date(item.createdAt))}</Text>
      </Pressable>
    ),
    [handleEditNote]
  );

  const renderEmptyState = React.useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>No notes yet</Text>
        <Text style={styles.emptyStateText}>Pull to refresh or create your first note to get started.</Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.subtitle}>Your saved notes appear here.</Text>
        </View>
        <Pressable onPress={handleCreateNote} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>New note</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={[
            styles.listContent,
            notes.length === 0 ? styles.emptyListContent : undefined,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        />
      )}

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={handleCreateNote} style={styles.fab}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 4,
  },
  headerButton: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerButtonText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
    paddingBottom: 96,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  noteTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  noteDate: {
    color: '#64748b',
    fontSize: 13,
  },
  centeredContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#475569',
    fontSize: 15,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    bottom: 92,
    left: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'absolute',
    right: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 28,
    bottom: 28,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: '#1d4ed8',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    width: 56,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 30,
  },
});
