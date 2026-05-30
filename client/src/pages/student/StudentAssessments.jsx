import React, { useEffect, useMemo, useState } from 'react';
import { getMyAssessmentsApi, submitAssessmentApi } from '../../api/assessmentApi.js'; // Ensure submitAssessmentApi is exported
import { FileText, CheckCircle, Clock } from 'lucide-react';

const StudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getMyAssessmentsApi();
      setAssessments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = useMemo(() => {
    const upcoming = [];
    const past = [];

    assessments.forEach(a => {
      // Map new structure to UI friendly format
      const isSubmitted = a.submission && a.submission.status !== 'upcoming';
      const item = {
        ...a,
        status: a.submission ? a.submission.status : 'upcoming',
        obtainedScore: a.submission ? a.submission.obtainedMarks : null
      };

      if (!isSubmitted) upcoming.push(item);
      else past.push(item);
    });

    return { upcoming, past };
  }, [assessments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submittingId) return;

    try {
      await submitAssessmentApi(submittingId, { content: submissionText });
      setSubmittingId(null);
      setSubmissionText('');
      load(); // Reload to show in past
      alert('Assessment submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit.');
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">Assessments</h2>
      <p className="mb-3 text-sm text-slate-500">
        View upcoming quizzes, assignments, and your evaluation results.
      </p>

      {loading && <p className="text-xs text-slate-500">Loading...</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Upcoming / To Do
          </h3>
          {calculateStats.upcoming.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No pending assessments.</p>
          ) : (
            calculateStats.upcoming.map(a => (
              <div key={a._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{a.type}</span>
                  <span className="text-xs text-slate-500">{new Date(a.dueDate).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{a.course?.title}</p>

                <button
                  onClick={() => setSubmittingId(a._id)}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded transition-colors"
                >
                  Take {a.type === 'quiz' ? 'Quiz' : 'Assignment'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Past */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Completed
          </h3>
          {calculateStats.past.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No completed assessments.</p>
          ) : (
            calculateStats.past.map(a => (
              <div key={a._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-sm line-through decoration-slate-400">{a.title}</h4>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded ${a.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {a.status}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{a.course?.title}</span>
                  {a.obtainedScore !== undefined && a.obtainedScore !== null ? (
                    <span className="font-bold text-slate-900">{a.obtainedScore} / {a.maxScore}</span>
                  ) : (
                    <span>Pending Grade</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {submittingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Submit Assignment</h3>
            <p className="text-xs text-slate-500 mb-4">Provide your answer text or upload a project file / repository link.</p>
            <textarea
              className="w-full border-slate-300 rounded-lg text-sm mb-3"
              rows="5"
              placeholder="Type your answer, analysis, or project reflection..."
              value={submissionText}
              onChange={e => setSubmissionText(e.target.value)}
            ></textarea>
            
            <div className="mb-5 border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors">
               <FileText className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
               <p className="text-xs font-semibold text-slate-600">Click to upload your assignment file</p>
               <p className="text-[10px] text-slate-400">(PDF, DOCX, ZIP up to 10MB)</p>
            </div>
            
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
              <button onClick={() => setSubmittingId(null)} className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition-colors">Submit Work</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssessments;


