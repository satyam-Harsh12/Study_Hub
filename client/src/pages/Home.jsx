import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getSiteConfig } from '../api/siteApi.js';
import { ArrowRight, Star, Globe, Shield, Award, Users, CheckCircle, BookOpen, GraduationCap, MonitorPlay, Video, MessageCircle, AlertTriangle } from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [demoOpen, setDemoOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Courses');

    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await getSiteConfig();
                setConfig(res.data);
            } catch (err) {
                console.error("Failed to load site config", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const maintenanceMode = config?.maintenanceMode || false;
    const heroTitle = config?.hero?.title || (
        <>Unlock Your Potential with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">
                Modern Education
            </span></>
    );
    const heroSubtitle = config?.hero?.subtitle || "Master industry-relevant skills with our project-based learning path. Get certified, get hired, and join a community of 10,000+ achievers.";
    const badgeText = config?.hero?.badgeText || "v2.0 Now Live - Join the future of learning";

    const showLiveClasses = config?.features?.showLiveClasses ?? true;
    const showMentorship = config?.features?.showMentorship ?? true;
    const showResources = config?.features?.showResources ?? true;

    if (maintenanceMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
                <h1 className="text-3xl font-bold text-slate-900">Under Maintenance</h1>
                <p className="text-slate-600">We are currently upgrading our platform. Please check back later.</p>
            </div>
        );
    }

    const sections = {
        'Courses': {
            label: 'Skill Courses',
            description: 'Master in-demand skills for the modern industry.',
            icon: <MonitorPlay className="w-5 h-5" />,
            domains: [
                { name: 'Web Development', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600', tags: ['Frontend', 'Backend', 'Full Stack'] },
                { name: 'Data Science & AI', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600', tags: ['Python', 'ML', 'Analytics'] },
                { name: 'UI/UX Design', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600', tags: ['Figma', 'Prototyping'] },
                { name: 'Digital Marketing', image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=600', tags: ['SEO', 'Ads', 'Social'] }
            ]
        },
        'Exams': {
            label: 'Competitive Exams',
            description: 'Prepare for top entrance exams with India\'s best educators.',
            icon: <Shield className="w-5 h-5" />,
            domains: [
                { name: 'JEE Mains & Advanced', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600', tags: ['Engineering', 'IIT'] },
                { name: 'NEET', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600', tags: ['Medical', 'Doctor'] },
                { name: 'UPSC CSE', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600', tags: ['Civil Services', 'IAS'] },
                { name: 'GATE', image: 'https://images.unsplash.com/photo-1517245386807-bb43f820637c?auto=format&fit=crop&q=80&w=600', tags: ['Engineering', 'PSU'] }
            ]
        },
        'Classes': {
            label: 'School Classes',
            description: 'Build a strong foundation perfectly mapped to your syllabus.',
            icon: <GraduationCap className="w-5 h-5" />,
            domains: [
                { name: 'Class 12 - Science', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600', tags: ['PCM', 'PCB'] },
                { name: 'Class 12 - Commerce', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600', tags: ['Accounts', 'Economics'] },
                { name: 'Class 10 - Foundation', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600', tags: ['Maths', 'Science'] },
                { name: 'Olympiads', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600', tags: ['IMO', 'NSO'] }
            ]
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-x-hidden selection:bg-primary/20 selection:text-primary-dark">

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-50"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600 mb-8 animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {badgeText}
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                            {typeof heroTitle === 'string' ? <span dangerouslySetInnerHTML={{ __html: heroTitle }} /> : heroTitle}
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {heroSubtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {/* Start Learning Now Button */}
                            <Link
                                to={isAuthenticated ? '/courses' : '/register'}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-1"
                            >
                                {isAuthenticated ? 'Browse Courses' : 'Start Learning Now'}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>

                            {/* Watch Demo Button */}
                            <button
                                onClick={() => setDemoOpen(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 transition-all duration-300 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 group"
                            >
                                <div className="mr-2 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                Watch Demo
                            </button>
                        </div>

                        {/* Demo Modal */}
                        {demoOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                                    <button
                                        onClick={() => setDemoOpen(false)}
                                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <iframe
                                        className="w-full h-full"
                                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                                        title="Product Demo"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* Trusted By Strip */}
                        <div className="mt-16 pt-8 border-t border-slate-200/60">
                            <p className="text-sm font-medium text-slate-500 mb-6">Trusted by learners from top companies</p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                {['Google', 'Microsoft', 'Amazon', 'Spotify', 'Netflix'].map(brand => (
                                    <span key={brand} className="text-xl font-bold font-display text-slate-400 hover:text-slate-800 transition-colors cursor-default">{brand}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Domain Explorer Section (Moved Up) */}
            <section id="courses" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-4">Explore Learning Paths</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Select your goal to find the perfect courses for you.</p>
                    </div>

                    {/* Section Selector Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {Object.keys(sections).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={`px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 border flex items-center gap-3 ${activeSection === key
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {sections[key].icon}
                                {sections[key].label}
                            </button>
                        ))}
                    </div>

                    {/* Active Section Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col items-center mb-12 text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{sections[activeSection].label}</h3>
                            <p className="text-slate-500">{sections[activeSection].description}</p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sections[activeSection].domains.map((domain, idx) => (
                                <Link
                                    key={idx}
                                    to={`/courses?category=${domain.name}`}
                                    className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block h-80"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={domain.image}
                                            alt={domain.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h4 className="font-bold text-white text-lg mb-1 shadow-sm">{domain.name}</h4>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {domain.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center text-xs text-slate-500 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                                                Live Batches
                                            </div>
                                            <span className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Link to="/courses" className="inline-flex items-center font-bold text-primary group">
                                View all {sections[activeSection].label}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Bento Grid (Moved Down) */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-primary font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
                        <h2 className="mt-2 text-3xl lg:text-4xl font-display font-bold text-slate-900">Everything you need to succeed</h2>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Feature 1: Live Classes */}
                        {showLiveClasses && (
                            <Link to="/live-classes" className={`${showResources && showMentorship ? "md:col-span-2" : "md:col-span-3"} row-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span> LIVE
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Live Interactive Classes</h3>
                                    <p className="text-slate-500 max-w-md mb-6">Join sessions with industry experts, ask doubts in real-time.</p>
                                </div>
                            </Link>
                        )}


                        {/* Feature 4: Certification (Tall, Right Side, Row Span 2) - Non-clickable, Visual Only */}
                        <div className="md:col-span-1 md:row-span-2 bg-white rounded-3xl p-1 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50"></div>

                            {/* Decorative Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            <div className="relative h-full flex flex-col p-7">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl w-fit mb-4">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Recognized Certification</h3>
                                <p className="text-slate-500 mb-8 text-sm leading-relaxed">Showcase your skills with credentials that employers trust.</p>

                                {/* Realistic Certificate Visual */}
                                <div className="mt-auto relative w-full aspect-[1/0.7] bg-white border-2 border-slate-200 p-2 shadow-xl transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500">
                                    <div className="h-full w-full border border-slate-300 relative flex flex-col items-center justify-center p-4 bg-[#fffcf5]">
                                        {/* Corner Decorations */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-900/20"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-900/20"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-900/20"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-900/20"></div>

                                        {/* Certificate Content */}
                                        <div className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Certificate of Completion</div>
                                        <div className="text-xs font-serif font-bold text-slate-900 mb-2 italic">Full Stack Development</div>
                                        <div className="h-px w-1/2 bg-slate-200 mb-3"></div>

                                        <div className="flex justify-between w-full items-end mt-2 px-2">
                                            <div className="flex flex-col items-center">
                                                <div className="font-Qwigley text-lg text-indigo-900 leading-3">EduPlatform</div>
                                            </div>
                                            {/* Gold Seal */}
                                            <div className="relative">
                                                <div className="h-10 w-10 text-yellow-500 rounded-full border-2 border-yellow-500 flex items-center justify-center relative z-10 bg-[#fffcf5]">
                                                    <Star className="w-5 h-5 fill-current" />
                                                </div>
                                                <div className="absolute top-1 right-1 h-10 w-10 bg-yellow-200 rounded-full -z-10 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* "Get Certified" Badge - Visual Only */}
                                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <div className="flex -space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">IBM</div>
                                        <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">MS</div>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wide">Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Resource Library */}
                        {showResources && (
                            <Link to="/resources" className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:rotate-12 transition-transform">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            Free Access
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Resource Library</h3>
                                    <p className="text-slate-500 text-sm mb-4">Lecture notes, code snippets, and assignment solutions.</p>
                                </div>
                            </Link>
                        )}

                        {/* Feature 2: Mentorship */}
                        {showMentorship && (
                            <Link to="/mentorship" className="bg-slate-900 rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-sm">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">1-on-1 Mentorship</h3>
                                    <p className="text-slate-400 text-sm mb-6">Get unblocked instantly regarding any topic.</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                                    alt="Students learning"
                                    className="w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }}></div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="font-bold">10k+ Students</p>
                                            <p className="text-xs text-slate-300">Joined this month</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-float hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                        <Award className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Expert Instructors</p>
                                        <p className="text-xs text-slate-500">Learn from the best</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative blobs */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <span className="text-primary font-semibold tracking-wider uppercase text-sm">About Us</span>
                            <h2 className="mt-2 text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-6">
                                We're Building the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">University of the Future</span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Traditional education often lags behind industry trends. We close that gap. Our curriculum is co-creted with tech giants to ensure you learn exactly what employers need today.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Curriculum updated weekly based on market trends',
                                    'Project-based learning methodology',
                                    'Career support until you get hired'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            <CheckCircle className="h-3 w-3" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/about-us" className="text-primary font-bold hover:text-primary-dark inline-flex items-center group">
                                Read our full story <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials (Marquee) */}
            <section className="py-20 bg-slate-50 border-y border-slate-200 overflow-hidden">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">What Our Students Say</h2>
                </div>

                <div className="relative flex overflow-x-hidden group">
                    <div className="animate-marquee whitespace-nowrap flex gap-6 py-4">
                        {[1, 2, 3, 4, 1, 2, 3, 4].map((item, idx) => (
                            <div key={idx} className="w-[400px] flex-shrink-0 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mx-2 hover:shadow-md transition-shadow cursor-default whitespace-normal">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${idx + 20})` }}></div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Alex Johnson</h4>
                                        <p className="text-xs text-slate-500">Software Engineer at TechCorp</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 italic">"The course structure was amazing. I went from knowing nothing to building full-stack apps in 3 months. Highly recommended!"</p>
                                <div className="flex gap-1 mt-4 text-orange-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to start your journey?</h2>
                    <p className="text-xl text-slate-300 mb-10">Join thousands of students who are already learning on our platform. Your future starts here.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 transition-all duration-200 bg-emerald-400 hover:bg-emerald-300 rounded-full shadow-lg shadow-emerald-500/20 hover:-translate-y-1"
                        >
                            Get Started for Free
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 hover:bg-white/20 rounded-full backdrop-blur-sm"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
