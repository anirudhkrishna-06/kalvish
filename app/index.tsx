import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Animated,
  Easing
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Clock,
  Calendar,
  BookOpen,
  Coffee,
  Utensils,
  Library,
  User,
  Smile,
  Bell,
  ChevronRight,
  MoreVertical,
  AlertCircle,
} from 'lucide-react-native';

type IndexScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Index'>;

// Animation phases duration constants
const ANIMATION_PHASES = {
  INITIAL_PAUSE: 800, // Logo stays big and centered
  LOGO_TRANSITION: 1200, // Logo shrinks and moves up
  BUTTONS_REVEAL: 600, // Buttons fade and slide in
  STAGGER_DELAY: 150, // Delay between each button appearing
};

export default function IndexScreen() {
  const navigation = useNavigation<IndexScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(1.8)).current;
  const logoTranslateY = useRef(new Animated.Value(200)).current;
  const logoOpacity = useRef(new Animated.Value(5)).current;
  
  const buttonsContainerOpacity = useRef(new Animated.Value(0)).current;
  const buttonsContainerTranslateY = useRef(new Animated.Value(100)).current;
  
  // Individual button animations for staggered reveal
  const primaryButtonOpacity = useRef(new Animated.Value(0)).current;
  const primaryButtonTranslateY = useRef(new Animated.Value(40)).current;
  
  const secondaryButtonOpacity = useRef(new Animated.Value(0)).current;
  const secondaryButtonTranslateY = useRef(new Animated.Value(10)).current;
  
  const tertiaryButtonOpacity = useRef(new Animated.Value(0)).current;
  const tertiaryButtonTranslateY = useRef(new Animated.Value(10)).current;

  // Start animations when loading completes
  useEffect(() => {
    if (!isLoading) {
      startEntranceAnimation();
    }
  }, [isLoading]);

  const startEntranceAnimation = () => {
    // Reset all animations to initial state
    logoScale.setValue(1.2);
    logoTranslateY.setValue(-150);
    logoOpacity.setValue(1);
    
    buttonsContainerOpacity.setValue(0);
    buttonsContainerTranslateY.setValue(20);
    
    primaryButtonOpacity.setValue(0);
    primaryButtonTranslateY.setValue(10);
    secondaryButtonOpacity.setValue(0);
    secondaryButtonTranslateY.setValue(10);
    tertiaryButtonOpacity.setValue(0);
    tertiaryButtonTranslateY.setValue(10);

    // Animation sequence
    Animated.sequence([
      // Phase 1: Initial pause (logo stays big and centered)
      Animated.delay(ANIMATION_PHASES.INITIAL_PAUSE),
      
      // Phase 2: Logo transition (shrink and move up)
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: ANIMATION_PHASES.LOGO_TRANSITION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-in-out
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: -340, // Move logo upward (adjust based on your design)
          duration: ANIMATION_PHASES.LOGO_TRANSITION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 3: Buttons reveal
      Animated.parallel([
        // Buttons container fade in
        Animated.timing(buttonsContainerOpacity, {
          toValue: 1,
          duration: ANIMATION_PHASES.BUTTONS_REVEAL,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(buttonsContainerTranslateY, {
          toValue: 0,
          duration: ANIMATION_PHASES.BUTTONS_REVEAL,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        
        // Staggered button animations
        Animated.sequence([
          // Primary button
          Animated.parallel([
            Animated.timing(primaryButtonOpacity, {
              toValue: 1,
              duration: ANIMATION_PHASES.BUTTONS_REVEAL,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(primaryButtonTranslateY, {
              toValue: 0,
              duration: ANIMATION_PHASES.BUTTONS_REVEAL,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          
          // Delay for secondary button
          Animated.delay(ANIMATION_PHASES.STAGGER_DELAY),
          
          // Secondary button
          Animated.parallel([
            Animated.timing(secondaryButtonOpacity, {
              toValue: 1,
              duration: ANIMATION_PHASES.BUTTONS_REVEAL,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(secondaryButtonTranslateY, {
              toValue: 0,
              duration: ANIMATION_PHASES.BUTTONS_REVEAL,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          
          // Delay for tertiary button
          Animated.delay(ANIMATION_PHASES.STAGGER_DELAY),
          
          // Tertiary button
          Animated.parallel([
            Animated.timing(tertiaryButtonOpacity, {
              toValue: 1,
              duration: ANIMATION_PHASES.BUTTONS_REVEAL,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(tertiaryButtonTranslateY, {
              toValue: 0,
              duration: ANIMATION_PHASES.BUTTONS_REVEAL,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]).start(() => {
      // Animation complete - enable interactions
      setShowContent(true);
    });
  };

  const checkSetup = async () => {
    try {
      const setupComplete = await AsyncStorage.getItem('@timetable:setup_complete');
      setIsSetupComplete(setupComplete === 'true');
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSetup();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading TimetableMaster...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image 
            source={require('../assets/logo.jpg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Buttons Container */}
        {isSetupComplete && (
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonsContainerOpacity,
                transform: [{ translateY: buttonsContainerTranslateY }],
              },
            ]}
          >
            {/* Start Setup Button */}
            <Animated.View
              style={{
                opacity: primaryButtonOpacity,
                transform: [{ translateY: primaryButtonTranslateY }],
                width: '100%',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('SetupWelcome')}
                activeOpacity={0.8}
                disabled={!showContent}
              >
                <Text style={styles.buttonText}>Start Setup</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Dive in Button */}
            <Animated.View
              style={{
                opacity: secondaryButtonOpacity,
                transform: [{ translateY: secondaryButtonTranslateY }],
                width: '100%',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('TodayTimetable')}
                activeOpacity={0.8}
                disabled={!showContent}
              >
                <Text style={styles.secondaryButtonText}>Dive in</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* View Timetable Button */}
            <Animated.View
              style={{
                opacity: tertiaryButtonOpacity,
                transform: [{ translateY: tertiaryButtonTranslateY }],
                width: '100%',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity 
                style={styles.tertiaryButton}
                onPress={() => navigation.navigate('FullTimetable')}
                activeOpacity={0.8}
                disabled={!showContent}
              >
                <Calendar size={20} color={Colors.text} />
                <Text style={styles.tertiaryButtonText}>View Timetable</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

        {/* If not setup complete, show only the setup button with animation */}
        {!isSetupComplete && (
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonsContainerOpacity,
                transform: [{ translateY: buttonsContainerTranslateY }],
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: primaryButtonOpacity,
                transform: [{ translateY: primaryButtonTranslateY }],
                width: '100%',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('SetupWelcome')}
                activeOpacity={0.8}
                disabled={!showContent}
              >
                <Text style={styles.buttonText}>Start Setup</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.muted,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 500,
    height: 500,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 120, // Adjust this based on your design
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 40,
    width: '75%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 35,
    width: '75%',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 35,
    width: '75%',
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  tertiaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});