import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Slot, SlotType } from '@/types/Slot';
import { Course } from '@/types/Course';
import { Day } from '@/types/Timetable';
import { SLOT_TYPE_CONFIG, NON_COURSE_TYPES } from '@/constants/SlotTypes';
import { DAY_LABELS } from '@/constants/Days';
import { 
  BookOpen, 
  Book, 
  User, 
  Coffee, 
  Utensils, 
  Smile,
  ChevronDown,
  X
} from 'lucide-react-native';

interface SlotAssignment {
  slotId: string;
  type: SlotType;
  courseId?: string;
  label?: string;
}

interface DayTimetableFormProps {
  day: Day;
  slots: Slot[];
  courses: Course[];
  assignments: SlotAssignment[];
  onChange: (assignments: SlotAssignment[]) => void;
}

type NonCourseSlotType =
  | SlotType.LIBRARY
  | SlotType.MENTOR
  | SlotType.FREE;



const NON_COURSE_CONFIG: Record<NonCourseSlotType, {
  label: string;
  icon: any;
  color: string;
}> = {
  [SlotType.LIBRARY]: {
    label: 'Library',
    icon: Book,
    color: '#10B981',
  },
  [SlotType.MENTOR]: {
    label: 'Mentor',
    icon: User,
    color: '#8B5CF6',
  },
  [SlotType.FREE]: {
    label: 'Free',
    icon: Smile,
    color: '#9CA3AF',
  },
} as const;

export default function DayTimetableForm({
  day,
  slots,
  courses,
  assignments,
  onChange,
}: DayTimetableFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const getAssignment = (slotId: string): SlotAssignment | undefined => {
    return assignments.find(a => a.slotId === slotId);
  };

  const updateAssignment = (slotId: string, updates: Partial<SlotAssignment>) => {
    const existing = assignments.find(a => a.slotId === slotId);
    const slot = slots.find(s => s.id === slotId);
    
    if (!slot) return;

    let newAssignment: SlotAssignment;
    
    if (existing) {
      newAssignment = { ...existing, ...updates };
    } else {
      newAssignment = {
        slotId,
        type: slot.type,
        ...updates,
      };
    }

    const otherAssignments = assignments.filter(a => a.slotId !== slotId);
    onChange([...otherAssignments, newAssignment]);
  };

  const handleSlotPress = (slot: Slot) => {
    if (slot.isBreak) return; // Breaks are not editable
    
    const assignment = getAssignment(slot.id);
    setSelectedSlot(slot.id);
    
    if (assignment?.type === SlotType.COURSE) {
      setShowCourseModal(true);
    } else if (NON_COURSE_TYPES.includes(assignment?.type || SlotType.COURSE)) {
      setShowTypeModal(true);
    } else {
      // New slot - show type selector first
      setShowTypeModal(true);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    if (!selectedSlot) return;
    
    updateAssignment(selectedSlot, {
      type: SlotType.COURSE,
      courseId,
      label: undefined,
    });
    
    setShowCourseModal(false);
    setSelectedSlot(null);
  };
  const handleSelectType = (type: SlotType) => {
    if (!selectedSlot) return;
    
    if (type === SlotType.COURSE) {
      setShowTypeModal(false);
      setShowCourseModal(true);
    } else {
        const nonCourseType = type as NonCourseSlotType;
      updateAssignment(selectedSlot, {
        type,
        courseId: undefined,
        label: NON_COURSE_CONFIG[nonCourseType].label,

      });
      
      setShowTypeModal(false);
      setSelectedSlot(null);
    }
  };

  const renderSlotIcon = (slot: Slot, assignment?: SlotAssignment) => {
    if (slot.isBreak) {
      if (slot.type === SlotType.SHORT_BREAK) {
        return <Coffee size={20} color="#6B7280" />;
      }
      return <Utensils size={20} color="#F59E0B" />;
    }

    if (assignment?.type === SlotType.COURSE && assignment.courseId) {
      const course = courses.find(c => c.id === assignment.courseId);
      if (course) {
        return (
          <View style={[styles.courseIcon, { backgroundColor: course.color }]}>
            <Text style={styles.courseIconText}>
              {course.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        );
      }
    }

    if (assignment?.type && NON_COURSE_TYPES.includes(assignment.type)) {
      const nonCourseType = assignment.type as NonCourseSlotType;
        const Icon = NON_COURSE_CONFIG[nonCourseType].icon;
        const color = NON_COURSE_CONFIG[nonCourseType].color;
      return <Icon size={20} color={color} />;
    }

    return <BookOpen size={20} color="#D1D5DB" />;
  };

  const renderSlotLabel = (slot: Slot, assignment?: SlotAssignment) => {
    if (slot.isBreak) {
      return slot.name;
    }

    if (assignment?.type === SlotType.COURSE && assignment.courseId) {
      const course = courses.find(c => c.id === assignment.courseId);
      return course?.name || 'Select Course';
    }

    if (assignment?.type && NON_COURSE_TYPES.includes(assignment.type)) {
      const nonCourseType = assignment.type as NonCourseSlotType;
        return assignment.label || NON_COURSE_CONFIG[nonCourseType].label;

    }

    return 'Select...';
  };

  const getSlotColor = (slot: Slot, assignment?: SlotAssignment) => {
    if (slot.isBreak) {
      return SLOT_TYPE_CONFIG[slot.type].color;
    }

    if (assignment?.type === SlotType.COURSE && assignment.courseId) {
      const course = courses.find(c => c.id === assignment.courseId);
      return course?.color || Colors.primary;
    }

    if (assignment?.type && NON_COURSE_TYPES.includes(assignment.type)) {
      const nonCourseType = assignment.type as NonCourseSlotType;
        return NON_COURSE_CONFIG[nonCourseType].color;
    }

    return Colors.border;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{DAY_LABELS[day]}</Text>
        <View style={styles.dayIndicator}>
          <Text style={styles.dayIndicatorText}>
            {assignments.filter(a => a.type === SlotType.COURSE).length} courses
          </Text>
        </View>
      </View>

      <ScrollView style={styles.slotsList} showsVerticalScrollIndicator={false}>
        {slots.map((slot) => {
          const assignment = getAssignment(slot.id);
          const isBreak = slot.isBreak;
          const isAssigned = assignment && (assignment.courseId || assignment.label);
          
          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotItem,
                { borderColor: getSlotColor(slot, assignment) },
                isAssigned && styles.slotItemAssigned,
              ]}
              onPress={() => handleSlotPress(slot)}
              disabled={isBreak}
              activeOpacity={isBreak ? 1 : 0.7}
            >
              {/* Time Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.slotTime}>
                  {slot.startTime} - {slot.endTime}
                </Text>
                <Text style={styles.slotNumber}>Slot {slot.index}</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Content Column */}
              <View style={styles.contentColumn}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotName}>{slot.name}</Text>
                  {!isBreak && <ChevronDown size={16} color={Colors.muted} />}
                </View>
                
                <View style={styles.slotContent}>
                  {renderSlotIcon(slot, assignment)}
                  <Text style={[
                    styles.slotLabel,
                    isAssigned && styles.slotLabelAssigned,
                  ]}>
                    {renderSlotLabel(slot, assignment)}
                  </Text>
                </View>
              </View>

              {/* Break Indicator */}
              {isBreak && (
                <View style={[styles.breakBadge, { 
                  backgroundColor: getSlotColor(slot, assignment) + '20' 
                }]}>
                  <Text style={[styles.breakText, { 
                    color: getSlotColor(slot, assignment) 
                  }]}>
                    Fixed
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Course Selection Modal */}
      <Modal
        visible={showCourseModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCourseModal(false);
          setSelectedSlot(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Course</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCourseModal(false);
                  setSelectedSlot(null);
                }}
              >
                <X size={24} color={Colors.muted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseOption}
                  onPress={() => handleSelectCourse(course.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.courseColor, { backgroundColor: course.color }]} />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseFaculty}>{course.facultyName}</Text>
                    {course.courseCode && (
                      <Text style={styles.courseCode}>{course.courseCode}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowTypeModal(false);
          setSelectedSlot(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Slot Type</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowTypeModal(false);
                  setSelectedSlot(null);
                }}
              >
                <X size={24} color={Colors.muted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.typeOptions}>
              {/* Course Option */}
              <TouchableOpacity
                style={styles.typeOption}
                onPress={() => handleSelectType(SlotType.COURSE)}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIcon, { backgroundColor: '#3B82F620' }]}>
                  <BookOpen size={24} color="#3B82F6" />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Course</Text>
                  <Text style={styles.typeDescription}>
                    Assign an academic course
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Non-Course Options */}
              {Object.entries(NON_COURSE_CONFIG).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.typeOption}
                    onPress={() => handleSelectType(type as SlotType)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.typeIcon,
                      { backgroundColor: config.color + '20' }
                    ]}>
                      <Icon size={24} color={config.color} />
                    </View>
                    <View style={styles.typeInfo}>
                      <Text style={styles.typeName}>{config.label}</Text>
                      <Text style={styles.typeDescription}>
                        {type === SlotType.LIBRARY && 'Library study period'}
                        {type === SlotType.MENTOR && 'Mentor meeting period'}
                        {type === SlotType.FREE && 'Free time / Break'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  dayIndicator: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dayIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  slotsList: {
    flex: 1,
  },
  slotItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  slotItemAssigned: {
    backgroundColor: Colors.background,
  },
  timeColumn: {
    width: 100,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  slotNumber: {
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  contentColumn: {
    flex: 1,
    padding: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  slotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotLabel: {
    fontSize: 16,
    color: Colors.muted,
    flex: 1,
  },
  slotLabelAssigned: {
    color: Colors.text,
    fontWeight: '500',
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
  breakBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  breakText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalList: {
    padding: 24,
  },
  courseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
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
  typeOptions: {
    padding: 24,
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: Colors.muted,
  },
});