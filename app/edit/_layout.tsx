import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView, StatusBar } from 'react-native';

export default function EditLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="timetable" />
        <Stack.Screen name="slots" />
      </Stack>
    </SafeAreaView>
  );
}