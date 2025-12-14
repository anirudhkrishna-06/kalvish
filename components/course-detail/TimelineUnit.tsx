import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react-native';

interface TimelineUnitProps {
  unitNumber: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  onPress?: () => void;
}

export const TimelineUnit: React.FC<TimelineUnitProps> = ({
  unitNumber,
  title,
  status,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'current':
        return Colors.primary;
      case 'upcoming':
        return Colors.muted;
      case 'locked':
        return Colors.border;
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'current':
        return <PlayCircle size={20} color={Colors.primary} />;
      case 'locked':
        return <Lock size={20} color={Colors.border} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          opacity: status === 'locked' ? 0.6 : 1,
          borderColor: getStatusColor(),
          backgroundColor: status === 'current' ? `${getStatusColor()}15` : Colors.card,
        },
      ]}
      onPress={onPress}
      disabled={status === 'locked'}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.unitNumber, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.unitNumberText}>{unitNumber}</Text>
        </View>
        {getIcon()}
      </View>
      <Text
        style={[
          styles.title,
          {
            color: status === 'locked' ? Colors.muted : Colors.text,
            fontWeight: status === 'current' ? '700' : '600',
          },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
      {status === 'current' && (
        <View style={styles.currentIndicator}>
          <View style={[styles.pulseDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.currentText}>Studying Now</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitNumberText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  currentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  currentText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
});