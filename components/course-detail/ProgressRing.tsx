import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 80;
const CIRCLE_STROKE_WIDTH = 6;
const CIRCLE_RADIUS = (CIRCLE_SIZE - CIRCLE_STROKE_WIDTH) / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = CIRCLE_SIZE,
  strokeWidth = CIRCLE_STROKE_WIDTH,
  color = Colors.primary,
  showLabel = true,
  label,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size/2}, ${size/2}`}>
          {/* Background circle */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={Colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeOpacity={0.3}
          />
          {/* Progress circle */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Animated.Text style={styles.progressText}>
            {label || `${Math.round(progress * 100)}%`}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});