import React, { useEffect, useState } from 'react';
import { getMyCoursesApi, updateCourseApi, getCourseStudentsApi } from '../../api/courseApi';
import {
  BookOpen, Calendar, Users, FileText, Edit, Plus, Trash2, Save, X, ChevronLeft, Video, File
} from 'lucide-react';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'manage'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'schedule', 'content', 'students'
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getMyCoursesApi();
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageClick = (course) => {
    setSelectedCourse(course);
    setViewMode('manage');
    setActiveTab('details');
    setStudents([]);
    setMessage('');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedCourse(null);
    fetchCourses(); // Refresh list to show any updates
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading courses...</div>;

  return (
    <div className="space-y-6">
      {viewMode === 'list' ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
              <p className="text-slate-500">Manage your course content, schedules, and students.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                You haven't created any courses yet.
              </div>
            ) : (
              courses.map(course => (
                <div key={course._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${course.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 truncate" title={course.title}>{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.studentCount || 0} Students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{course.schedule?.length || 0} Sessions</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleManageClick(course)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Manage Course
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <CourseManager
          course={selectedCourse}
          onBack={handleBack}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          students={students}
          setStudents={setStudents}
        />
      )}
    </div>
  );
};

const CourseManager = ({ course, onBack, activeTab, setActiveTab, students, setStudents }) => {
  const [formData, setFormData] = useState({ ...course });
  const [notification, setNotification] = useState({ type: '', msg: '' });
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (activeTab === 'students' && students.length === 0) {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await getCourseStudentsApi(course._id);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCourseApi(course._id, formData);
      setNotification({ type: 'success', msg: 'Course updated successfully!' });
      setTimeout(() => setNotification({ type: '', msg: '' }), 3000);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', msg: 'Failed to update course.' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Schedule Management helpers
  const handleScheduleChange = (idx, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[idx] = { ...newSchedule[idx], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const addSession = () => {
    setFormData({
      ...formData,
      schedule: [...(formData.schedule || []), { date: '', startTime: '', endTime: '', topic: '' }]
    });
  };

  const removeSession = (idx) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== idx);
    setFormData({ ...formData, schedule: newSchedule });
  };

  // Content Management helpers
  const handleMaterialChange = (idx, field, value) => {
    const newMaterials = [...formData.materials];
    newMaterials[idx] = { ...newMaterials[idx], [field]: value };
    setFormData({ ...formData, materials: newMaterials });
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materials: [...(formData.materials || []), { title: '', type: 'video', url: '' }]
    });
  };

  const removeMaterial = (idx) => {
    const newMaterials = formData.materials.filter((_, i) => i !== idx);
    setFormData({ ...formData, materials: newMaterials });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{formData.title}</h2>
            <p className="text-xs text-slate-500">Managing Course Content & Enrollees</p>
          </div>
        </div>
        <div className="flex gap-2">
          {notification.msg && (
            <div className={`px-3 py-1 text-xs rounded font-medium ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {notification.msg}
            </div>
          )}
          {(activeTab !== 'students') && (
            <button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        {[
          { id: 'details', label: 'Details', icon: FileText },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'students', label: 'Students', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full text-sm border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full text-sm border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input name="category" value={formData.category} onChange={handleChange} className="w-full text-sm border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full text-sm border-slate-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate ? formData.startDate.split('T')[0] : ''} onChange={handleChange} className="w-full text-sm border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input type="date" name="endDate" value={formData.endDate ? formData.endDate.split('T')[0] : ''} onChange={handleChange} className="w-full text-sm border-slate-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Class Sessions</h3>
              <button onClick={addSession} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Session
              </button>
            </div>
            <div className="space-y-3">
              {(formData.schedule || []).map((session, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 group">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                    <input
                      type="date"
                      value={session.date ? session.date.split('T')[0] : ''}
                      onChange={(e) => handleScheduleChange(idx, 'date', e.target.value)}
                      className="text-sm border-slate-300 rounded px-2 py-1"
                      placeholder="Date"
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                        className="w-full text-sm border-slate-300 rounded px-2 py-1"
                      />
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                        className="w-full text-sm border-slate-300 rounded px-2 py-1"
                      />
                    </div>
                    <input
                      type="text"
                      value={session.topic}
                      onChange={(e) => handleScheduleChange(idx, 'topic', e.target.value)}
                      className="w-full text-sm border-slate-300 rounded px-2 py-1 col-span-1 md:col-span-2"
                      placeholder="Session Topic"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => removeSession(idx)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {(!formData.schedule || formData.schedule.length === 0) && (
                <p className="text-center text-sm text-slate-400 py-8">No sessions scheduled.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Course Materials</h3>
              <button onClick={addMaterial} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Material
              </button>
            </div>
            <div className="space-y-3">
              {(formData.materials || []).map((material, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-4">
                  <div className="pt-2">
                    {material.type === 'video' ? <Video className="w-5 h-5 text-indigo-500" /> : <File className="w-5 h-5 text-orange-500" />}
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={material.title}
                        onChange={(e) => handleMaterialChange(idx, 'title', e.target.value)}
                        className="flex-1 text-sm border-slate-300 rounded px-2 py-1 font-medium"
                        placeholder="Material Title"
                      />
                      <select
                        value={material.type}
                        onChange={(e) => handleMaterialChange(idx, 'type', e.target.value)}
                        className="text-sm border-slate-300 rounded px-2 py-1 w-24"
                      >
                        <option value="video">Video</option>
                        <option value="document">PDF/Doc</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={material.url}
                      onChange={(e) => handleMaterialChange(idx, 'url', e.target.value)}
                      className="w-full text-xs text-slate-500 border-slate-200 bg-white rounded px-2 py-1"
                      placeholder="Resource URL (e.g. https://...)"
                    />
                  </div>
                  <button onClick={() => removeMaterial(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.materials || formData.materials.length === 0) && (
                <p className="text-center text-sm text-slate-400 py-8">No materials added.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Enrolled Students ({students.length})</h3>
            {loadingStudents ? (
              <p className="text-sm text-slate-400">Loading students...</p>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{enrollment.student?.name}</td>
                        <td className="px-4 py-3 text-slate-500">{enrollment.student?.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${enrollment.progress?.percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500">{enrollment.progress?.percentage || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${enrollment.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 text-xs">
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                          No active students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCourses;


