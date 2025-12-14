import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Plus,
  BookOpen,
  User,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react-native';
import { formatDate } from '@/lib/dateUtils';

type CourseListNavigationProp = StackNavigationProp<RootStackParamList, 'CourseList'>;

export default function CourseListScreen() {
  const navigation = useNavigation<CourseListNavigationProp>();
  const { courses } = useApp();

  const getCourseStats = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return { marksCount: 0, hasNotes: false, hasUnit: false };
    
    return {
      marksCount: course.marks.length,
      hasNotes: !!course.notes.trim(),
      hasUnit: !!course.currentUnit.trim(),
      hasPrevious: !!course.previousClassTopic.trim(),
    };
  };

  const handleCoursePress = (courseId: string) => {
    navigation.navigate('CourseDetail', { courseId });
  };

  const handleAddCourse = () => {
    navigation.navigate('CoursesSetup');
  };

  const getCourseProgress = (courseId: string) => {
    const stats = getCourseStats(courseId);
    let progress = 0;
    if (stats.hasUnit) progress += 25;
    if (stats.hasPrevious) progress += 25;
    if (stats.hasNotes) progress += 25;
    if (stats.marksCount > 0) progress += 25;
    return progress;
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.title}>My Courses</Text>
          <Text style={styles.subtitle}>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} total
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCourse}
          activeOpacity={0.7}
        >
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Courses Yet</Text>
          <Text style={styles.emptyText}>
            You haven't added any courses yet. Add your first course to start tracking.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddCourse}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyButtonText}>Add First Course</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Stats Overview */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <BookOpen size={20} color={Colors.primary} />
                <Text style={styles.statValue}>{courses.length}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              
              <View style={styles.statItem}>
                <TrendingUp size={20} color={Colors.secondary} />
                <Text style={styles.statValue}>
                  {courses.reduce((sum, course) => sum + course.marks.length, 0)}
                </Text>
                <Text style={styles.statLabel}>Marks</Text>
              </View>
              
              <View style={styles.statItem}>
                <FileText size={20} color={Colors.warning} />
                <Text style={styles.statValue}>
                  {courses.filter(c => c.notes.trim()).length}
                </Text>
                <Text style={styles.statLabel}>With Notes</Text>
              </View>
              
              <View style={styles.statItem}>
                <Clock size={20} color={Colors.success} />
                <Text style={styles.statValue}>
                  {courses.filter(c => c.currentUnit.trim()).length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
          </View>

          {/* Courses List */}
          <View style={styles.coursesList}>
            {courses.map((course) => {
              const stats = getCourseStats(course.id);
              const progress = getCourseProgress(course.id);
              
              return (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => handleCoursePress(course.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.courseHeader}>
                    <View style={[styles.courseColor, { backgroundColor: course.color }]} />
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseFaculty}>{course.facultyName}</Text>
                      {course.courseCode && (
                        <Text style={styles.courseCode}>{course.courseCode}</Text>
                      )}
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{progress}% complete</Text>
                  </View>
                  
                  {/* Stats */}
                  <View style={styles.courseStats}>
                    <View style={styles.statBadge}>
                      <BookOpen size={12} color={Colors.primary} />
                      <Text style={styles.statBadgeText}>
                        {stats.hasUnit ? 'Unit set' : 'No unit'}
                      </Text>
                    </View>
                    
                    <View style={styles.statBadge}>
                      <FileText size={12} color={Colors.warning} />
                      <Text style={styles.statBadgeText}>
                        {stats.hasNotes ? 'Has notes' : 'No notes'}
                      </Text>
                    </View>
                    
                    <View style={styles.statBadge}>
                      <TrendingUp size={12} color={Colors.secondary} />
                      <Text style={styles.statBadgeText}>
                        {stats.marksCount} marks
                      </Text>
                    </View>
                    
                    <View style={styles.statBadge}>
                      <Clock size={12} color={Colors.success} />
                      <Text style={styles.statBadgeText}>
                        Updated {formatDate(course.updatedAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  addButton: {
    padding: 8,
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
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  courseColor: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  courseInfo: {
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
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'right',
  },
  courseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statBadgeText: {
    fontSize: 12,
    color: Colors.text,
  },
});