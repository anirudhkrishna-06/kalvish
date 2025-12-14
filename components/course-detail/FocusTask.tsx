import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Clock, Flag, CheckCircle } from 'lucide-react-native';

interface FocusTaskProps {
  id: string;
  title: string;
  deadline?: Date;
  priority?: 'low' | 'medium' | 'high';
  onComplete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const FocusTask: React.FC<FocusTaskProps> = ({
  id,
  title,
  deadline,
  priority = 'medium',
  onComplete,
  onEdit,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
    }
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
      
      // Scale effect when swiping
      const scaleValue = 1 - Math.abs(gestureState.dx) / 300;
      scale.setValue(Math.max(scaleValue, 0.9));
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 100) {
        // Swipe right - complete
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete(id);
        });
      } else if (gestureState.dx < -100) {
        // Swipe left - edit
        if (onEdit) {
          Animated.sequence([
            Animated.spring(translateX, {
              toValue: -50,
              useNativeDriver: true,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onEdit(id);
          });
        }
      } else {
        // Return to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }, { scale }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.footer}>
          {deadline && (
            <View style={styles.deadline}>
              <Clock size={12} color={Colors.muted} />
              <Text style={styles.deadlineText}>{formatDeadline(deadline)}</Text>
            </View>
          )}
          
          <View style={styles.priority}>
            <Flag size={12} color={getPriorityColor()} />
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => onComplete(id)}
        activeOpacity={0.7}
      >
        <CheckCircle size={24} color={Colors.success} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priorityIndicator: {
    width: 4,
    height: '80%',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: Colors.muted,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completeButton: {
    marginLeft: 12,
    padding: 8,
  },
});