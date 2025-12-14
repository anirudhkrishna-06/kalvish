import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, Text as SvgText, G } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const RADAR_SIZE = Math.min(width - 80, 240);
const CENTER = RADAR_SIZE / 2;
const RADIUS = RADAR_SIZE / 2 - 40;

interface PerformanceRadarProps {
  marks: Array<{
    id: string;
    examName: string;
    score: number;
    maxScore?: number;
  }>;
}

export const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ marks }) => {
  const getPerformanceData = () => {
    if (marks.length === 0) return [];
    
    return marks.map((mark, index) => {
      const percentage = mark.maxScore ? (mark.score / mark.maxScore) * 100 : 100;
      const angle = (index * 2 * Math.PI) / marks.length;
      const normalizedValue = Math.min(percentage / 100, 1);
      
      return {
        name: mark.examName.substring(0, 10),
        value: normalizedValue,
        angle,
        x: CENTER + RADIUS * normalizedValue * Math.cos(angle - Math.PI / 2),
        y: CENTER + RADIUS * normalizedValue * Math.sin(angle - Math.PI / 2),
        percentage,
      };
    });
  };

  const getAverage = () => {
    if (marks.length === 0) return 0;
    const validMarks = marks.filter(mark => mark.maxScore);
    if (validMarks.length === 0) return 0;
    
    const total = validMarks.reduce((sum, mark) => {
      return sum + (mark.score / mark.maxScore!) * 100;
    }, 0);
    
    return total / validMarks.length;
  };

  const data = getPerformanceData();
  const average = getAverage();

  if (data.length < 3) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {marks.length === 0 
              ? "Add 3+ marks to see performance radar"
              : "Add more marks to visualize performance"}
          </Text>
        </View>
      </View>
    );
  }

  const points = data
    .map(point => `${point.x},${point.y}`)
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((radius, index) => (
          <Circle
            key={index}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS * radius}
            stroke={Colors.border}
            strokeWidth="1"
            fill="transparent"
            strokeOpacity={0.3}
          />
        ))}
        
        {/* Axes */}
        {data.map((point, index) => {
          const x = CENTER + RADIUS * Math.cos(point.angle - Math.PI / 2);
          const y = CENTER + RADIUS * Math.sin(point.angle - Math.PI / 2);
          
          return (
            <G key={`axis-${index}`}>
              <SvgText
                x={CENTER + (RADIUS + 25) * Math.cos(point.angle - Math.PI / 2)}
                y={CENTER + (RADIUS + 25) * Math.sin(point.angle - Math.PI / 2)}
                fontSize="10"
                fontWeight="600"
                fill={Colors.text}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {point.name}
              </SvgText>
              
              <SvgText
                x={CENTER + (RADIUS * point.value + 15) * Math.cos(point.angle - Math.PI / 2)}
                y={CENTER + (RADIUS * point.value + 15) * Math.sin(point.angle - Math.PI / 2)}
                fontSize="10"
                fill={Colors.muted}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {Math.round(point.percentage)}%
              </SvgText>
            </G>
          );
        })}
        
        {/* Performance polygon */}
        <Polygon
          points={points}
          fill={Colors.primary + '40'}
          stroke={Colors.primary}
          strokeWidth="2"
          opacity={0.8}
        />
      </Svg>
      
      <View style={styles.centerLabel}>
        <Text style={styles.averageText}>Avg</Text>
        <Text style={styles.averageValue}>{average.toFixed(1)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  placeholder: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    textAlign: 'center',
    color: Colors.muted,
    paddingHorizontal: 20,
  },
  centerLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -25 }],
    alignItems: 'center',
  },
  averageText: {
    fontSize: 12,
    color: Colors.muted,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
});