import React, { useEffect } from 'react';
import { Target, Users, Globe, BookOpen, CheckCircle, Award, Briefcase, Zap } from 'lucide-react';

const AboutUs = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl opacity-30"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-bold tracking-wide uppercase mb-6 backdrop-blur-sm">
                        Our Story
                    </span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
                        Revolutionizing <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Tech Education</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        We are on a mission to bridge the gap between academic learning and industry demands.
                        Building the workforce of tomorrow, today.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-12 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200/50">
                        <div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">10k+</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Students Trained</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">95%</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Placement Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">50+</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Hiring Partners</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">4.9/5</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Student Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                                <Target className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                To democratize access to high-quality technology education. We believe that talent is universal, but opportunity is not.
                                We exist to provide that opportunity through affordable, world-class training programs.
                            </p>
                        </div>
                        <div>
                            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">The Vision</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                A world where anyone with the drive to learn can build a successful career in technology, regardless of their background or location.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 transform rotate-3 rounded-3xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000"
                            alt="Mission"
                            className="relative rounded-3xl shadow-2xl z-10"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Why We Art Different</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Most platforms just give you videos. We give you a career.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Briefcase className="h-8 w-8 text-emerald-400" />,
                                title: "Project-Based Learning",
                                desc: "No more boring theory. You'll build real-world applications from day one, creating a portfolio that gets you hired."
                            },
                            {
                                icon: <Users className="h-8 w-8 text-blue-400" />,
                                title: "1-on-1 Mentorship",
                                desc: "Get stuck? Our mentors are available 24/7 to help you debug code, review your projects, and keep you motivated."
                            },
                            {
                                icon: <Award className="h-8 w-8 text-purple-400" />,
                                title: "Career Services",
                                desc: "We don't stop at teaching. We help with resume building, mock interviews, and direct referrals to our hiring partners."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                                <div className="mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-display">Meet The Team</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">The passionate educators and engineers behind the platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <div className="h-48 bg-slate-200 overflow-hidden relative">
                                    <img
                                        src={`https://images.unsplash.com/photo-${i === 1 ? '1560250097-0b93528c311a' : i === 2 ? '1573496359142-b8d87734a5a2' : '1472099645785-5658abf4ff4e'}?auto=format&fit=crop&q=80&w=800`}
                                        alt="Team Member"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                                        {i === 1 ? 'David Chen' : i === 2 ? 'Sarah Jenkins' : 'Michael Ross'}
                                    </h3>
                                    <p className="text-sm text-primary font-medium mb-3">
                                        {i === 1 ? 'Founder & CEO' : i === 2 ? 'Head of Curriculum' : 'CTO'}
                                    </p>
                                    <p className="text-slate-500 text-sm">
                                        Former {i === 1 ? 'Google' : i === 2 ? 'Netflix' : 'Amazon'} engineer with a passion for teaching.
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="md:col-span-3 text-center mt-12">
                            <button className="px-8 py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-full hover:bg-slate-900 hover:text-white transition-all">
                                Join Our Team
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
