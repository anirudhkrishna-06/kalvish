import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimePicker from '@/components/ui/TimePicker';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  AlertCircle,
  Coffee,
  Utensils,
  BookOpen
} from 'lucide-react-native';
import { SlotType } from '@/types/Slot';
import { generateId } from '@/utils/helpers';
import { timeToMinutes, isValidTimeFormat, isValidTimeRange } from '@/utils/timeHelpers';
import { SLOT_TYPE_CONFIG, BREAK_TYPES } from '@/constants/SlotTypes';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SlotsSetup'>;


type SlotFormData = {
  id: string;
  index: number;
  name: string;
  type: SlotType;
  startTime: string;
  endTime: string;
};

const DEFAULT_SLOTS: SlotFormData[] = [
  // Period 1
  { id: '', index: 1, name: 'Period 1', type: SlotType.COURSE, startTime: '09:00', endTime: '09:50' },
  // Period 2
  { id: '', index: 2, name: 'Period 2', type: SlotType.COURSE, startTime: '09:50', endTime: '10:40' },
  // Short Break 1
  { id: '', index: 3, name: 'Short Break', type: SlotType.SHORT_BREAK, startTime: '10:40', endTime: '10:55' },
  // Period 3
  { id: '', index: 4, name: 'Period 3', type: SlotType.COURSE, startTime: '10:55', endTime: '11:45' },
  // Period 4
  { id: '', index: 5, name: 'Period 4', type: SlotType.COURSE, startTime: '11:45', endTime: '12:35' },
  // Period 5
  { id: '', index: 6, name: 'Period 5', type: SlotType.COURSE, startTime: '12:35', endTime: '13:25' },
  // Lunch Break
  { id: '', index: 7, name: 'Lunch Break', type: SlotType.LUNCH_BREAK, startTime: '13:25', endTime: '14:15' },
  // Period 6
  { id: '', index: 8, name: 'Period 6', type: SlotType.COURSE, startTime: '14:15', endTime: '15:05' },
  // Period 7
  { id: '', index: 9, name: 'Period 7', type: SlotType.COURSE, startTime: '15:05', endTime: '15:55' },
  // Short Break 2
  { id: '', index: 10, name: 'Short Break', type: SlotType.SHORT_BREAK, startTime: '15:55', endTime: '16:10' },
  // Period 8
  { id: '', index: 11, name: 'Period 8', type: SlotType.COURSE, startTime: '16:10', endTime: '17:00' },
];

const BREAK_POSITIONS = [3, 7, 10]; // Indices of breaks (1-based)

export default function SlotsSetupScreen() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const { slots: existingSlots, saveSlots, courses } = useApp();
  
  const [slots, setSlots] = useState<SlotFormData[]>(() =>
    DEFAULT_SLOTS.map(slot => ({ ...slot, id: slot.id || generateId() }))
    );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing slots if they exist
  useEffect(() => {
    if (existingSlots.length > 0) {
      setSlots(existingSlots.map(slot => ({
        id: slot.id,
        index: slot.index,
        name: slot.name,
        type: slot.type,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })));
    } else {
      // Initialize with IDs
      setSlots(prev => prev.map(slot => ({
        ...slot,
        id: slot.id || generateId(),
      })));
    }
  }, [existingSlots]);

  const validateSlots = (): boolean => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    // Validate each slot
    slots.forEach((slot, index) => {
      const slotNumber = index + 1;

      // Check time format
      if (!isValidTimeFormat(slot.startTime)) {
        newErrors[slotNumber] = 'Invalid start time format';
        isValid = false;
        return;
      }

      if (!isValidTimeFormat(slot.endTime)) {
        newErrors[slotNumber] = 'Invalid end time format';
        isValid = false;
        return;
      }

      // Check time range
      if (!isValidTimeRange(slot.startTime, slot.endTime)) {
        newErrors[slotNumber] = 'End time must be after start time';
        isValid = false;
        return;
      }

      // Check for overlaps with next slot (except last one)
      if (index < slots.length - 1) {
        const nextSlot = slots[index + 1];
        if (timeToMinutes(slot.endTime) > timeToMinutes(nextSlot.startTime)) {
          newErrors[slotNumber] = `Overlaps with ${nextSlot.name}`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const updateSlot = (index: number, updates: Partial<SlotFormData>) => {
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = { ...newSlots[index], ...updates };
      return newSlots;
    });

    // Clear error for this slot when updating
    if (errors[index + 1]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index + 1];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateSlots()) {
      Alert.alert('Validation Error', 'Please fix all errors before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const slotsToSave = slots.map(slot => ({
        id: slot.id,
        index: slot.index,
        name: slot.name,
        type: slot.type,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: BREAK_TYPES.includes(slot.type),
      }));

      await saveSlots(slotsToSave);
      
      Alert.alert(
        'Success',
        'Time slots saved successfully!',
        [{ text: 'Continue', onPress: () => navigation.navigate("TimetableSetup") }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save time slots. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotIcon = (type: SlotType) => {
    switch (type) {
      case SlotType.SHORT_BREAK:
        return <Coffee size={20} color={SLOT_TYPE_CONFIG[type].color} />;
      case SlotType.LUNCH_BREAK:
        return <Utensils size={20} color={SLOT_TYPE_CONFIG[type].color} />;
      default:
        return <BookOpen size={20} color={SLOT_TYPE_CONFIG[type].color} />;
    }
  };

  const getSlotColor = (type: SlotType) => {
    return SLOT_TYPE_CONFIG[type].color;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateDuration = (start: string, end: string): string => {
    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);
    const duration = endMins - startMins;
    return `${duration} min`;
  };

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
            <Text style={styles.title}>Define Time Slots</Text>
            <Text style={styles.subtitle}>
              Set your daily schedule with 8 periods and 3 breaks
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.infoBox}>
          <AlertCircle size={20} color={Colors.warning} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Important</Text>
            <Text style={styles.infoText}>
              • You have exactly <Text style={styles.highlight}>8 periods</Text> and <Text style={styles.highlight}>3 breaks</Text>
              {"\n"}• Breaks are fixed (2 short + 1 lunch)
              {"\n"}• Ensure times don't overlap
            </Text>
          </View>
        </View>

        {/* Slots List */}
        <View style={styles.slotsContainer}>
          {slots.map((slot, index) => {
            const slotNumber = index + 1;
            const isBreak = BREAK_TYPES.includes(slot.type);
            const isEditable = !isBreak;
            const config = SLOT_TYPE_CONFIG[slot.type];
            
            return (
              <View key={slot.id} style={styles.slotCard}>
                {/* Slot Header */}
                <View style={[
                  styles.slotHeader,
                  { backgroundColor: getSlotColor(slot.type) + '20' }
                ]}>
                  <View style={styles.slotInfo}>
                    <View style={styles.slotIcon}>
                      {getSlotIcon(slot.type)}
                    </View>
                    <View>
                      <Text style={styles.slotName}>
                        {slot.name} {!isBreak && `(${slotNumber})`}
                      </Text>
                      <Text style={styles.slotType}>
                        {config.label}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.slotDuration}>
                    <Text style={styles.durationText}>
                      {calculateDuration(slot.startTime, slot.endTime)}
                    </Text>
                  </View>
                </View>

                {/* Time Inputs */}
                <View style={styles.timeInputs}>
                  <View style={styles.timeInputGroup}>
                    <TimePicker
                      label="Start Time"
                      value={slot.startTime}
                      onChange={(time) => updateSlot(index, { startTime: time })}
                      error={errors[slotNumber]}
                    />
                    
                    <View style={styles.timeDisplay}>
                      <Text style={styles.timeDisplayText}>
                        {formatTimeDisplay(slot.startTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timeArrow}>
                    <ChevronRight size={24} color={Colors.muted} />
                  </View>

                  <View style={styles.timeInputGroup}>
                    <TimePicker
                      label="End Time"
                      value={slot.endTime}
                      onChange={(time) => updateSlot(index, { endTime: time })}
                      error={errors[slotNumber]}
                    />
                    
                    <View style={styles.timeDisplay}>
                      <Text style={styles.timeDisplayText}>
                        {formatTimeDisplay(slot.endTime)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Error Message */}
                {errors[slotNumber] && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color={Colors.error} />
                    <Text style={styles.errorMessage}>{errors[slotNumber]}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Schedule Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Periods</Text>
              <Text style={styles.summaryValue}>8</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Short Breaks</Text>
              <Text style={styles.summaryValue}>2</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Lunch Break</Text>
              <Text style={styles.summaryValue}>1</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Slots</Text>
              <Text style={styles.summaryValue}>11</Text>
            </View>
          </View>
          
          <View style={styles.dayRange}>
            <Text style={styles.dayRangeLabel}>Daily Schedule:</Text>
            <Text style={styles.dayRangeValue}>
              {formatTimeDisplay(slots[0]?.startTime || '09:00')} - {formatTimeDisplay(slots[slots.length - 1]?.endTime || '17:00')}
            </Text>
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
            <Text style={styles.backButtonText}>Back to Courses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </Text>
            <ChevronRight size={20} color="white" />
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
  },
  slotsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  slotCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  slotType: {
    fontSize: 14,
    color: Colors.muted,
  },
  slotDuration: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeDisplayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
  },
  timeArrow: {
    paddingTop: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  dayRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
  },
  dayRangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dayRangeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
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