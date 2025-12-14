import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useTimetable } from '@/hooks/useTimetable';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  LucideIcon
} from 'lucide-react-native';
import { formatDate, formatTime, isCurrentTimeInSlot, getNextSlot } from '@/lib/dateUtils';
import { SlotType } from '@/types/Slot';
import { DAY_LABELS } from '@/constants/Days';
import { SLOT_TYPE_CONFIG } from '@/constants/SlotTypes';
import { Slot } from '@/types/Slot';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';



const { width } = Dimensions.get('window');

const SLOT_TYPE_ICONS: Record<SlotType, LucideIcon> = {
  [SlotType.COURSE]: BookOpen,
  [SlotType.SHORT_BREAK]: Coffee,
  [SlotType.LUNCH_BREAK]: Utensils,
  [SlotType.LIBRARY]: Library,
  [SlotType.MENTOR]: User,
  [SlotType.FREE]: Smile,
};

export default function TodayTimetableScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { courses } = useApp();
  const {
    getTodaysTimetable,
    getCurrentSlotIndex,
    getNextUpcomingSlot,
    isWeekend,
  } = useTimetable();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlotIndex, setCurrentSlotIndex] = useState(-1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const todaySlots = getTodaysTimetable();
  const nextUpcoming = getNextUpcomingSlot();
  const isTodayWeekend = isWeekend();

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCurrentSlotIndex(getCurrentSlotIndex());
    }, 60000);

    // Initial animation
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

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleSlotPress = (slot: Slot & { assignment?: any }) => {


    if (slot.isBreak) return;
    
    if (slot.assignment?.type === SlotType.COURSE && slot.assignment.course) {
      navigation.navigate('CourseDetail', { courseId: slot.assignment.course.id });
    }
  };

  const handleViewCourses = () => {
    navigation.navigate("CourseList");
  };

  const handleEditTimetable = () => {
    navigation.navigate("TodayTimetable");
  };

  const renderSlotIcon = (slot: Slot & { assignment?: any }) => {

    const slotType = slot.type as SlotType;
    const Icon = SLOT_TYPE_ICONS[slotType] || BookOpen;
    const config = SLOT_TYPE_CONFIG[slotType];
    
    if (slot.assignment?.type === SlotType.COURSE && slot.assignment.course) {
      return (
        <View style={[styles.courseIcon, { backgroundColor: slot.assignment.course.color }]}>
          <Text style={styles.courseIconText}>
            {slot.assignment.course.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
    
    return <Icon size={24} color={config.color} />;
  };

  const renderSlotContent = (slot: Slot & { assignment?: any }) => {
    if (slot.isBreak) {
      return (
        <View style={styles.breakContent}>
          <Text style={styles.breakTitle}>{slot.name}</Text>
          <Text style={styles.breakSubtitle}>Time to refresh ☕</Text>
        </View>
      );
    }

    if (slot.assignment?.type === SlotType.COURSE && slot.assignment.course) {
      const course = slot.assignment.course;
      return (
        <View style={styles.courseContent}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseFaculty}>{course.facultyName}</Text>
          {course.courseCode && (
            <Text style={styles.courseCode}>{course.courseCode}</Text>
          )}
        </View>
      );
    }

    if (slot.assignment?.type && [SlotType.LIBRARY, SlotType.MENTOR, SlotType.FREE].includes(slot.assignment.type)) {
      const nonCourseType = slot.assignment.type as SlotType;
        const config = SLOT_TYPE_CONFIG[nonCourseType];
      return (
        <View style={styles.nonCourseContent}>
          <Text style={styles.nonCourseTitle}>{slot.assignment.label || config.label}</Text>
          <Text style={styles.nonCourseSubtitle}>
            {slot.assignment.type === SlotType.LIBRARY && 'Study time 📚'}
            {slot.assignment.type === SlotType.MENTOR && 'Meeting time 👨‍🏫'}
            {slot.assignment.type === SlotType.FREE && 'Free time 😌'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContent}>
        <Text style={styles.emptyText}>No assignment</Text>
      </View>
    );
  };

  const renderCurrentSlotIndicator = () => {
    if (currentSlotIndex >= 0 && currentSlotIndex < todaySlots.length) {
      const currentSlot = todaySlots[currentSlotIndex];
      return (
        <View style={styles.currentSlotIndicator}>
          <View style={styles.indicatorPulse} />
          <Text style={styles.indicatorText}>
            Currently: {currentSlot.name} • {formatTime(currentSlot.startTime)} - {formatTime(currentSlot.endTime)}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderNextUpcoming = () => {
    if (!nextUpcoming || isTodayWeekend) return null;
    
    const { slot, minutesUntil } = nextUpcoming;
    return (
      <TouchableOpacity
        style={styles.nextUpcomingCard}
        onPress={() => handleSlotPress(slot)}
        activeOpacity={0.8}
      >
        <View style={styles.nextUpcomingHeader}>
          <Bell size={20} color={Colors.primary} />
          <Text style={styles.nextUpcomingTitle}>Next Up</Text>
          <Text style={styles.nextUpcomingTime}>
            In {minutesUntil} {minutesUntil === 1 ? 'min' : 'mins'}
          </Text>
        </View>
        
        <View style={styles.nextUpcomingContent}>
          {renderSlotIcon(slot)}
          <View style={styles.nextUpcomingInfo}>
            <Text style={styles.nextUpcomingSlotName}>{slot.name}</Text>
            <Text style={styles.nextUpcomingTimeRange}>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderWeekendMessage = () => {
    if (!isTodayWeekend) return null;
    
    return (
      <View style={styles.weekendCard}>
        <Calendar size={24} color={Colors.primary} />
        <View style={styles.weekendContent}>
          <Text style={styles.weekendTitle}>It's the weekend! 🎉</Text>
          <Text style={styles.weekendText}>
            No classes scheduled for today. Enjoy your break!
          </Text>
        </View>
      </View>
    );
  };

  if (todaySlots.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color={Colors.muted} />
          <Text style={styles.emptyTitle}>No Timetable Setup</Text>
          <Text style={styles.emptyText}>
            Your timetable hasn't been set up yet. Complete the setup wizard to get started.
          </Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => navigation.navigate("SetupWelcome")}
            activeOpacity={0.8}
          >
            <Text style={styles.setupButtonText}>Go to Setup</Text>
          </TouchableOpacity>
        </View>
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
          <View>
            <Text style={styles.date}>{formatDate(currentTime)}</Text>
            <Text style={styles.title}>Today's Timetable</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEditTimetable}
            activeOpacity={0.7}
          >
            <MoreVertical size={24} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Current Time & Next Up */}
        <View style={styles.infoCards}>
          <View style={styles.timeCard}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.timeText}>
              {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
          
          {isTodayWeekend && (
            <TouchableOpacity
              style={styles.coursesCard}
              onPress={handleViewCourses}
              activeOpacity={0.8}
            >
              <BookOpen size={20} color={Colors.secondary} />
              <Text style={styles.coursesText}>
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Weekend Message or Current Slot */}
        {isTodayWeekend ? (
          renderWeekendMessage()
        ) : (
          <>
            {renderCurrentSlotIndicator()}
            {renderNextUpcoming()}
          </>
        )}

        {/* Timetable Slots */}
        <ScrollView
          style={styles.timetableScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.slotsContainer}>
            {todaySlots.map((slot, index) => {
              const isCurrent = index === currentSlotIndex;
              const isPast = index < currentSlotIndex;
              const isBreak = slot.isBreak;
              
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    isCurrent && styles.slotCardCurrent,
                    isPast && styles.slotCardPast,
                    isBreak && styles.slotCardBreak,
                  ]}
                  onPress={() => handleSlotPress(slot)}
                  disabled={isBreak}
                  activeOpacity={isBreak ? 1 : 0.7}
                >
                  {/* Time Column */}
                  <View style={styles.timeColumn}>
                    <Text style={[
                      styles.slotTime,
                      isCurrent && styles.slotTimeCurrent,
                      isPast && styles.slotTimePast,
                    ]}>
                      {formatTime(slot.startTime)}
                    </Text>
                    <Text style={[
                      styles.slotDuration,
                      isPast && styles.slotDurationPast,
                    ]}>
                      {formatTime(slot.endTime)}
                    </Text>
                  </View>

                  {/* Timeline */}
                  <View style={styles.timelineColumn}>
                    <View style={[
                      styles.timelineCircle,
                      isCurrent && styles.timelineCircleCurrent,
                      isPast && styles.timelineCirclePast,
                      isBreak && styles.timelineCircleBreak,
                    ]} />
                    {index < todaySlots.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        isPast && styles.timelineLinePast,
                      ]} />
                    )}
                  </View>

                  {/* Content Column */}
                  <View style={[
                    styles.contentColumn,
                    isBreak && styles.contentColumnBreak,
                  ]}>
                    <View style={styles.slotHeader}>
                      <View style={styles.slotTitleRow}>
                        {renderSlotIcon(slot)}
                        <Text style={[
                          styles.slotName,
                          isCurrent && styles.slotNameCurrent,
                          isPast && styles.slotNamePast,
                        ]}>
                          {slot.name}
                        </Text>
                      </View>
                      
                      {isCurrent && (
                        <View style={styles.liveBadge}>
                          <View style={styles.livePulse} />
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    
                    {renderSlotContent(slot)}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* End of Day */}
          <View style={styles.endOfDay}>
            <Text style={styles.endOfDayText}>🎉 End of academic day</Text>
            <Text style={styles.endOfDaySubtext}>
              All slots completed for today
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  date: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  headerButton: {
    padding: 8,
  },
  infoCards: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  timeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
  },
  coursesCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  coursesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  currentSlotIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  indicatorPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  indicatorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  nextUpcomingCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nextUpcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nextUpcomingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  nextUpcomingTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  nextUpcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  nextUpcomingInfo: {
    flex: 1,
  },
  nextUpcomingSlotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  nextUpcomingTimeRange: {
    fontSize: 14,
    color: Colors.muted,
  },
  weekendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
  },
  weekendContent: {
    flex: 1,
  },
  weekendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  weekendText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  timetableScroll: {
    flex: 1,
  },
  slotsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  slotCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  slotCardCurrent: {
    backgroundColor: '#3B82F610',
    borderColor: Colors.primary,
  },
  slotCardPast: {
    opacity: 0.6,
  },
  slotCardBreak: {
    backgroundColor: '#F9FAFB',
  },
  timeColumn: {
    width: 80,
    justifyContent: 'center',
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  slotTimeCurrent: {
    color: Colors.primary,
    fontWeight: '700',
  },
  slotTimePast: {
    color: Colors.muted,
  },
  slotDuration: {
    fontSize: 13,
    color: Colors.muted,
  },
  slotDurationPast: {
    color: '#9CA3AF',
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
    paddingTop: 8,
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  timelineCircleCurrent: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  timelineCirclePast: {
    backgroundColor: Colors.muted,
  },
  timelineCircleBreak: {
    backgroundColor: '#9CA3AF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
  },
  timelineLinePast: {
    backgroundColor: Colors.muted,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  contentColumnBreak: {
    opacity: 0.8,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  slotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  slotNameCurrent: {
    color: Colors.primary,
  },
  slotNamePast: {
    color: Colors.muted,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.error,
    textTransform: 'uppercase',
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
    fontSize: 18,
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
    fontSize: 18,
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
  endOfDay: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  endOfDayText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  endOfDaySubtext: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
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
});