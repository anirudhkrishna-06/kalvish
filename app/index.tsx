import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Clock,
  Calendar, // <- add this
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

export default function IndexScreen() {
  const navigation = useNavigation<IndexScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

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
        <Text style={styles.title}>📚 TimetableMaster</Text>
        <Text style={styles.subtitle}>Your Personal Academic Companion</Text>
        
        {!isSetupComplete && (
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SetupWelcome')}
        >
          <Text style={styles.buttonText}>Start Setup Wizard</Text>
        </TouchableOpacity>
        )
        }
        
        {isSetupComplete && (
        <>
            <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('TodayTimetable')}
            >
            <Text style={styles.secondaryButtonText}>Go to Today's Timetable</Text>
            </TouchableOpacity>

            {/* ADD THIS NEW BUTTON */}
            <TouchableOpacity 
            style={styles.tertiaryButton}
            onPress={() => navigation.navigate('FullTimetable')}
            >
            <Calendar size={20} color={Colors.text} />
            <Text style={styles.tertiaryButtonText}>View Complete Timetable</Text>
            </TouchableOpacity>
        </>
        )}
        
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Features:</Text>
          <Text style={styles.featureItem}>• One-time timetable setup</Text>
          <Text style={styles.featureItem}>• 8 periods + 3 breaks structure</Text>
          <Text style={styles.featureItem}>• Course progress tracking</Text>
          <Text style={styles.featureItem}>• Completely offline</Text>
          <Text style={styles.featureItem}>• Beautiful & simple interface</Text>
        </View>
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
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.muted,
    marginBottom: 48,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  featureList: {
    width: '100%',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 6,
    lineHeight: 20,
  },
  tertiaryButton: {
  backgroundColor: Colors.card,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 40,
  paddingVertical: 18,
  borderRadius: 16,
  width: '100%',
  marginBottom: 16,
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