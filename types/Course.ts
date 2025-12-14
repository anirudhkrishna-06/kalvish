export type CourseColor = string;

export interface Mark {
  id: string;
  examName: string;
  score: number;
  maxScore?: number;
  date?: Date;
}

export interface Task {
  id: string;
  name: string;
  deadline?: Date;
  createdAt?: Date; // Add this line
  priority?: 'low' | 'medium' | 'high'; // Optional: add priority if needed
  completed?: boolean; // Optional: add completed status
}

export interface Course {
  id: string;
  name: string;
  facultyName: string;
  courseCode?: string;
  color: CourseColor;
  currentUnit: string;
  previousClassTopic: string;
  marks: Mark[];
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  notes?: Note[];
 // <-- new property

}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface CourseFormData {
  name: string;
  facultyName: string;
  courseCode?: string;
  color: string;
}

export interface MarkFormData {
  examName: string;
  score: string;
  maxScore?: string;
}