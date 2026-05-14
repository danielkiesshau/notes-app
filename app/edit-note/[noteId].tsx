import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import EditNoteScreen from '@/src/screens/EditNoteScreen';

export default function EditNoteRoute() {
  const { noteId } = useLocalSearchParams<{ noteId?: string | string[] }>();
  const resolvedNoteId = Array.isArray(noteId) ? noteId[0] : noteId;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Note',
          headerBackTitle: 'Notes',
        }}
      />
      {resolvedNoteId ? (
        <EditNoteScreen noteId={resolvedNoteId} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text>Missing note ID.</Text>
        </View>
      )}
    </>
  );
}
