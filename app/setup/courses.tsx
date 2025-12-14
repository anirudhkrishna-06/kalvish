import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ChevronRight, Palette } from 'lucide-react-native';
import { generateId } from '@/utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type CoursesSetupNavigationProp = StackNavigationProp<RootStackParamList, 'CoursesSetup'>;


type CourseFormData = {
  name: string;
  facultyName: string;
  courseCode: string;
  color: string;
};

export default function CoursesSetupScreen() {
  const navigation = useNavigation<CoursesSetupNavigationProp>();
  const { courses, addCourse, deleteCourse } = useApp();
  
  const [form, setForm] = useState<CourseFormData>({
    name: '',
    facultyName: '',
    courseCode: '',
    color: Colors.courseColors[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCourse = async () => {
    if (!form.name.trim() || !form.facultyName.trim()) {
      Alert.alert('Required Fields', 'Please enter course name and faculty name');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCourse({
        name: form.name.trim(),
        facultyName: form.facultyName.trim(),
        courseCode: form.courseCode.trim() || undefined,
        color: form.color,

        currentUnit: '',
        previousClassTopic: '',
        notes: '',
        tasks: []
        });

      // Reset form
      setForm({
        name: '',
        facultyName: '',
        courseCode: '',
        color: Colors.courseColors[(courses.length + 1) % Colors.courseColors.length],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCourse(courseId)
        },
      ]
    );
  };

  const handleContinue = () => {
    if (courses.length === 0) {
      Alert.alert('No Courses', 'Please add at least one course before continuing.');
      return;
    }
    navigation.navigate('SlotsSetup')
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Your Courses</Text>
          <Text style={styles.subtitle}>
            Create all your academic courses. You need at least one to continue.
          </Text>
        </View>

        {/* Course Form */}
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="e.g., Operating Systems"
              placeholderTextColor={Colors.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Faculty Name *</Text>
            <TextInput
              style={styles.input}
              value={form.facultyName}
              onChangeText={(text) => setForm({ ...form, facultyName: text })}
              placeholder="e.g., Dr. John Smith"
              placeholderTextColor={Colors.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Course Code (Optional)</Text>
            <TextInput
              style={styles.input}
              value={form.courseCode}
              onChangeText={(text) => setForm({ ...form, courseCode: text })}
              placeholder="e.g., CS301"
              placeholderTextColor={Colors.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
              {Colors.courseColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    form.color === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setForm({ ...form, color })}
                >
                  {form.color === color && <Palette size={16} color="white" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
            onPress={handleAddCourse}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Course'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Course List */}
        <View style={styles.coursesContainer}>
          <View style={styles.coursesHeader}>
            <Text style={styles.coursesTitle}>Your Courses ({courses.length})</Text>
            {courses.length > 0 && (
              <Text style={styles.coursesSubtitle}>Tap to edit, long press to delete</Text>
            )}
          </View>

          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No courses added yet. Add your first course above!
              </Text>
            </View>
          ) : (
            courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseItem}
                activeOpacity={0.7}
                onLongPress={() => handleDeleteCourse(course.id)}
                delayLongPress={500}
              >
                <View style={[styles.courseColor, { backgroundColor: course.color }]} />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseFaculty}>{course.facultyName}</Text>
                  {course.courseCode && (
                    <Text style={styles.courseCode}>{course.courseCode}</Text>
                  )}
                </View>
                <Trash2 size={20} color={Colors.muted} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Continue Button */}
        {courses.length > 0 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue to Time Slots</Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        )}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.muted,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  colorScroll: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  coursesContainer: {
    flex: 1,
  },
  coursesHeader: {
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  coursesSubtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: Colors.card,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  courseItem: {
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
    width: 24,
    height: 24,
    borderRadius: 12,
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
  continueButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});