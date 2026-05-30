import React from 'react';
import { Calendar, Clock, User, ArrowRight, Play, Video } from 'lucide-react';

const sessions = [
    {
        id: 1,
        title: "Mastering React Hooks",
        instructor: "Sarah Jenkins",
        role: "Senior Frontend Dev at Google",
        time: "10:00 AM - 11:30 AM",
        status: "Live Now",
        attendees: 342,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 2,
        title: "Advanced System Design Patterns",
        instructor: "David Chen",
        role: "Principal Architect at Amazon",
        time: "02:00 PM - 03:30 PM",
        status: "Upcoming",
        attendees: 156,
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 3,
        title: "Intro to Python for Data Science",
        instructor: "Emily Zhang",
        role: "Data Scientist at Netflix",
        time: "05:00 PM - 06:30 PM",
        status: "Upcoming",
        attendees: 89,
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
    }
];

const LiveClasses = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Live Sessions</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 font-display">Interactive Classes</h1>
                    </div>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                        View Full Schedule
                    </button>
                </div>

                {/* Featured Live Session */}
                <div className="bg-slate-900 rounded-3xl p-1 overflow-hidden shadow-2xl mb-12">
                    <div className="relative bg-slate-800 rounded-[22px] overflow-hidden">
                        <div className="absolute inset-0 opacity-40">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wide mb-4">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    Happening Now
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">Mastering React Hooks & Performance</h2>
                                <p className="text-slate-300 text-lg mb-8 max-w-xl">Join Sarah Jenkins live as she breaks down complex hooks patterns and performance optimization techniques for large scale apps.</p>

                                <div className="flex flex-wrap gap-6 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full border-2 border-slate-700 overflow-hidden">
                                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Sarah" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                                            <p className="text-slate-400 text-xs">Senior Dev @ Google</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-[1px] bg-slate-700 hidden sm:block"></div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <User className="h-5 w-5 text-emerald-400" />
                                        <span className="font-medium">342 Watching</span>
                                    </div>
                                </div>

                                <button className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                                    <Play className="h-5 w-5 fill-current" />
                                    Join Class Now
                                </button>
                            </div>

                            {/* Video Preview Placeholer */}
                            <div className="hidden md:flex w-full md:w-1/3 aspect-video bg-black/50 rounded-xl border border-slate-700/50 items-center justify-center relative group cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')" }}></div>
                                <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform z-10">
                                    <Play className="h-6 w-6 text-white ml-1 fill-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Sessions List */}
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Coming Up Today</h3>
                <div className="space-y-4">
                    {sessions.slice(1).map(session => (
                        <div key={session.id} className="group bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex-shrink-0 w-full sm:w-16 text-center sm:text-left">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Starts</div>
                                <div className="text-lg font-bold text-slate-900">{session.time.split('-')[0].trim()}</div>
                            </div>

                            <div className="h-12 w-1 bg-slate-100 hidden sm:block rounded-full"></div>

                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{session.title}</h4>
                                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" /> {session.instructor}
                                    </span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{session.role}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i * 5})` }}></div>
                                    ))}
                                </div>
                                <button className="ml-4 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default LiveClasses;
