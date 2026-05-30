import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseApi, getCourseContentApi } from '../../api/courseApi.js';
import { BookOpen, FileText, Calendar, Video, Download, CheckCircle } from 'lucide-react';

const CourseContent = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, contentRes] = await Promise.all([
                    getCourseApi(courseId),
                    getCourseContentApi(courseId)
                ]);
                setCourse(courseRes.data);
                setContent(contentRes.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Access denied or course not found');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    if (loading) return <div className="p-8 text-center text-slate-500 italic">Unlocking your learning path...</div>;
    if (error) return (
        <div className="p-8 text-center">
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 max-w-md mx-auto">
                {error}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BookOpen size={160} />
                </div>
                <div className="relative z-10">
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 px-3 py-1 bg-indigo-50 w-fit rounded-full">
                        In Progress
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{course?.title}</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">{course?.description}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="text-indigo-600" />
                            Course Materials
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {content?.materials?.map((material, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition-all flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        {material.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">{material.title}</h3>
                                        <p className="text-xs text-slate-400 capitalize">{material.type}</p>
                                    </div>
                                    <a
                                        href={material.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        <Download size={18} />
                                    </a>
                                </div>
                            ))}
                            {(!content?.materials || content.materials.length === 0) && (
                                <div className="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    No materials uploaded for this course yet.
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-indigo-600" />
                            Learning Milestones
                        </h2>
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Topic & Curriculm</span>
                                <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-white rounded-lg shadow-sm">0% Completed</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {course?.schedule?.map((s, i) => (
                                    <div key={i} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center text-xs font-bold text-slate-300">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-700">{s.topic}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(s.date).toLocaleDateString()}
                                            </div>
                                            <div className="px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase tracking-tighter">
                                                {s.startTime} - {s.endTime}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                        <h3 className="text-lg font-bold mb-4">Course Progress</h3>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-400 w-0 transition-all duration-1000"></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>0% Lessons Completed</span>
                                <span>0/12 Lessons</span>
                            </div>
                            <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-2xl hover:bg-sky-50 transition-all text-sm">
                                Start Learning
                            </button>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-900 mb-2">Need Help?</h3>
                        <p className="text-xs text-indigo-700/70 leading-relaxed mb-4">
                            If you encounter any issues with the materials or schedules, contact the course instructor.
                        </p>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                            Message Instructor →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseContent;
