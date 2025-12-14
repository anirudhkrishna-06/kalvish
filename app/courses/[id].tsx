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
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  Target,
  BarChart3,
  BookMarked,
  Feather,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Tag,
  Pin,
  Archive,
  Book,
  Hash,
  Calendar,
  CheckCircle,
  MoreVertical,
  ArrowUpDown,
} from 'lucide-react-native';
import { Mark, Task } from '@/types/Course';
import { formatDate, formatRelativeDate } from '@/lib/dateUtils';

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type CourseDetailNavigationProp = StackNavigationProp<RootStackParamList, 'CourseDetail'>;

const { width } = Dimensions.get('window');

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function CourseDetailScreen() {
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const route = useRoute<CourseDetailRouteProp>();
  const { courseId } = route.params;
  
  const { getCourseById, updateCourse, addMarkToCourse, updateMark, deleteMark } = useApp();
  const course = getCourseById(courseId);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isAddingMark, setIsAddingMark] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'marks' | 'tasks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tag: '',
  });
  const [markForm, setMarkForm] = useState({
    examName: '',
    score: '',
    maxScore: '',
  });

  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const notesScrollRef = useRef<ScrollView>(null);

  // Sample notes data - in real app, this would come from your data layer
  const [notes, setNotes] = useState<Note[]>([]);


  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const otherNotes = filteredNotes.filter(note => !note.isPinned);

  useEffect(() => {
    if (course) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [course]);

  useEffect(() => {
    if (course?.notes) {
      setNotes(course.notes);
    }
  }, [course]);



  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const calculateAverage = () => {
    if (!course || course.marks.length === 0) return null;
    
    const validMarks = course.marks.filter(mark => mark.maxScore);
    if (validMarks.length === 0) return null;
    
    const totalPercentage = validMarks.reduce((sum, mark) => {
      return sum + (mark.score / mark.maxScore!) * 100;
    }, 0);
    
    return totalPercentage / validMarks.length;
  };

  const handleAddMark = async () => {
    if (!course || !markForm.examName.trim() || !markForm.score.trim()) {
      Alert.alert('Error', 'Please enter exam name and score');
      return;
    }

    const score = parseFloat(markForm.score);
    const maxScore = markForm.maxScore ? parseFloat(markForm.maxScore) : undefined;

    if (isNaN(score) || (maxScore && isNaN(maxScore))) {
      Alert.alert('Error', 'Please enter valid numbers for scores');
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

  const handleCreateNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      Alert.alert('Error', 'Please enter note title or content');
      return;
    }

    const newNoteObj: Note = {
      id: Date.now().toString(),
      title: newNote.title.trim() || 'Untitled Note',
      content: newNote.content.trim(),
      tags: newNote.tag.trim() ? [newNote.tag.trim()] : [],
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes(prev => {
      const updated = [newNoteObj, ...prev];
      updateCourse(courseId, { notes: updated });
      return updated;
    });
    setNewNote({ title: '', content: '', tag: '' });
    
    // Scroll to top to show new note
    notesScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => {
      const updated = prev.map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      );
      updateCourse(courseId, { notes: updated });
      return updated;
    });
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setNotes(prev => {
              const updated = prev.filter(note => note.id !== noteId);
              updateCourse(courseId, { notes: updated });
              return updated;
            });
          }
        },
      ]
    );
  };

  const handlePinNote = (noteId: string) => {
    setNotes(prev => {
      const updated = prev.map(note =>
        note.id === noteId
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
          : note
      );
      updateCourse(courseId, { notes: updated });
      return updated;
    });
  };

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

  const average = calculateAverage();
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Note Input */}
      <View style={styles.quickNoteContainer}>
        <View style={styles.quickNoteHeader}>
          <Text style={styles.quickNoteTitle}>Quick Capture</Text>
          <TouchableOpacity
            style={styles.saveQuickNoteButton}
            onPress={handleCreateNote}
            disabled={!newNote.title.trim() && !newNote.content.trim()}
          >
            <Save size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.quickNoteTitleInput}
          placeholder="Note title (optional)"
          placeholderTextColor={Colors.muted}
          value={newNote.title}
          onChangeText={(text) => setNewNote(prev => ({ ...prev, title: text }))}
        />
        
        <TextInput
          style={styles.quickNoteContentInput}
          placeholder="What's on your mind? Type your notes here..."
          placeholderTextColor={Colors.muted}
          value={newNote.content}
          onChangeText={(text) => setNewNote(prev => ({ ...prev, content: text }))}
          multiline
          textAlignVertical="top"
          numberOfLines={4}
        />
        
        <View style={styles.quickNoteFooter}>
          <View style={styles.tagInputContainer}>
            <Tag size={16} color={Colors.muted} />
            <TextInput
              style={styles.tagInput}
              placeholder="Add tag"
              placeholderTextColor={Colors.muted}
              value={newNote.tag}
              onChangeText={(text) => setNewNote(prev => ({ ...prev, tag: text }))}
            />
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={Colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Notes List */}
      <ScrollView 
        ref={notesScrollRef}
        style={styles.notesList}
        showsVerticalScrollIndicator={false}
      >
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Pin size={20} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Pinned Notes</Text>
            </View>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNoteId}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onPin={handlePinNote}
                isEditing={editingNoteId === note.id}
              />
            ))}
          </>
        )}

        {/* Other Notes */}
        <View style={styles.sectionHeader}>
          <FileText size={20} color={Colors.muted} />
          <Text style={styles.sectionTitle}>All Notes</Text>
          <Text style={styles.notesCount}>{filteredNotes.length}</Text>
        </View>
        
        {otherNotes.length === 0 ? (
          <View style={styles.emptyNotes}>
            <Book size={48} color={Colors.border} />
            <Text style={styles.emptyNotesTitle}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={styles.emptyNotesText}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Start by adding your first note above'}
            </Text>
          </View>
        ) : (
          otherNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditingNoteId}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onPin={handlePinNote}
              isEditing={editingNoteId === note.id}
            />
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderMarksTab = () => (
    <View style={styles.tabContent}>
      {/* Marks Summary */}
      <View style={styles.marksSummary}>
        <View style={styles.marksSummaryItem}>
          <Text style={styles.marksSummaryLabel}>Average Score</Text>
          <Text style={styles.marksSummaryValue}>
            {average ? `${average.toFixed(1)}%` : '--'}
          </Text>
        </View>
        <View style={styles.marksSummaryItem}>
          <Text style={styles.marksSummaryLabel}>Total Exams</Text>
          <Text style={styles.marksSummaryValue}>{course.marks.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.addMarkButton}
          onPress={() => setIsAddingMark(true)}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addMarkButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Marks List */}
      <ScrollView style={styles.marksList} showsVerticalScrollIndicator={false}>
        {course.marks.length === 0 ? (
          <View style={styles.emptyMarks}>
            <Award size={48} color={Colors.border} />
            <Text style={styles.emptyMarksTitle}>No marks recorded</Text>
            <Text style={styles.emptyMarksText}>
              Add your first exam score to track performance
            </Text>
          </View>
        ) : (
          course.marks.map((mark) => {
            const percentage = mark.maxScore 
              ? (mark.score / mark.maxScore) * 100
              : null;
            
            return (
              <View key={mark.id} style={styles.markCard}>
                <View style={styles.markInfo}>
                  <Text style={styles.markExamName}>{mark.examName}</Text>
                  <View style={styles.markMeta}>
                    <Clock size={12} color={Colors.muted} />
                    <Text style={styles.markDate}>
                      {mark.date ? formatDate(mark.date) : 'No date'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.markScore}>
                  <Text style={styles.markScoreText}>
                    {mark.score}
                    {mark.maxScore && ` / ${mark.maxScore}`}
                  </Text>
                  {percentage && (
                    <Text style={[
                      styles.markPercentage,
                      percentage >= 70 ? styles.markPercentageGood :
                      percentage >= 50 ? styles.markPercentageAverage :
                      styles.markPercentagePoor
                    ]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  const renderTasksTab = () => {
    const handleAddTask = async () => {
      if (!newTask.trim() || !course) return;

      const task: Task = {
        id: Date.now().toString(),
        name: newTask.trim(),
        createdAt: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week from now
      };

      await updateCourse(courseId, {
        tasks: [...(course.tasks || []), task],
      });

      setNewTask('');
      setIsAddingTask(false);
    };

    const handleCompleteTask = async (taskId: string) => {
      if (!course) return;
      await updateCourse(courseId, {
        tasks: (course.tasks || []).filter(task => task.id !== taskId),
      });
    };

    const handleSetDeadline = async (taskId: string, days: number) => {
      if (!course) return;
      const deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      await updateCourse(courseId, {
        tasks: (course.tasks || []).map(task => 
          task.id === taskId ? { ...task, deadline } : task
        ),
      });
    };

    return (
      <View style={styles.tabContent}>
        {/* Course Info Card */}
        <View style={styles.courseInfoCard}>
          <View style={styles.infoRow}>
            <BookOpen size={18} color={Colors.muted} />
            <Text style={styles.infoLabel}>Course:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{course.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <User size={18} color={Colors.muted} />
            <Text style={styles.infoLabel}>Faculty:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{course.facultyName}</Text>
          </View>
          {course.courseCode && (
            <View style={styles.infoRow}>
              <Hash size={18} color={Colors.muted} />
              <Text style={styles.infoLabel}>Code:</Text>
              <Text style={styles.infoValue}>{course.courseCode}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Calendar size={18} color={Colors.muted} />
            <Text style={styles.infoLabel}>Updated:</Text>
            <Text style={styles.infoValue}>{formatRelativeDate(course.updatedAt)}</Text>
          </View>
        </View>

        {/* Quick Add Task Button */}
        <TouchableOpacity
          style={styles.addTaskFloatingButton}
          onPress={() => setIsAddingTask(true)}
        >
          <Plus size={24} color="white" />
          <Text style={styles.addTaskFloatingText}>Add</Text>
        </TouchableOpacity>

        {/* Add Task Modal */}
        {isAddingTask && (
          <View style={styles.taskModalOverlay}>
            <View style={styles.taskModalContent}>
              <View style={styles.taskModalHeader}>
                <Text style={styles.taskModalTitle}>Add New Task</Text>
                <TouchableOpacity onPress={() => setIsAddingTask(false)}>
                  <X size={24} color={Colors.muted} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.taskModalInput}
                placeholder="What needs to be done?"
                placeholderTextColor={Colors.muted}
                value={newTask}
                onChangeText={setNewTask}
                multiline
                numberOfLines={3}
              />
              
              
              
              <View style={styles.taskModalActions}>
                <TouchableOpacity
                  style={[styles.taskModalButton, styles.cancelButton]}
                  onPress={() => setIsAddingTask(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.taskModalButton, styles.saveButton, !newTask.trim() && styles.disabledButton]}
                  onPress={handleAddTask}
                  disabled={!newTask.trim()}
                >
                  <Text style={styles.saveButtonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Target size={24} color={Colors.text} />
            <Text style={styles.tasksTitle}>Tasks & Deadlines</Text>
            <Text style={styles.tasksCount}>({course.tasks?.length || 0})</Text>
          </View>
          
          {(course.tasks?.length || 0) === 0 ? (
            <View style={styles.emptyTasks}>
              <CheckCircle size={48} color={Colors.border} />
              <Text style={styles.emptyTasksTitle}>All caught up!</Text>
              <Text style={styles.emptyTasksText}>
                Tap "Add Task" to create your first task
              </Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {course.tasks?.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => handleCompleteTask(task.id)}
                  onLongPress={() => setSelectedTask(task)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskContent}>
                    <View style={styles.taskCheckbox}>
                      <View style={styles.checkboxCircle} />
                    </View>
                    <View style={styles.taskDetails}>
                      <Text style={styles.taskName}>{task.name}</Text>
                      {task.deadline && (
                        <View style={styles.taskDeadline}>
                          <Clock size={12} color={Colors.muted} />
                          <Text style={styles.taskDeadlineText}>
                            {formatDate(task.deadline)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.taskCompleteButton}
                    onPress={() => handleCompleteTask(task.id)}
                  >
                    <CheckCircle size={20} color={Colors.success} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Task Context Menu */}
          {selectedTask && (
            <View style={styles.contextMenuOverlay}>
              <View style={styles.contextMenu}>
                <View style={styles.contextMenuHeader}>
                  <Text style={styles.contextMenuTitle}>{selectedTask.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedTask(null)}>
                    <X size={20} color={Colors.muted} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.contextMenuActions}>
                  <TouchableOpacity
                    style={styles.contextMenuButton}
                    onPress={() => {
                      handleCompleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    <CheckCircle size={18} color={Colors.success} />
                    <Text style={styles.contextMenuButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.contextMenuButton}
                    onPress={() => {
                      handleSetDeadline(selectedTask.id, 1);
                      setSelectedTask(null);
                    }}
                  >
                    <Clock size={18} color={Colors.warning} />
                    <Text style={styles.contextMenuButtonText}>Set for Tomorrow</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.contextMenuButton}
                    onPress={() => {
                      handleSetDeadline(selectedTask.id, 7);
                      setSelectedTask(null);
                    }}
                  >
                    <Calendar size={18} color={Colors.primary} />
                    <Text style={styles.contextMenuButtonText}>Set for Next Week</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Background */}
      <Animated.View 
        style={[
          styles.headerBackground,
          {
            opacity: headerOpacity,
            backgroundColor: course.color,
          },
        ]}
      >
        <LinearGradient
          colors={[course.color, `${course.color}80`]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.courseName} numberOfLines={1}>
              {course.name}
            </Text>
            <Text style={styles.courseFaculty} numberOfLines={1}>
              {course.facultyName}
            </Text>
          </View>
          
          <View style={styles.courseColorBadge}>
            <View style={[styles.courseColor, { backgroundColor: course.color }]} />
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
            onPress={() => setActiveTab('notes')}
          >
            <BookMarked size={20} color={activeTab === 'notes' ? Colors.primary : '#fff'} />
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
              Notes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'marks' && styles.activeTab]}
            onPress={() => setActiveTab('marks')}
          >
            <BarChart3 size={20} color={activeTab === 'marks' ? Colors.primary : '#fff'} />
            <Text style={[styles.tabText, activeTab === 'marks' && styles.activeTabText]}>
              Marks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
            onPress={() => setActiveTab('tasks')}
          >
            <Target size={20} color={activeTab === 'tasks' ? Colors.primary : '#fff'} />
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
              Course
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {activeTab === 'notes' && renderNotesTab()}
          {activeTab === 'marks' && renderMarksTab()}
          {activeTab === 'tasks' && renderTasksTab()}
        </Animated.View>

        {/* Add Mark Modal */}
        {isAddingMark && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Exam Score</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingMark(false);
                    setMarkForm({ examName: '', score: '', maxScore: '' });
                  }}
                >
                  <X size={24} color={Colors.muted} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalForm}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Exam Name"
                  placeholderTextColor={Colors.muted}
                  value={markForm.examName}
                  onChangeText={(text) => setMarkForm({ ...markForm, examName: text })}
                />
                
                <View style={styles.scoreInputs}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1 }]}
                    placeholder="Score"
                    placeholderTextColor={Colors.muted}
                    value={markForm.score}
                    onChangeText={(text) => setMarkForm({ ...markForm, score: text })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.scoreDivider}>/</Text>
                  <TextInput
                    style={[styles.modalInput, { flex: 1 }]}
                    placeholder="Max"
                    placeholderTextColor={Colors.muted}
                    value={markForm.maxScore}
                    onChangeText={(text) => setMarkForm({ ...markForm, maxScore: text })}
                    keyboardType="numeric"
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.modalSubmit}
                  onPress={handleAddMark}
                >
                  <Text style={styles.modalSubmitText}>Add Score</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// Note Card Component
const NoteCard = ({ 
  note, 
  onEdit, 
  onUpdate, 
  onDelete, 
  onPin,
  isEditing 
}: {
  note: Note;
  onEdit: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  isEditing: boolean;
}) => {
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);
  const [localTag, setLocalTag] = useState(note.tags.join(', '));

  const handleSave = () => {
    const tags = localTag.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onUpdate(note.id, {
      title: localTitle.trim() || 'Untitled Note',
      content: localContent.trim(),
      tags,
    });
    onEdit('');
  };

  const handleCancel = () => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setLocalTag(note.tags.join(', '));
    onEdit('');
  };

  return (
    <View style={[styles.noteCard, note.isPinned && styles.pinnedNoteCard]}>
      {/* Note Header */}
      <View style={styles.noteHeader}>
        {isEditing ? (
          <TextInput
            style={styles.noteTitleInput}
            value={localTitle}
            onChangeText={setLocalTitle}
            placeholder="Note title"
            placeholderTextColor={Colors.muted}
          />
        ) : (
          <Text style={styles.noteTitle} numberOfLines={1}>
            {note.title}
          </Text>
        )}
        
        <View style={styles.noteActions}>
          <TouchableOpacity onPress={() => onPin(note.id)}>
            <Pin size={18} color={note.isPinned ? Colors.warning : Colors.muted} />
          </TouchableOpacity>
          
          {isEditing ? (
            <>
              <TouchableOpacity onPress={handleSave}>
                <Save size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel}>
                <X size={18} color={Colors.error} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => onEdit(note.id)}>
                <Edit size={18} color={Colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(note.id)}>
                <Trash2 size={18} color={Colors.muted} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Note Content */}
      {isEditing ? (
        <TextInput
          style={styles.noteContentInput}
          value={localContent}
          onChangeText={setLocalContent}
          placeholder="Note content..."
          placeholderTextColor={Colors.muted}
          multiline
          textAlignVertical="top"
          numberOfLines={4}
        />
      ) : (
        <Text style={styles.noteContent} numberOfLines={4}>
          {note.content}
        </Text>
      )}

      {/* Tags and Metadata */}
      <View style={styles.noteFooter}>
        {isEditing ? (
          <TextInput
            style={styles.tagInput}
            value={localTag}
            onChangeText={setLocalTag}
            placeholder="Add tags (comma separated)"
            placeholderTextColor={Colors.muted}
          />
        ) : (
          <View style={styles.tagsContainer}>
            {note.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Hash size={10} color={Colors.muted} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.noteDate}>
          {formatRelativeDate(note.updatedAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  courseName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  courseFaculty: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  courseColorBadge: {
    padding: 8,
  },
  courseColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    borderRadius: 30,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  // Quick Note Styles
  quickNoteContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  // Add these styles to your existing styles object:

// Floating Add Task Button
addTaskFloatingButton: {
  position: 'absolute',
  bottom: 10,
  right: 1,
  backgroundColor: Colors.primary,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 14,
  borderRadius: 30,
  gap: 8,
  zIndex: 100,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
},
addTaskFloatingText: {
  color: 'white',
  fontSize: 12,
  fontWeight: '600',
},

// Task Modal
taskModalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
},
taskModalContent: {
  backgroundColor: Colors.card,
  borderRadius: 20,
  padding: 24,
  width: width - 40,
},
taskModalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},
taskModalTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: Colors.text,
},
taskModalInput: {
  backgroundColor: Colors.background,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 12,
  padding: 10,
  fontSize: 12,
  color: Colors.text,
  minHeight: 40,
  marginBottom: 20,
},
taskDeadlineOptions: {
  marginBottom: 20,
},
deadlineLabel: {
  fontSize: 14,
  color: Colors.muted,
  marginBottom: 12,
},
deadlineButtons: {
  flexDirection: 'row',
  gap: 8,
  flexWrap: 'wrap',
},
deadlineButton: {
  backgroundColor: Colors.background,
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: Colors.border,
},
deadlineButtonText: {
  fontSize: 14,
  color: Colors.text,
},
taskModalActions: {
  flexDirection: 'row',
  gap: 12,
},
taskModalButton: {
  flex: 1,
  padding: 16,
  borderRadius: 30,
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: Colors.background,
  borderWidth: 1,
  borderColor: Colors.border,
},
saveButton: {
  backgroundColor: Colors.primary,
},
disabledButton: {
  opacity: 0.5,
},
cancelButtonText: {
  color: Colors.text,
  fontSize: 12,
  fontWeight: '600',
},
saveButtonText: {
  color: 'white',
  fontSize: 12,
  fontWeight: '600',
},

// Tasks Section
tasksSection: {
  marginTop: 16,
  marginBottom: 80, // Extra space for floating button
},
tasksHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  gap: 12,
},
tasksTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: Colors.text,
  flex: 1,
},
tasksCount: {
  fontSize: 14,
  color: Colors.muted,
  backgroundColor: Colors.border,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 10,
},
tasksList: {
  gap: 8,
},
taskItem: {
  backgroundColor: Colors.card,
  borderRadius: 12,
  padding: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: Colors.border,
},
taskContent: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  gap: 12,
},
taskCheckbox: {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: Colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
},
checkboxCircle: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: Colors.primary,
},
taskDetails: {
  flex: 1,
},
taskName: {
  fontSize: 16,
  color: Colors.text,
  marginBottom: 4,
},
taskDeadline: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
taskDeadlineText: {
  fontSize: 12,
  color: Colors.muted,
},
taskCompleteButton: {
  padding: 8,
},

// Context Menu
contextMenuOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
},
contextMenu: {
  backgroundColor: Colors.card,
  borderRadius: 20,
  padding: 20,
  width: width - 60,
},
contextMenuHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: Colors.border,
},
contextMenuTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: Colors.text,
  flex: 1,
  marginRight: 16,
},
contextMenuActions: {
  gap: 12,
},
contextMenuButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  borderRadius: 12,
  backgroundColor: Colors.background,
},
contextMenuButtonText: {
  fontSize: 16,
  color: Colors.text,
  fontWeight: '500',
  flex: 1,
},
  saveQuickNoteButton: {
    padding: 4,
  },
  quickNoteTitleInput: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickNoteContentInput: {
    fontSize: 12,
    color: Colors.text,
    minHeight: 60,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  quickNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 10,
    color: Colors.text,
  },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 1,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
  },
  // Notes List Styles
  notesList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  notesCount: {
    fontSize: 14,
    color: Colors.muted,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  // Note Card Styles
  noteCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinnedNoteCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  noteTitleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteContentInput: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 80,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.muted,
  },
  noteDate: {
    fontSize: 12,
    color: Colors.muted,
  },
  // Empty States
  emptyNotes: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyNotesText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
  },
  // Marks Tab Styles
  marksSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  marksSummaryItem: {
    alignItems: 'center',
  },
  marksSummaryLabel: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 4,
  },
  marksSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  addMarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
  },
  addMarkButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    borderRadius: 30
  },
  marksList: {
    flex: 1,
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
  emptyMarksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMarksText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
  },
  markCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  markMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markDate: {
    fontSize: 12,
    color: Colors.muted,
  },
  markScore: {
    alignItems: 'flex-end',
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
  // Tasks Tab Styles
  courseInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  section: {
  marginBottom: 20,
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
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyTasks: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTasksText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    width: width - 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalForm: {
    gap: 16,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  scoreInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreDivider: {
    fontSize: 20,
    color: Colors.muted,
    marginHorizontal: 8,
  },
  modalSubmit: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Error State
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
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});