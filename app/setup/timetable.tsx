import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DayTimetableForm from '@/components/setup/DayTimetableForm';
import {
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  Coffee,
  Utensils
} from 'lucide-react-native';
import { Day, DayTimetable, SlotAssignment } from '@/types/Timetable';
import { SlotType } from '@/types/Slot';
import { DAYS, DAY_LABELS, DAY_SHORT_LABELS } from '@/constants/Days';
import { SLOT_TYPE_CONFIG, NON_COURSE_TYPES } from '@/constants/SlotTypes';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TimetableSetup'>;



const { width } = Dimensions.get('window');

export default function TimetableSetupScreen() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const { slots, courses, timetable: existingTimetable, saveTimetable, completeSetup } = useApp();
  
  const [currentDay, setCurrentDay] = useState<Day>(Day.MONDAY);
  const [assignments, setAssignments] = useState<Record<Day, SlotAssignment[]>>(
    {} as Record<Day, SlotAssignment[]>
  );
  const [isSaving, setIsSaving] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<Record<Day, boolean>>(
    {} as Record<Day, boolean>
  );

  // Load existing timetable
  useEffect(() => {
    if (existingTimetable.length > 0) {
      const newAssignments: Record<Day, SlotAssignment[]> = {} as Record<Day, SlotAssignment[]>;
      const newStatus: Record<Day, boolean> = {} as Record<Day, boolean>;
      
      DAYS.forEach(day => {
        const dayTimetable = existingTimetable.find(t => t.day === day);
        if (dayTimetable) {
          newAssignments[day] = dayTimetable.slotAssignments;
          newStatus[day] = isDayComplete(dayTimetable.slotAssignments);
        } else {
          newAssignments[day] = [];
          newStatus[day] = false;
        }
      });
      
      setAssignments(newAssignments);
      setCompletionStatus(newStatus);
    } else {
      // Initialize empty assignments
      const emptyAssignments: Record<Day, SlotAssignment[]> = {} as Record<Day, SlotAssignment[]>;
      const emptyStatus: Record<Day, boolean> = {} as Record<Day, boolean>;
      
      DAYS.forEach(day => {
        emptyAssignments[day] = [];
        emptyStatus[day] = false;
      });
      
      setAssignments(emptyAssignments);
      setCompletionStatus(emptyStatus);
    }
  }, [existingTimetable]);

  const isDayComplete = (dayAssignments: SlotAssignment[]): boolean => {
  if (slots.length === 0) return false;
  
  // Count only NON-BREAK slots (8 periods)
  const nonBreakSlots = slots.filter(slot => !slot.isBreak);
  
  // Count assigned course slots
  const assignedCourseSlots = dayAssignments.filter(assignment => 
    assignment.type === SlotType.COURSE && assignment.courseId
  );
  
  // Count assigned non-course slots (Library, Mentor, Free)
  const assignedNonCourseSlots = dayAssignments.filter(assignment => 
    NON_COURSE_TYPES.includes(assignment.type)
  );
  
  // Total assigned = courses + non-courses
  const totalAssigned = assignedCourseSlots.length + assignedNonCourseSlots.length;
  
  // All 8 periods should be assigned (either courses OR non-courses)
  return totalAssigned >= nonBreakSlots.length;
};

  const handleDayChange = (day: Day) => {
    setCurrentDay(day);
  };

  const handleAssignmentsChange = (day: Day, newAssignments: SlotAssignment[]) => {
    setAssignments(prev => ({
      ...prev,
      [day]: newAssignments,
    }));
    
    // Update completion status
    const isComplete = isDayComplete(newAssignments);
    setCompletionStatus(prev => ({
      ...prev,
      [day]: isComplete,
    }));
  };

  const getDayStats = (day: Day) => {
    const dayAssignments = assignments[day] || [];
    
    const courseCount = dayAssignments.filter(a => 
      a.type === SlotType.COURSE && a.courseId
    ).length;
    
    const libraryCount = dayAssignments.filter(a => 
      a.type === SlotType.LIBRARY
    ).length;
    
    const mentorCount = dayAssignments.filter(a => 
      a.type === SlotType.MENTOR
    ).length;
    
    const freeCount = dayAssignments.filter(a => 
      a.type === SlotType.FREE
    ).length;
    
    return { courseCount, libraryCount, mentorCount, freeCount };
  };

  const validateTimetable = (): boolean => {
  // Check if all days have all slots assigned
  const incompleteDays = DAYS.filter(day => {
    const dayAssignments = assignments[day] || [];
    return !isDayComplete(dayAssignments);
  });

  if (incompleteDays.length > 0) {
    Alert.alert(
      'Incomplete Timetable',
      `Please assign all time slots for: ${incompleteDays.map(d => DAY_LABELS[d]).join(', ')}\n\nRemember: Each slot can be Course, Library, Mentor, or Free.`,
      [{ text: 'OK' }]
    );
    return false;
  }

  return true;
};
  const handleSave = async () => {
    if (slots.length === 0) {
      Alert.alert('No Time Slots', 'Please set up time slots first.');
      navigation.goBack();
      return;
    }

    if (courses.length === 0) {
      Alert.alert('No Courses', 'Please add courses first.');
      navigation.navigate("CoursesSetup");
      return;
    }

    if (!validateTimetable()) {
      return;
    }

    setIsSaving(true);
    try {
      // Convert assignments to timetable format
      const newTimetable: DayTimetable[] = DAYS.map(day => ({
        day,
        slotAssignments: assignments[day] || [],
      }));

      await saveTimetable(newTimetable);
      await completeSetup();
      
      Alert.alert(
        'Setup Complete! 🎉',
        'Your timetable has been saved successfully. You can now view your daily schedule.',
        [{ 
          text: 'View Timetable', 
          onPress: () => navigation.replace('TodayTimetable') 
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save timetable. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderDayTab = (day: Day) => {
    const isActive = currentDay === day;
    const isComplete = completionStatus[day];
    const stats = getDayStats(day);
    
    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayTab, isActive && styles.dayTabActive]}
        onPress={() => handleDayChange(day)}
        activeOpacity={0.7}
      >
        <View style={styles.dayTabHeader}>
          <Text style={[
            styles.dayTabName,
            isActive && styles.dayTabNameActive,
          ]}>
            {DAY_SHORT_LABELS[day]}
          </Text>
          {isComplete && (
            <CheckCircle size={12} color={Colors.success} />
          )}
        </View>
        
        {isActive && (
          <View style={styles.dayStats}>
            <View style={styles.statItem}>
              <BookOpen size={12} color="#3B82F6" />
              <Text style={styles.statText}>{stats.courseCount}</Text>
            </View>
            {stats.libraryCount > 0 && (
              <View style={styles.statItem}>
                <BookOpen size={12} color="#10B981" />
                <Text style={styles.statText}>{stats.libraryCount}</Text>
              </View>
            )}
            {stats.mentorCount > 0 && (
              <View style={styles.statItem}>
                <BookOpen size={12} color="#8B5CF6" />
                <Text style={styles.statText}>{stats.mentorCount}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const calculateOverallProgress = () => {
    const completedDays = DAYS.filter(day => completionStatus[day]).length;
    return Math.round((completedDays / DAYS.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Weekly Timetable</Text>
            <Text style={styles.subtitle}>
              Assign courses to each time slot for every day
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercent}>{overallProgress}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${overallProgress}%` }
              ]} 
            />
          </View>
          
          <View style={styles.progressStats}>
            <Text style={styles.progressStat}>
              {DAYS.filter(day => completionStatus[day]).length} of {DAYS.length} days complete
            </Text>
          </View>
        </View>

        {/* Day Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daysScroll}
        >
          <View style={styles.daysContainer}>
            {DAYS.map(renderDayTab)}
          </View>
        </ScrollView>

        {/* Current Day Timetable */}
        <View style={styles.currentDayContainer}>
          {slots.length > 0 && courses.length > 0 ? (
            <DayTimetableForm
              day={currentDay}
              slots={slots}
              courses={courses}
              assignments={assignments[currentDay] || []}
              onChange={(newAssignments) => 
                handleAssignmentsChange(currentDay, newAssignments)
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color={Colors.muted} />
              <Text style={styles.emptyStateTitle}>Missing Data</Text>
              <Text style={styles.emptyStateText}>
                {slots.length === 0 && 'Please set up time slots first.'}
                {slots.length > 0 && courses.length === 0 && 'Please add courses first.'}
              </Text>
              <TouchableOpacity
                style={styles.fixButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.fixButtonText}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Course</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Library</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Mentor</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: '#9CA3AF' }]} />
              <Text style={styles.legendText}>Free</Text>
            </View>
            <View style={styles.legendItem}>
              <Coffee size={16} color="#6B7280" />
              <Text style={styles.legendText}>Short Break</Text>
            </View>
            <View style={styles.legendItem}>
              <Utensils size={16} color="#F59E0B" />
              <Text style={styles.legendText}>Lunch Break</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back to Slots</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.saveButton,
              (overallProgress < 100 || isSaving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={overallProgress < 100 || isSaving}
            activeOpacity={0.8}
          >
            {overallProgress === 100 ? (
              <>
                <CheckCircle size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Complete Setup'}
                </Text>
              </>
            ) : (
              <>
                <Calendar size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {overallProgress}% Complete
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.muted,
    lineHeight: 22,
  },
  progressSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
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
  progressStats: {
    alignItems: 'center',
  },
  progressStat: {
    fontSize: 14,
    color: Colors.muted,
  },
  daysScroll: {
    marginBottom: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  dayTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dayTabName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.muted,
  },
  dayTabNameActive: {
    color: Colors.primary,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '600',
  },
  currentDayContainer: {
    flex: 1,
    minHeight: 400,
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  fixButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fixButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  legendIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  backButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});