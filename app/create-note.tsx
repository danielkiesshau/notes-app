import { Stack } from 'expo-router';

import CreateNoteScreen from '@/src/screens/CreateNoteScreen';

export default function CreateNoteRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Note',
          headerBackTitle: 'Notes',
        }}
      />
      <CreateNoteScreen />
    </>
  );
}
