import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Clock, ChevronDown } from 'lucide-react-native';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  error?: string;
}

export default function TimePicker({ label, value, onChange, error }: TimePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempHours, setTempHours] = useState('09');
  const [tempMinutes, setTempMinutes] = useState('00');

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      setTempHours(hours);
      setTempMinutes(minutes);
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour.toString().padStart(2, '0');
  });

  const minutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  const handleConfirm = () => {
    const newTime = `${tempHours.padStart(2, '0')}:${tempMinutes.padStart(2, '0')}`;
    onChange(newTime);
    setModalVisible(false);
  };

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Clock size={20} color={Colors.muted} />
        <Text style={styles.pickerText}>
          {value ? formatDisplayTime(value) : 'Select time'}
        </Text>
        <ChevronDown size={20} color={Colors.muted} />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
            </View>

            <View style={styles.timeSelection}>
              {/* Hours */}
              <View style={styles.columnContainer}>
                <Text style={styles.columnLabel}>Hour</Text>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.columnItem,
                        tempHours === hour && styles.columnItemSelected,
                      ]}
                      onPress={() => setTempHours(hour)}
                    >
                      <Text style={[
                        styles.columnItemText,
                        tempHours === hour && styles.columnItemTextSelected,
                      ]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Separator */}
              <Text style={styles.timeSeparator}>:</Text>

              {/* Minutes */}
              <View style={styles.columnContainer}>
                <Text style={styles.columnLabel}>Minute</Text>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.columnItem,
                        tempMinutes === minute && styles.columnItemSelected,
                      ]}
                      onPress={() => setTempMinutes(minute)}
                    >
                      <Text style={[
                        styles.columnItemText,
                        tempMinutes === minute && styles.columnItemTextSelected,
                      ]}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View style={styles.columnContainer}>
                <Text style={styles.columnLabel}>Period</Text>
                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {['AM', 'PM'].map((period) => {
                    const currentHour = parseInt(tempHours);
                    const isSelected = 
                      (period === 'AM' && currentHour < 12) ||
                      (period === 'PM' && currentHour >= 12);
                    
                    return (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.columnItem,
                          isSelected && styles.columnItemSelected,
                        ]}
                        onPress={() => {
                          const hour = parseInt(tempHours);
                          let newHour = hour;
                          
                          if (period === 'AM' && hour >= 12) {
                            newHour = hour - 12;
                          } else if (period === 'PM' && hour < 12) {
                            newHour = hour + 12;
                          }
                          
                          setTempHours(newHour.toString().padStart(2, '0'));
                        }}
                      >
                        <Text style={[
                          styles.columnItemText,
                          isSelected && styles.columnItemTextSelected,
                        ]}>
                          {period}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  pickerButtonError: {
    borderColor: Colors.error,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
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
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  timeSelection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  columnContainer: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  columnScroll: {
    width: '100%',
    maxHeight: 200,
  },
  columnItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  columnItemSelected: {
    backgroundColor: Colors.primary,
  },
  columnItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  columnItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 40,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});