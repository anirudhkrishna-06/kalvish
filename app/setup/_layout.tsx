import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

export default function SetupLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="courses" />
        <Stack.Screen name="slots" />
        <Stack.Screen name="timetable" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});