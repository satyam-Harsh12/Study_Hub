// Logically grouped Student APIs mapped from existing legacy modules

export {
  listStudentsWithEnrollments as getAllStudents,
  deleteUser as deleteStudent
} from './adminController.js';

export {
  getStudentAttendanceStats
} from './attendanceController.js';

export {
  getAssessmentSubmissions,
  submitAssessment
} from './assessmentController.js';
