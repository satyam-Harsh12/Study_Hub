import React, { useEffect, useState } from 'react';
import { getAdminCourses, updateCourseSchedule, getAdminInstructors } from '../../api/adminApi.js';
import { Calendar, Clock, User, Save, X } from 'lucide-react';

const AdminSchedule = () => {
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('week'); // 'week', 'all'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [coursesRes, instructorsRes] = await Promise.all([
                getAdminCourses(),
                getAdminInstructors()
            ]);
            setCourses(coursesRes.data || []);
            setInstructors(instructorsRes.data || []);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = (e) => {
        const courseId = e.target.value;
        setSelectedCourseId(courseId);
        if (courseId) {
            const course = courses.find(c => c._id === courseId);
            // Ensure schedule items have an instructor field, default to course instructor if not present?
            // Actually backend populates it if it exists.
            // If we are editing, we want to allow setting it.
            setSchedule(course?.schedule || []);
        } else {
            setSchedule([]);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index] = {
            ...newSchedule[index],
            [field]: value
        };
        setSchedule(newSchedule);
    };

    const handleSave = async () => {
        if (!selectedCourseId) return;
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Prepare payload: we need to send just IDs for instructors
            const payload = schedule.map(item => ({
                ...item,
                instructor: item.instructor?._id || item.instructor // Handle if it's an object or ID
            }));

            await updateCourseSchedule(selectedCourseId, payload);
            setMessage({ type: 'success', text: 'Schedule updated successfully' });

            // Refresh course data
            const coursesRes = await getAdminCourses();
            setCourses(coursesRes.data || []);

            // Re-select current course to update view
            const updatedCourse = coursesRes.data.find(c => c._id === selectedCourseId);
            setSchedule(updatedCourse?.schedule || []);

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to save schedule' });
        } finally {
            setSaving(false);
        }
    };

    const getInstructorName = (id) => {
        if (!id) return 'Default (Course Instructor)';
        // id could be an object if populated, or string if just set
        const idStr = typeof id === 'object' ? id._id : id;
        const inst = instructors.find(i => i._id === idStr);
        return inst ? inst.name : 'Unknown';
    };

    const selectedCourse = courses.find(c => c._id === selectedCourseId);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">Manage Schedule</h2>
                <p className="text-sm text-slate-500">
                    Assign substitute instructors to specific schedule slots.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course / Batch</label>
                <select
                    value={selectedCourseId}
                    onChange={handleCourseSelect}
                    className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">-- Select a course --</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>
                            {course.title} ({course.category})
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourseId && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Schedule Entries
                            </h3>
                            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                                <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-900 text-white">
                                    Weekly View
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">
                            Default Instructor: <span className="font-medium text-slate-900">{selectedCourse?.instructor?.name}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {schedule.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No schedule entries found for this course.
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Topic</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Instructor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {schedule
                                        .filter(item => {
                                            const itemDate = new Date(item.date);
                                            itemDate.setHours(0, 0, 0, 0);
                                            const now = new Date();
                                            now.setHours(0, 0, 0, 0);
                                            const weekEnd = new Date(now);
                                            weekEnd.setDate(now.getDate() + 7);
                                            return itemDate >= now && itemDate <= weekEnd;
                                        })
                                        .map((item, index) => {
                                            // Helper to safely get the current assigned ID
                                            const actualIndex = schedule.indexOf(item);
                                            const currentInstId = item.instructor?._id || item.instructor || '';

                                            return (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                        <input
                                                            type="date"
                                                            value={new Date(item.date).toISOString().split('T')[0]}
                                                            onChange={(e) => handleFieldChange(actualIndex, 'date', e.target.value)}
                                                            className="block w-full text-xs border-slate-300 rounded mb-1"
                                                        />
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="text"
                                                                value={item.startTime}
                                                                onChange={(e) => handleFieldChange(actualIndex, 'startTime', e.target.value)}
                                                                className="w-20 text-[10px] border-slate-300 rounded"
                                                                placeholder="9:00 AM"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.endTime}
                                                                onChange={(e) => handleFieldChange(actualIndex, 'endTime', e.target.value)}
                                                                className="w-20 text-[10px] border-slate-300 rounded"
                                                                placeholder="10:00 AM"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        <textarea
                                                            value={item.topic}
                                                            onChange={(e) => handleFieldChange(actualIndex, 'topic', e.target.value)}
                                                            className="w-full text-xs border-slate-300 rounded min-h-[40px]"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <select
                                                            value={currentInstId}
                                                            onChange={(e) => handleFieldChange(actualIndex, 'instructor', e.target.value)}
                                                            className={`rounded-md border text-xs py-1 px-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full ${currentInstId ? 'bg-amber-50 border-amber-200 text-amber-800' : 'border-slate-300'}`}
                                                        >
                                                            <option value="">Default ({selectedCourse?.instructor?.name})</option>
                                                            {instructors.map(inst => (
                                                                <option key={inst._id} value={inst._id}>
                                                                    {inst.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {currentInstId && (
                                                            <button
                                                                onClick={() => handleFieldChange(actualIndex, 'instructor', '')}
                                                                className="text-[10px] text-red-600 hover:text-red-800 hover:underline"
                                                            >
                                                                Reset Instructor
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div>
                            {message.text && (
                                <span className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {message.text}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || schedule.length === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchedule;
