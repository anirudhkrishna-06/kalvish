import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './contexts/AppContext';
import IndexScreen from './app/index';
import SetupWelcomeScreen from './app/setup/index';
import CoursesSetupScreen from './app/setup/courses';
import SlotsSetupScreen from './app/setup/slots';
import TimetableSetupScreen from './app/setup/timetable';
import TodayTimetableScreen from './app/home/index';
import HomeTabs from './components/HomeTabs';
import CourseDetailScreen from './app/courses/[id]';
import CourseListScreen from './app/courses/index';
import FullTimetableScreen from './app/full';



export type RootStackParamList = {
  Index: undefined;
  SetupWelcome: undefined;
  CoursesSetup: undefined;
  SlotsSetup: undefined;
  TimetableSetup: undefined;
  TodayTimetable: undefined;
  WeeklyTimetable: undefined;
  FullTimetable: undefined;
  CourseList: undefined;
  CourseDetail: { courseId: string };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Index"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#FFFFFF' },
            }}
          >
            <Stack.Screen name="Index" component={IndexScreen} />
            <Stack.Screen name="SetupWelcome" component={SetupWelcomeScreen} />
            <Stack.Screen name="CoursesSetup" component={CoursesSetupScreen} />
            <Stack.Screen name="SlotsSetup" component={SlotsSetupScreen} />
            <Stack.Screen name="TimetableSetup" component={TimetableSetupScreen} />
            <Stack.Screen name="TodayTimetable" component={TodayTimetableScreen} />
            <Stack.Screen name="Home" component={HomeTabs} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="CourseList" component={CourseListScreen} />
            <Stack.Screen name="FullTimetable" component={FullTimetableScreen} />




          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}