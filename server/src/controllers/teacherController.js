// Logically grouped Teacher APIs mapped from existing legacy modules

export {
  listInstructors as getAllTeachers,
  createInstructor as createTeacher,
  deleteUser as deleteTeacher
} from './adminController.js';

export {
  getInstructorAssessments
} from './assessmentController.js';
