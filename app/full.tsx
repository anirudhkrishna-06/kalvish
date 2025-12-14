import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Calendar,
  Clock,
  BookOpen,
  Coffee,
  Utensils,
  Library,
  User,
  Smile,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Share2,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import { Day, DayTimetable } from '@/types/Timetable';
import { SlotType } from '@/types/Slot';
import { DAYS, DAY_LABELS, DAY_SHORT_LABELS } from '@/constants/Days';
import { SLOT_TYPE_CONFIG } from '@/constants/SlotTypes';
import { formatTime } from '@/lib/dateUtils';

const { width } = Dimensions.get('window');

type FullTimetableNavigationProp = StackNavigationProp<RootStackParamList, 'FullTimetable'>;

const SLOT_TYPE_ICONS = {
  [SlotType.COURSE]: BookOpen,
  [SlotType.SHORT_BREAK]: Coffee,
  [SlotType.LUNCH_BREAK]: Utensils,
  [SlotType.LIBRARY]: Library,
  [SlotType.MENTOR]: User,
  [SlotType.FREE]: Smile,
} as const;

type ViewMode = 'expanded' | 'compact' | 'grid';
type DayExpandedState = Record<Day, boolean>;

export default function FullTimetableScreen() {
  const navigation = useNavigation<FullTimetableNavigationProp>();
  const { slots, courses, timetable } = useApp();
  
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [expandedDays, setExpandedDays] = useState<DayExpandedState>(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: true }), {} as DayExpandedState)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleDayExpanded = (day: Day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const toggleAllDays = () => {
    const allExpanded = Object.values(expandedDays).every(v => v);
    const newState = DAYS.reduce((acc, day) => ({ 
      ...acc, [day]: !allExpanded 
    }), {} as DayExpandedState);
    setExpandedDays(newState);
  };

  const getDayTimetable = (day: Day) => {
    const dayTimetable = timetable.find(t => t.day === day);
    if (!dayTimetable || !slots.length) return [];

    return slots.map(slot => {
      const assignment = dayTimetable.slotAssignments.find(a => a.slotId === slot.id);
      
      let assignmentData;
      if (assignment?.type === SlotType.COURSE && assignment.courseId) {
        const course = courses.find(c => c.id === assignment.courseId);
        assignmentData = {
          type: SlotType.COURSE,
          course,
        };
      } else if (assignment?.type && [SlotType.LIBRARY, SlotType.MENTOR, SlotType.FREE].includes(assignment.type)) {
        assignmentData = {
          type: assignment.type,
          label: assignment.label,
        };
      }

      return {
        ...slot,
        assignment: assignmentData,
      };
    });
  };

  const renderSlotIcon = (slot: any) => {
    const typeKey = slot.type as keyof typeof SLOT_TYPE_ICONS; // assert type
    const Icon = SLOT_TYPE_ICONS[typeKey] || BookOpen;
    const config = SLOT_TYPE_CONFIG[typeKey];
    
    if (slot.assignment?.type === SlotType.COURSE && slot.assignment.course) {
      return (
        <View style={[styles.courseIcon, { backgroundColor: slot.assignment.course.color }]}>
          <Text style={styles.courseIconText}>
            {slot.assignment.course.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
    
    return <Icon size={20} color={config.color} />;
  };

  const renderSlotContent = (slot: any) => {
    if (slot.isBreak) {
      return (
        <View style={styles.breakContent}>
          <Text style={styles.breakTitle}>{slot.name}</Text>
          <Text style={styles.breakSubtitle}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</Text>
        </View>
      );
    }

    if (slot.assignment?.type === SlotType.COURSE && slot.assignment.course) {
      const course = slot.assignment.course;
      return (
        <View style={styles.courseContent}>
          <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
          <Text style={styles.courseFaculty} numberOfLines={1}>{course.facultyName}</Text>
          {course.courseCode && (
            <Text style={styles.courseCode}>{course.courseCode}</Text>
          )}
        </View>
      );
    }

    if (slot.assignment?.type && [SlotType.LIBRARY, SlotType.MENTOR, SlotType.FREE].includes(slot.assignment.type)) {
      const typeKey = slot.assignment.type as keyof typeof SLOT_TYPE_CONFIG;
      const config = SLOT_TYPE_CONFIG[typeKey];
      return (
        <View style={styles.nonCourseContent}>
          <Text style={styles.nonCourseTitle}>{slot.assignment.label || config.label}</Text>
          <Text style={styles.nonCourseSubtitle}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContent}>
        <Text style={styles.emptyText}>No assignment</Text>
      </View>
    );
  };

  const renderExpandedDay = (day: Day) => {
    const daySlots = getDayTimetable(day);
    const isExpanded = expandedDays[day];
    
    return (
      <View key={day} style={styles.dayContainer}>
        {/* Day Header */}
        <TouchableOpacity
          style={styles.dayHeader}
          onPress={() => toggleDayExpanded(day)}
          activeOpacity={0.7}
        >
          <View style={styles.dayHeaderLeft}>
            <View style={[styles.dayIndicator, { backgroundColor: getDayColor(day) }]} />
            <Text style={styles.dayTitle}>{DAY_LABELS[day]}</Text>
            <View style={styles.dayStats}>
              <Text style={styles.dayStat}>
                {daySlots.filter(s => s.assignment?.type === SlotType.COURSE).length} courses
              </Text>
            </View>
          </View>
          
          <View style={styles.dayHeaderRight}>
            {isExpanded ? (
              <ChevronUp size={20} color={Colors.muted} />
            ) : (
              <ChevronDown size={20} color={Colors.muted} />
            )}
          </View>
        </TouchableOpacity>

        {/* Day Slots */}
        {isExpanded && (
          <Animated.View style={styles.daySlotsContainer}>
            {daySlots.map((slot, index) => (
              <View key={slot.id} style={styles.slotRow}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                  <Text style={styles.slotTime}>{formatTime(slot.startTime)}</Text>
                  <Text style={styles.slotDuration}>{formatTime(slot.endTime)}</Text>
                </View>

                {/* Timeline */}
                <View style={styles.timelineColumn}>
                  <View style={[
                    styles.timelineDot,
                    slot.isBreak && styles.timelineDotBreak,
                    slot.assignment?.type === SlotType.COURSE && styles.timelineDotCourse,
                  ]} />
                  {index < daySlots.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                {/* Slot Content */}
                <View style={[
                  styles.slotContent,
                  slot.isBreak && styles.slotContentBreak,
                ]}>
                  <View style={styles.slotHeader}>
                    {renderSlotIcon(slot)}
                    <Text style={styles.slotName}>{slot.name}</Text>
                  </View>
                  {renderSlotContent(slot)}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </View>
    );
  };

  const renderCompactDay = (day: Day) => {
    const daySlots = getDayTimetable(day);
    const courseSlots = daySlots.filter(s => s.assignment?.type === SlotType.COURSE);
    
    return (
      <TouchableOpacity
        key={day}
        style={styles.compactDayCard}
        onPress={() => setSelectedDay(selectedDay === day ? null : day)}
        activeOpacity={0.8}
      >
        <View style={styles.compactDayHeader}>
          <View style={styles.compactDayLeft}>
            <View style={[styles.compactDayIndicator, { backgroundColor: getDayColor(day) }]} />
            <Text style={styles.compactDayTitle}>{DAY_SHORT_LABELS[day]}</Text>
          </View>
          <Text style={styles.compactDayCount}>{courseSlots.length} courses</Text>
        </View>
        
        {selectedDay === day && (
          <View style={styles.compactSlots}>
            {courseSlots.slice(0, 3).map(slot => (
              <View key={slot.id} style={styles.compactSlot}>
                <View style={[styles.compactSlotIcon, { 
                  backgroundColor: slot.assignment?.course?.color || Colors.muted 
                }]} />
                <Text style={styles.compactSlotText} numberOfLines={1}>
                  {slot.assignment?.course?.name || 'Unknown'}
                </Text>
                <Text style={styles.compactSlotTime}>
                  {formatTime(slot.startTime)}
                </Text>
              </View>
            ))}
            {courseSlots.length > 3 && (
              <Text style={styles.moreText}>+{courseSlots.length - 3} more</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGridView = () => {
    return (
      <View style={styles.gridContainer}>
        {/* Header Row */}
        <View style={styles.gridHeader}>
          <View style={styles.gridTimeHeader} />
          {DAYS.map(day => (
            <View key={day} style={styles.gridDayHeader}>
              <Text style={styles.gridDayTitle}>{DAY_SHORT_LABELS[day]}</Text>
            </View>
          ))}
        </View>

        {/* Time Slots */}
        {slots.map((slot, slotIndex) => (
          <View key={slot.id} style={styles.gridRow}>
            {/* Time Column */}
            <View style={styles.gridTimeCell}>
              <Text style={styles.gridTimeText}>
                {formatTime(slot.startTime)}
              </Text>
              <Text style={styles.gridDurationText}>
                {formatTime(slot.endTime)}
              </Text>
            </View>

            {/* Day Columns */}
            {DAYS.map(day => {
              const dayTimetable = getDayTimetable(day);
              const slotData = dayTimetable[slotIndex];
              const isBreak = slotData?.isBreak;
              
              return (
                <View key={`${day}-${slot.id}`} style={styles.gridCell}>
                  {slotData?.assignment && (
                    <View style={[
                      styles.gridSlot,
                      isBreak && styles.gridSlotBreak,
                      slotData.assignment?.type === SlotType.COURSE && styles.gridSlotCourse,
                    ]}>
                      {isBreak ? (
                        <Text style={styles.gridBreakText}>{slot.name}</Text>
                      ) : slotData.assignment?.type === SlotType.COURSE ? (
                        <>
                          <View style={[
                            styles.gridCourseDot,
                            { backgroundColor: slotData.assignment.course?.color || Colors.primary }
                          ]} />
                          <Text style={styles.gridCourseText} numberOfLines={2}>
                            {slotData.assignment.course?.name || 'Course'}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.gridOtherText}>
                          {slotData.assignment.label || 'Other'}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const getDayColor = (day: Day): string => {
    const colors = [
      '#3B82F6', // Monday - Blue
      '#10B981', // Tuesday - Emerald
      '#8B5CF6', // Wednesday - Violet
      '#F59E0B', // Thursday - Amber
      '#EF4444', // Friday - Red
    ];
    return colors[DAYS.indexOf(day)] || Colors.primary;
  };

  const renderViewModeToggle = () => (
    <View style={styles.viewModeToggle}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'expanded' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('expanded')}
        activeOpacity={0.7}
      >
        <List size={18} color={viewMode === 'expanded' ? 'white' : Colors.muted} />
        <Text style={[
          styles.viewModeText,
          viewMode === 'expanded' && styles.viewModeTextActive,
        ]}>
          Expanded
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'compact' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('compact')}
        activeOpacity={0.7}
      >
        <Minimize2 size={18} color={viewMode === 'compact' ? 'white' : Colors.muted} />
        <Text style={[
          styles.viewModeText,
          viewMode === 'compact' && styles.viewModeTextActive,
        ]}>
          Compact
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('grid')}
        activeOpacity={0.7}
      >
        <Grid size={18} color={viewMode === 'grid' ? 'white' : Colors.muted} />
        <Text style={[
          styles.viewModeText,
          viewMode === 'grid' && styles.viewModeTextActive,
        ]}>
          Grid
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Calendar size={64} color={Colors.border} />
      <Text style={styles.emptyTitle}>No Timetable Setup</Text>
      <Text style={styles.emptyText}>
        Complete the setup wizard to view your timetable.
      </Text>
      <TouchableOpacity
        style={styles.setupButton}
        onPress={() => navigation.navigate('SetupWelcome')}
        activeOpacity={0.8}
      >
        <Text style={styles.setupButtonText}>Go to Setup</Text>
      </TouchableOpacity>
    </View>
  );

  if (!slots.length || !timetable.length) {
    return (
      <SafeAreaView style={styles.container}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Complete Timetable</Text>
            <Text style={styles.subtitle}>
              {slots.length} slots × {DAYS.length} days
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={Colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {renderViewModeToggle()}
          
          <TouchableOpacity
            style={styles.toggleAllButton}
            onPress={toggleAllDays}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleAllText}>
              {Object.values(expandedDays).every(v => v) ? 'Collapse All' : 'Expand All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Course</Text>
              </View>
              <View style={styles.legendItem}>
                <Coffee size={16} color="#6B7280" />
                <Text style={styles.legendText}>Short Break</Text>
              </View>
              <View style={styles.legendItem}>
                <Utensils size={16} color="#F59E0B" />
                <Text style={styles.legendText}>Lunch</Text>
              </View>
              <View style={styles.legendItem}>
                <Library size={16} color="#10B981" />
                <Text style={styles.legendText}>Library</Text>
              </View>
            </View>
          </View>

          {/* Timetable Content */}
          <View style={styles.timetableContent}>
            {viewMode === 'expanded' && DAYS.map(renderExpandedDay)}
            {viewMode === 'compact' && (
              <View style={styles.compactDaysContainer}>
                {DAYS.map(renderCompactDay)}
              </View>
            )}
            {viewMode === 'grid' && renderGridView()}
          </View>

          {/* Footer Stats */}
          <View style={styles.footerStats}>
            <View style={styles.statCard}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{slots.length} slots/day</Text>
                <Text style={styles.statLabel}>Daily schedule</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Calendar size={20} color={Colors.secondary} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {timetable.filter(t => t.slotAssignments.length > 0).length} days
                </Text>
                <Text style={styles.statLabel}>With assignments</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <BookOpen size={20} color={Colors.warning} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{courses.length} courses</Text>
                <Text style={styles.statLabel}>Total courses</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  setupButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  viewModeTextActive: {
    color: 'white',
  },
  toggleAllButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  legend: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
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
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
  timetableContent: {
    gap: 16,
  },
  dayContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.background,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  dayStats: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dayStat: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  dayHeaderRight: {
    padding: 8,
  },
  daySlotsContainer: {
    padding: 20,
  },
  slotRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeColumn: {
    width: 80,
    paddingRight: 12,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  slotDuration: {
    fontSize: 12,
    color: Colors.muted,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
    paddingTop: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  timelineDotBreak: {
    backgroundColor: '#6B7280',
  },
  timelineDotCourse: {
    backgroundColor: Colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
  },
  slotContent: {
    flex: 1,
    paddingLeft: 12,
  },
  slotContentBreak: {
    opacity: 0.8,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  courseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  slotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  breakContent: {
    opacity: 0.8,
  },
  breakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  breakSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  courseContent: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  courseFaculty: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 2,
  },
  courseCode: {
    fontSize: 12,
    color: Colors.muted,
    fontFamily: 'monospace',
  },
  nonCourseContent: {
    flex: 1,
  },
  nonCourseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  nonCourseSubtitle: {
    fontSize: 14,
    color: Colors.muted,
  },
  emptyContent: {
    flex: 1,
  },
  compactDaysContainer: {
    gap: 12,
  },
  compactDayCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  compactDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactDayIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  compactDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  compactDayCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.muted,
  },
  compactSlots: {
    gap: 8,
  },
  compactSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  compactSlotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactSlotText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  compactSlotTime: {
    fontSize: 12,
    color: Colors.muted,
  },
  moreText: {
    fontSize: 12,
    color: Colors.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  gridContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gridTimeHeader: {
    width: 80,
    padding: 12,
  },
  gridDayHeader: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  gridDayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gridTimeCell: {
    width: 80,
    padding: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  gridTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  gridDurationText: {
    fontSize: 11,
    color: Colors.muted,
  },
  gridCell: {
    flex: 1,
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  gridSlot: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridSlotBreak: {
    backgroundColor: '#F9FAFB',
  },
  gridSlotCourse: {
    backgroundColor: '#EFF6FF',
  },
  gridBreakText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  gridCourseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  gridCourseText: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  gridOtherText: {
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
  },
  footerStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
});