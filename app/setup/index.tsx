import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { StackNavigationProp } from '@react-navigation/stack';

import { CheckCircle, Clock, Calendar, BookOpen } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';



type SetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SetupWelcome'>;


export default function SetupWelcomeScreen() {
  const navigation = useNavigation<SetupScreenNavigationProp>();

  const { courses, slots } = useApp();

  const steps = [
    {
      title: 'Add Your Courses',
      description: 'Create all your academic courses',
      icon: <BookOpen size={24} color={Colors.primary} />,
      route: 'CoursesSetup' as keyof RootStackParamList,
      enabled: true,
      completed: courses.length > 0,
    },
    {
      title: 'Define Time Slots',
      description: 'Set your daily schedule with breaks',
      icon: <Clock size={24} color={Colors.primary} />,
      route: '/setup/slots',
      enabled: courses.length > 0,
      completed: slots.length > 0,
    },
    {
      title: 'Map Weekly Timetable',
      description: 'Assign courses to each time slot ',
      icon: <Calendar size={24} color={Colors.primary} />,
      route: 'TimetableSetup' as keyof RootStackParamList,
      enabled: slots.length > 0,
      completed: false,
    },
  ];

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);
  const currentStep = steps.findIndex(step => !step.completed) + 1 || steps.length;

  const handleStepPress = (step: any) => {
    if (!step.enabled) return;
    navigation.navigate('CoursesSetup' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
          />
          
          <Text style={styles.subtitle}>
            Let's set up your perfect academic companion in 3 simple steps
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepCard,
                !step.enabled && styles.stepCardDisabled,
                step.completed && styles.stepCardCompleted,
              ]}
              onPress={() => handleStepPress(step)}
              disabled={!step.enabled}
              activeOpacity={step.enabled ? 0.7 : 1}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>
                  {step.icon}
                  <View style={[
                    styles.stepNumber,
                    step.completed && styles.stepNumberCompleted,
                  ]}>
                    {step.completed ? (
                      <CheckCircle size={14} color="white" />
                    ) : (
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[
                      styles.stepTitle,
                      !step.enabled && styles.stepTitleDisabled,
                    ]}>
                      {step.title}
                    </Text>
                    {step.completed && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>Done</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.stepDescription,
                    !step.enabled && styles.stepDescriptionDisabled,
                  ]}>
                    {step.description}
                  </Text>
                  {!step.enabled && index > 0 && (
                    <Text style={styles.requirementText}>
                      Complete previous step first
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressText}>
              {completedSteps === steps.length 
                ? 'Setup Complete!' 
                : `Step ${currentStep} of ${steps.length}`}
            </Text>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>
        </View>

        {/* Quick Stats */}
        {completedSteps > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{slots.length}</Text>
              <Text style={styles.statLabel}>Slots</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedSteps}</Text>
              <Text style={styles.statLabel}>Steps Done</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 32,
  },


  stepCard: {
    backgroundColor: Colors.card,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  stepCardDisabled: {
    opacity: 0.6,
  },
  stepCardCompleted: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  stepIconContainer: {
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCompleted: {
    backgroundColor: Colors.success,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 5,
    textAlign: 'left',
  },
  stepTitleDisabled: {
    color: Colors.muted,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  completedBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  stepDescriptionDisabled: {
    color: Colors.border,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
});