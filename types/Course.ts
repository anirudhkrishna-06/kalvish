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
}

export interface Course {
  id: string;
  name: string;
  facultyName: string;
  courseCode?: string;
  color: CourseColor;
  currentUnit: string;
  previousClassTopic: string;
  notes: string;
  marks: Mark[];
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[]; // <-- new property

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