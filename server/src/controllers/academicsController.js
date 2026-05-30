// Logically grouped Academic/Content APIs mapped from existing legacy modules
export * from './courseController.js';

export { 
  listCoursesAdmin, 
  createCourseAdmin, 
  updateCourseSchedule, 
  deleteCourse, 
  toggleCourseStatus 
} from './adminController.js';

export {
  createAssessment,
  getCourseAssessments,
  gradeSubmission
} from './assessmentController.js';
