import React, { useState } from 'react';
import { Star, MessageCircle, Calendar, Clock, ArrowRight, Briefcase } from 'lucide-react';

const mentors = [
    {
        id: 1,
        name: "James Wilson",
        role: "Senior Engineer @ Tesla",
        expertise: ["System Design", "Backend", "Python"],
        rating: 4.9,
        reviews: 124,
        hourlyRate: "$150",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        available: true
    },
    {
        id: 2,
        name: "Alice Chen",
        role: "Product Manager @ Airbnb",
        expertise: ["Product Strategy", "UX Research", "Agile"],
        rating: 5.0,
        reviews: 89,
        hourlyRate: "$180",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
        available: false
    },
    {
        id: 3,
        name: "Robert Fox",
        role: "Staff Engineer @ Netflix",
        expertise: ["Microservices", "Java", "Cloud Arch"],
        rating: 4.8,
        reviews: 210,
        hourlyRate: "$200",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
        available: true
    },
    {
        id: 4,
        name: "Elena Rodriguez",
        role: "Design Lead @ Spotify",
        expertise: ["UI Design", "Figma", "Design Systems"],
        rating: 4.9,
        reviews: 156,
        hourlyRate: "$140",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        available: true
    }
];

const Mentorship = () => {
    const [selectedExpertise, setSelectedExpertise] = useState('All');

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-700 text-sm font-bold tracking-wide uppercase mb-4">
                        1-on-1 Guidance
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
                        Find Your Perfect Mentor
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Connect with industry experts who have walked the path you're on. Get personalized advice, code reviews, and career counseling.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {['All', 'Backend', 'Frontend', 'Design', 'Product', 'Leadership'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedExpertise(tag)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedExpertise === tag
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Mentors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mentors.map((mentor) => (
                        <div key={mentor.id} className="group relative bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">

                            {/* Avaialbility Badge */}
                            <div className="absolute top-6 right-6">
                                <span className={`flex h-3 w-3 rounded-full ${mentor.available ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="h-24 w-24 rounded-full p-1 bg-gradient-to-tr from-purple-400 to-blue-500">
                                        <img
                                            src={mentor.image}
                                            alt={mentor.name}
                                            className="h-full w-full rounded-full object-cover border-2 border-white"
                                        />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white shadow-md border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                        <span className="text-xs font-bold text-slate-700">{mentor.rating}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-1">{mentor.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{mentor.role}</span>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    {mentor.expertise.map(exp => (
                                        <span key={exp} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-md border border-slate-100">
                                            {exp}
                                        </span>
                                    ))}
                                </div>

                                <div className="w-full mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Rate</p>
                                        <p className="text-lg font-bold text-slate-900">{mentor.hourlyRate}<span className="text-xs text-slate-400 font-normal">/hr</span></p>
                                    </div>
                                    <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-primary transition-colors flex items-center gap-2">
                                        Book <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="mt-24 bg-slate-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">How Mentorship Works</h2>
                        <div className="grid md:grid-cols-3 gap-8 text-left mt-12">
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                                <div className="h-10 w-10 text-white bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl mb-4">1</div>
                                <h4 className="font-bold text-lg mb-2">Find a Mentor</h4>
                                <p className="text-slate-300 text-sm">Browse profiles and filter by expertise to find the perfect match for your goals.</p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                                <div className="h-10 w-10 text-white bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl mb-4">2</div>
                                <h4 className="font-bold text-lg mb-2">Book a Session</h4>
                                <p className="text-slate-300 text-sm">Choose a time that works for you and secure your slot instantly.</p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                                <div className="h-10 w-10 text-white bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl mb-4">3</div>
                                <h4 className="font-bold text-lg mb-2">Level Up</h4>
                                <p className="text-slate-300 text-sm">Get actionable feedback and guidance to accelerate your career growth.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Mentorship;
