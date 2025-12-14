import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  User,
  Award,
  FileText,
  Clock,
  MoreVertical,
} from 'lucide-react-native';
import { Mark, Task } from '@/types/Course';
import { formatDate } from '@/lib/dateUtils';

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type CourseDetailNavigationProp = StackNavigationProp<RootStackParamList, 'CourseDetail'>;

const { width } = Dimensions.get('window');

export default function CourseDetailScreen() {
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const route = useRoute<CourseDetailRouteProp>();
  const { courseId } = route.params;
  const [newTaskName, setNewTaskName] = useState('');

  
  const { getCourseById, updateCourse, addMarkToCourse, updateMark, deleteMark } = useApp();
  
  const course = getCourseById(courseId);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Editing states
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isEditingPrevious, setIsEditingPrevious] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isAddingMark, setIsAddingMark] = useState(false);
  
  // Form states
  const [currentUnit, setCurrentUnit] = useState('');
  const [previousClassTopic, setPreviousClassTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [markForm, setMarkForm] = useState({
    examName: '',
    score: '',
    maxScore: '',
  });

  useEffect(() => {
    if (course) {
      setCurrentUnit(course.currentUnit);
      setPreviousClassTopic(course.previousClassTopic);
      setNotes(course.notes);
      
      // Animation
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
    }
  }, [course]);

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveUnit = async () => {
    if (currentUnit.trim() !== course.currentUnit) {
      await updateCourse(courseId, { currentUnit: currentUnit.trim() });
    }
    setIsEditingUnit(false);
  };

  const handleSavePrevious = async () => {
    if (previousClassTopic.trim() !== course.previousClassTopic) {
      await updateCourse(courseId, { previousClassTopic: previousClassTopic.trim() });
    }
    setIsEditingPrevious(false);
  };

  const handleSaveNotes = async () => {
    if (notes.trim() !== course.notes) {
      await updateCourse(courseId, { notes: notes.trim() });
    }
    setIsEditingNotes(false);
  };

  const handleAddMark = async () => {
    if (!markForm.examName.trim() || !markForm.score.trim()) {
      Alert.alert('Error', 'Please enter exam name and score');
      return;
    }

    const score = parseFloat(markForm.score);
    const maxScore = markForm.maxScore ? parseFloat(markForm.maxScore) : undefined;

    if (isNaN(score) || (maxScore && isNaN(maxScore))) {
      Alert.alert('Error', 'Please enter valid numbers for scores');
      return;
    }

    if (maxScore && score > maxScore) {
      Alert.alert('Error', 'Score cannot be greater than maximum score');
      return;
    }

    await addMarkToCourse(courseId, {
      examName: markForm.examName.trim(),
      score,
      maxScore,
      date: new Date(),
    });

    setMarkForm({ examName: '', score: '', maxScore: '' });
    setIsAddingMark(false);
  };
  


  const handleDeleteMark = (markId: string) => {
    Alert.alert(
      'Delete Mark',
      'Are you sure you want to delete this mark?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMark(courseId, markId)
        },
      ]
    );
  };
  const handleAddTask = async () => {
  if (!newTaskName.trim()) return;

  const newTask: Task = {
    id: Date.now().toString(),
    name: newTaskName.trim(),
  };

  await updateCourse(courseId, {
    tasks: [...(course.tasks || []), newTask],
  });

  setNewTaskName('');
};

  const handleCompleteTask = async (taskId: string) => {
  await updateCourse(courseId, {
    tasks: (course.tasks || []).filter(task => task.id !== taskId),
  });
};
  const calculateAverage = () => {
    if (course.marks.length === 0) return null;
    
    const validMarks = course.marks.filter(mark => mark.maxScore);
    if (validMarks.length === 0) return null;
    
    const totalPercentage = validMarks.reduce((sum, mark) => {
      return sum + (mark.score / (mark.maxScore || 1)) * 100;
    }, 0);
    
    return (totalPercentage / validMarks.length).toFixed(1);
  };

  const average = calculateAverage();

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.courseName} numberOfLines={1}>
              {course.name}
            </Text>
            <Text style={styles.courseFaculty}>{course.facultyName}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <View style={[styles.courseColor, { backgroundColor: course.color }]} />
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Course Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <BookOpen size={20} color={Colors.muted} />
              <Text style={styles.infoLabel}>Course Code:</Text>
              <Text style={styles.infoValue}>
                {course.courseCode || 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <User size={20} color={Colors.muted} />
              <Text style={styles.infoLabel}>Faculty:</Text>
              <Text style={styles.infoValue}>{course.facultyName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.muted} />
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>
                {formatDate(course.updatedAt)}
              </Text>
            </View>
          </View>

          {/* Current Unit Section */}
          {/* Current Unit Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Unit</Text>
            </View>

            {course.currentUnit ? (
              <View style={styles.unitCard}>
                <Text style={styles.unitText}>{course.currentUnit}</Text>
                <TouchableOpacity
                  style={styles.unitCompleteButton}
                  onPress={async () => {
                    await updateCourse(courseId, { currentUnit: '' });
                    setCurrentUnit('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.unitCompleteText}>Mark as Completed</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addUnitContainer}>
                <TextInput
                  style={styles.textInput}
                  value={currentUnit}
                  onChangeText={setCurrentUnit}
                  placeholder="Enter current unit..."
                  placeholderTextColor={Colors.muted}
                />
                <TouchableOpacity
                  style={styles.addUnitButton}
                  onPress={handleSaveUnit}
                >
                  <Text style={styles.addUnitButtonText}>Add Unit</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Progress Bar */}
            <View style={styles.unitProgressContainer}>
              {[1,2,3,4,5].map((u) => (
                <View
                  key={u}
                  style={[
                    styles.unitProgressDot,
                    course.currentUnit && u === Number(course.currentUnit.replace(/\D/g,'')) 
                      ? styles.unitProgressActive 
                      : styles.unitProgressInactive
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tasks</Text>
            </View>

            {/* Add Task */}
            <View style={styles.addTaskContainer}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="New Task"
                placeholderTextColor={Colors.muted}
                value={newTaskName}
                onChangeText={setNewTaskName}
              />
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={handleAddTask}
                activeOpacity={0.7}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Task List */}
            <View style={styles.tasksList}>
              {(course.tasks?.length ?? 0) === 0 ? (
                <Text style={{ color: Colors.muted, marginTop: 8 }}>No tasks added yet</Text>
              ) : (
                (course.tasks ?? []).map((task: Task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => handleCompleteTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.taskName}>{task.name}</Text>
                    <Text style={styles.taskDeadline}>{task.deadline ? formatDate(task.deadline) : ''}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* Previous Class Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Previous Class</Text>
              {!isEditingPrevious ? (
                <TouchableOpacity
                  onPress={() => setIsEditingPrevious(true)}
                  activeOpacity={0.7}
                >
                  <Edit size={20} color={Colors.muted} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSavePrevious}
                  activeOpacity={0.7}
                >
                  <Save size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditingPrevious ? (
              <TextInput
                style={[styles.textInput, { minHeight: 80 }]}
                value={previousClassTopic}
                onChangeText={setPreviousClassTopic}
                placeholder="What was covered in the last class?"
                placeholderTextColor={Colors.muted}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <TouchableOpacity
                style={styles.contentCard}
                onPress={() => setIsEditingPrevious(true)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.contentText,
                  !course.previousClassTopic && styles.placeholderText,
                ]}>
                  {course.previousClassTopic || 'Tap to add previous class content...'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Personal Notes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Notes</Text>
              {!isEditingNotes ? (
                <TouchableOpacity
                  onPress={() => setIsEditingNotes(true)}
                  activeOpacity={0.7}
                >
                  <Edit size={20} color={Colors.muted} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSaveNotes}
                  activeOpacity={0.7}
                >
                  <Save size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditingNotes ? (
              <TextInput
                style={[styles.textInput, { minHeight: 120 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add your personal notes, important points, reminders..."
                placeholderTextColor={Colors.muted}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <TouchableOpacity
                style={styles.contentCard}
                onPress={() => setIsEditingNotes(true)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.contentText,
                  !course.notes && styles.placeholderText,
                ]}>
                  {course.notes || 'Tap to add personal notes...'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Marks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exam Marks</Text>
              {average && (
                <View style={styles.averageBadge}>
                  <Award size={16} color={Colors.success} />
                  <Text style={styles.averageText}>{average}% avg</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setIsAddingMark(true)}
                activeOpacity={0.7}
              >
                <Plus size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Add Mark Form */}
            {isAddingMark && (
              <View style={styles.addMarkForm}>
                <View style={styles.markFormRow}>
                  <TextInput
                    style={[styles.markInput, { flex: 2 }]}
                    value={markForm.examName}
                    onChangeText={(text) => setMarkForm({ ...markForm, examName: text })}
                    placeholder="Exam Name"
                    placeholderTextColor={Colors.muted}
                  />
                  <TextInput
                    style={[styles.markInput, { flex: 1 }]}
                    value={markForm.score}
                    onChangeText={(text) => setMarkForm({ ...markForm, score: text })}
                    placeholder="Score"
                    placeholderTextColor={Colors.muted}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.markInput, { flex: 1 }]}
                    value={markForm.maxScore}
                    onChangeText={(text) => setMarkForm({ ...markForm, maxScore: text })}
                    placeholder="Max"
                    placeholderTextColor={Colors.muted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.markFormActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingMark(false);
                      setMarkForm({ examName: '', score: '', maxScore: '' });
                    }}
                  >
                    <X size={20} color={Colors.muted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveMarkButton}
                    onPress={handleAddMark}
                  >
                    <Text style={styles.saveMarkText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Marks List */}
            <View style={styles.marksList}>
              {course.marks.length === 0 ? (
                <View style={styles.emptyMarks}>
                  <FileText size={40} color={Colors.border} />
                  <Text style={styles.emptyMarksText}>No marks added yet</Text>
                  <Text style={styles.emptyMarksSubtext}>
                    Add your first exam score to track progress
                  </Text>
                </View>
              ) : (
                course.marks.map((mark) => {
                  const percentage = mark.maxScore 
                    ? ((mark.score / mark.maxScore) * 100).toFixed(1)
                    : null;
                  
                  return (
                    <View key={mark.id} style={styles.markCard}>
                      <View style={styles.markInfo}>
                        <Text style={styles.markExamName}>{mark.examName}</Text>
                        <Text style={styles.markDate}>
                          {mark.date ? formatDate(mark.date) : 'No date'}
                        </Text>
                      </View>
                      
                      <View style={styles.markScore}>
                        <Text style={styles.markScoreText}>
                          {mark.score}
                          {mark.maxScore && ` / ${mark.maxScore}`}
                        </Text>
                        {percentage && (
                          <Text style={[
                            styles.markPercentage,
                            parseFloat(percentage) >= 70 ? styles.markPercentageGood :
                            parseFloat(percentage) >= 50 ? styles.markPercentageAverage :
                            styles.markPercentagePoor
                          ]}>
                            {percentage}%
                          </Text>
                        )}
                      </View>
                      
                      <TouchableOpacity
                        style={styles.deleteMarkButton}
                        onPress={() => handleDeleteMark(mark.id)}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={18} color={Colors.muted} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
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
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  courseName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  courseFaculty: {
    fontSize: 14,
    color: Colors.muted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.muted,
    marginLeft: 12,
    marginRight: 8,
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  averageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  averageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 60,
  },
  contentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  placeholderText: {
    color: Colors.muted,
    fontStyle: 'italic',
  },
  addMarkForm: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  markFormRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  markInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
  markFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    padding: 8,
  },
  saveMarkButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveMarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  marksList: {
    gap: 12,
  },
  emptyMarks: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyMarksText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyMarksSubtext: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
  },
  markCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  markInfo: {
    flex: 1,
  },
  markExamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  markDate: {
    fontSize: 12,
    color: Colors.muted,
  },
  markScore: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  markScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  markPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  markPercentageGood: {
    color: Colors.success,
  },
  markPercentageAverage: {
    color: Colors.warning,
  },
  markPercentagePoor: {
    color: Colors.error,
  },
  deleteMarkButton: {
    padding: 8,
  },

  unitCard: {
  backgroundColor: Colors.card,
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginBottom: 12,
  borderWidth: 1,
  borderColor: Colors.border,
},
unitText: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.text,
  marginBottom: 8,
},
unitCompleteButton: {
  backgroundColor: Colors.success,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
},
unitCompleteText: {
  color: 'white',
  fontWeight: '600',
},
addUnitContainer: {
  flexDirection: 'row',
  gap: 12,
  alignItems: 'center',
  marginBottom: 12,
},
addUnitButton: {
  backgroundColor: Colors.primary,
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
},
addUnitButtonText: {
  color: 'white',
  fontWeight: '600',
},
unitProgressContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 8,
  paddingHorizontal: 8,
},
unitProgressDot: {
  width: 16,
  height: 16,
  borderRadius: 8,
},
unitProgressActive: {
  backgroundColor: Colors.primary,
},
unitProgressInactive: {
  backgroundColor: Colors.border,
},
addTaskContainer: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 12,
  alignItems: 'center',
},
addTaskButton: {
  backgroundColor: Colors.primary,
  padding: 12,
  borderRadius: 8,
},
tasksList: {
  gap: 8,
},
taskCard: {
  backgroundColor: Colors.card,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: Colors.border,
  flexDirection: 'row',
  justifyContent: 'space-between',
},
taskName: {
  fontSize: 16,
  fontWeight: '600',
  color: Colors.text,
},
taskDeadline: {
  fontSize: 12,
  color: Colors.muted,
},


});