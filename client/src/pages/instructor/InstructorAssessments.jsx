import React, { useEffect, useState } from 'react';
import {
  getInstructorAssessmentsApi,
  createAssessmentApi,
  getAssessmentSubmissionsApi,
  gradeSubmissionApi
} from '../../api/assessmentApi';
import { getMyCoursesApi } from '../../api/courseApi';
import {
  Plus, FileText, CheckCircle, Clock, Search, ChevronLeft, Save, Trash2, Award, User, X
} from 'lucide-react';

const InstructorAssessments = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'grading'
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assRes, courseRes] = await Promise.all([
        getInstructorAssessmentsApi(),
        getMyCoursesApi()
      ]);
      setAssessments(assRes.data);
      setCourses(courseRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createAssessmentApi(data);
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create assessment');
    }
  };

  const handleViewSubmissions = async (assessment) => {
    setSelectedAssessment(assessment);
    setLoading(true);
    try {
      const res = await getAssessmentSubmissionsApi(assessment._id);
      setSubmissions(res.data);
      setViewMode('grading');
    } catch (err) {
      console.error(err);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId, marks, feedback) => {
    try {
      await gradeSubmissionApi(submissionId, { marks, feedback });
      // Update local state
      setSubmissions(prev => prev.map(s =>
        s._id === submissionId ? { ...s, obtainedMarks: marks, feedback, status: 'graded' } : s
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to submit grade');
    }
  };

  if (loading && viewMode === 'list') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {viewMode === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
              <p className="text-slate-500">Manage quizzes, assignments, and grades.</p>
            </div>
            <button
              onClick={() => setViewMode('create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                No assessments created yet.
              </div>
            ) : (
              assessments.map(ass => (
                <div key={ass._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => handleViewSubmissions(ass)}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${ass.type === 'quiz' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {ass.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(ass.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{ass.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{ass.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="font-medium text-slate-700">{ass.course?.title}</span>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>View Submissions</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {viewMode === 'create' && (
        <CreateAssessmentForm
          courses={courses}
          onCancel={() => setViewMode('list')}
          onSubmit={handleCreate}
        />
      )}

      {viewMode === 'grading' && (
        <GradingView
          assessment={selectedAssessment}
          submissions={submissions}
          onBack={() => setViewMode('list')}
          onGrade={handleGrade}
        />
      )}
    </div>
  );
};

// Sub-component: Create Form
const CreateAssessmentForm = ({ courses, onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    type: 'assignment',
    description: '',
    fileUrl: '',
    dueDate: '',
    maxScore: 100,
    questions: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const updateQuestion = (idx, field, value) => {
    const newQuestions = [...form.questions];
    newQuestions[idx][field] = value;
    setForm({ ...form, questions: newQuestions });
  };

  const updateOption = (qIdx, oIdx, value) => {
    const newQuestions = [...form.questions];
    newQuestions[qIdx].options[oIdx] = value;
    setForm({ ...form, questions: newQuestions });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-bold text-slate-800">Create New Assessment</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
            <select
              required
              className="w-full text-sm border-slate-300 rounded-lg py-2"
              value={form.courseId}
              onChange={e => setForm({ ...form, courseId: e.target.value })}
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Type</label>
            <select
              className="w-full text-sm border-slate-300 rounded-lg py-2"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            required
            type="text"
            className="w-full text-sm border-slate-300 rounded-lg py-2"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Midterm Project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
          <textarea
            className="w-full text-sm border-slate-300 rounded-lg py-2"
            rows="3"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Provide guidelines for the students..."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Attachment Link / Resource File (Optional)</label>
          <input
            type="url"
            className="w-full text-sm border-slate-300 rounded-lg py-2"
            value={form.fileUrl}
            onChange={e => setForm({ ...form, fileUrl: e.target.value })}
            placeholder="e.g., https://drive.google.com/... (Reference File)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input
              required
              type="date"
              className="w-full text-sm border-slate-300 rounded-lg py-2"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Marks</label>
            <input
              type="number"
              className="w-full text-sm border-slate-300 rounded-lg py-2"
              value={form.maxScore}
              onChange={e => setForm({ ...form, maxScore: e.target.value })}
            />
          </div>
        </div>

        {form.type === 'quiz' && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">Questions ({form.questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Question
              </button>
            </div>

            <div className="space-y-6">
              {form.questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Question {idx + 1}</label>
                    <input
                      type="text"
                      className="w-full text-sm border-slate-300 rounded mt-1"
                      placeholder="Enter question text..."
                      value={q.question}
                      onChange={e => updateQuestion(idx, 'question', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctAnswer === oIdx}
                          onChange={() => updateQuestion(idx, 'correctAnswer', oIdx)}
                        />
                        <input
                          type="text"
                          className="flex-1 text-xs border-slate-300 rounded"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={e => updateOption(idx, oIdx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm text-white bg-slate-900 font-medium rounded-lg hover:bg-slate-800"
          >
            Create Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

// Sub-component: Grading View
const GradingView = ({ assessment, submissions, onBack, onGrade }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[600px] flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{assessment.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="capitalize">{assessment.type}</span>
              <span>•</span>
              <span>Total Marks: {assessment.maxScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Student Submissions ({submissions.length})</h3>

        {submissions.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <SubmissionCard
                key={sub._id}
                submission={sub}
                maxScore={assessment.maxScore}
                onGrade={onGrade}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SubmissionCard = ({ submission, maxScore, onGrade }) => {
  const [marks, setMarks] = useState(submission.obtainedMarks || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isEditing, setIsEditing] = useState(!submission.status || submission.status === 'submitted');

  const handleSave = () => {
    onGrade(submission._id, marks, feedback);
    setIsEditing(false);
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-slate-800 text-sm">{submission.student?.name}</div>
          <div className="text-xs text-slate-500">{submission.student?.email}</div>
          <div className="text-xs text-slate-400 mt-1">
            Submitted: {new Date(submission.createdAt).toLocaleString()}
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-bold rounded uppercase ${submission.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
          {submission.status}
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 mb-4 whitespace-pre-wrap font-mono text-xs">
        {submission.content || 'No text content.'}
        {/* If it was a quiz, we would show answers here */}
        {submission.answers && submission.answers.length > 0 && (
          <div className="mt-2 text-indigo-600">
            Student answered {submission.answers.length} quiz questions.
            {/* Quiz grading automation logic would go here ideally */}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-end gap-3 bg-white p-3 border border-slate-100 rounded-lg shadow-sm">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Feedback</label>
            <input
              type="text"
              className="w-full text-xs border-slate-300 rounded"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Enter feedback..."
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-bold text-slate-500 mb-1">Marks (/{maxScore})</label>
            <input
              type="number"
              className="w-full text-xs border-slate-300 rounded font-bold text-center"
              value={marks}
              onChange={e => setMarks(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" /> Save
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
          <div className="text-sm">
            <span className="font-bold text-slate-900">Grade: {submission.obtainedMarks}/{maxScore}</span>
            {submission.feedback && <span className="text-slate-500 ml-2">"{submission.feedback}"</span>}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            Edit Grade
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructorAssessments;


